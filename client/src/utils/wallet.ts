import { arweave } from "../apis/initialiseArweave"
import { JWKInterface } from 'arweave/node/lib/wallet';
import { setWalletKey, setUserAddress } from "../redux/slices/arConnectionSlice";
import store from "../redux/store";
// import fetch from 'node-fetch'; //NOTE THIS LINE CRASHED THE UI NOT VISIBLE TO BROWSER


export const createWallet = async () => {
    
   try { 
    const arweaveInstance = await arweave;
    const key = await arweaveInstance.wallets.generate();
    
    // Log the key properly
    console.log("Key is generated:", JSON.stringify(key));
    
    store.dispatch(setWalletKey(key));
    // Uncomment to enable auto download
    downloadKey(key);
    
    // Get the wallet address to confirm
    const address = await arweaveInstance.wallets.getAddress(key);
    console.log("Wallet address:", address);
    
    // Mint tokens for local development (only works on arlocal)
    await mintArLocalTokens(address);
    
    return {key, address};
   } catch (error) {
    console.error("Error creating wallet:", error);
    alert("Failed to create wallet. Make sure arLocal is running on port 1984.");
    return null;
   }
}

export const mintArLocalTokens = async (address : string) => {
    try {
        console.log("Minting tokens for address:", address);
        const response = await fetch(`http://localhost:1984/mint/${address}/1000000000000000`);
        
        if(!response.ok) {
            const errorText = await response.text();
            console.error("Mint response not OK:", response.status, errorText);
            throw new Error(`Failed to mint tokens: ${response.status} ${errorText}`);
        }
        
        try {
            const data = await response.json();
            console.log("Tokens minted successfully:", data);
            return true;
        } catch (jsonError) {
            // Some versions of ArLocal don't return JSON
            console.log("Tokens minted successfully (no JSON response)");
            return true;
        }
    } catch (error) {
        console.error("Error minting tokens:", error);
        return false;
    }
}

export const checkWalletBalance = async (address : string) => {
    try {
        const arweaveInstance = await arweave;

        const winstonBalance = await arweaveInstance.wallets.getBalance(address);
        console.log("Raw winston balance:", winstonBalance);
        const balance = arweaveInstance.ar.winstonToAr(winstonBalance);
        console.log("Wallet balance in AR:", balance);
        
        return balance;
    } catch (error) {
        console.error("Error checking wallet balance:", error);
        return "0";
    }
}

export const getWalletAddress = async (key: JWKInterface) => {
    try {
        const arweaveInstance = await arweave;
        const address = await arweaveInstance.wallets.getAddress(key);
        return address;
    } catch (error) {
        console.error("Error getting wallet address:", error);
        return null;
    }
}

// interface ProfileData {
//     walletAddress : string,
//     fullName : string,
//     username : string,
//     interests : string[],
// }

export const createTransaction = async (profileData : any, key : JWKInterface) => {
    try {
        // if (!key || !profileData) {
        //     console.error("Missing key or profile data");
        //     return null;
        // }
         const balance = await checkWalletBalance(profileData.walletAddress);
        if (balance === "0") {
            console.log("Attempting to mint tokens for this wallet...");
            await mintArLocalTokens(profileData.walletAddress);
            // Check balance again
            const newBalance = await checkWalletBalance(profileData.walletAddress);
            if (newBalance === "0") {
                throw new Error("Wallet has no tokens. Please fund your wallet.");
            }
        }

        const arweaveInstance = await arweave;
        // Check if key is in the correct format
        console.log("Key format check:", {
            d: !!key.d, // Private key exists
            n: !!key.n, // Modulus exists
            hasP: !!key.p, // Has prime factor
            hasE: !!key.e, // Has exponent
        });
        
        // Create transaction with data only
        const txn = await arweaveInstance.createTransaction({
            data: JSON.stringify(profileData)
        }, key);
        
        if (!txn) {
            console.error("Failed to create transaction");
            return null;
        }
        
        // Add tags
        txn.addTag('Content-Type', 'application/json');
        txn.addTag('App-Name', 'CurioWewave');
        
        
        console.log("Transaction created:", txn);
        
        try {
            // Sign transaction
            console.log("About to sign transaction with key...");
            await arweaveInstance.transactions.sign(txn, key);
            console.log("Transaction signed");
            console.log("Transaction signature:", txn.signature);
            
            if (!txn.signature) {
                throw new Error("Transaction signing failed - no signature generated");
            }
            
            // Post transaction
            console.log("Posting transaction...");
            const response = await arweaveInstance.transactions.post(txn);
            console.log("Transaction submitted with status:", response.status);
            
            if (response.status !== 200 && response.status !== 202) {
                console.error("Transaction failed with status:", response.status);
                return null;
            }
            
            return response;
        } catch (signError) {
            console.error("Error during signing or posting:", signError);
            // Try manual verification to check key format
            try {
                const address = await arweaveInstance.wallets.getAddress(key);
                console.log("Key resolves to address:", address);
                console.log("Key appears valid but signing failed");
            } catch (verifyError) {
                console.error("Key verification also failed:", verifyError);
                console.log("Key format may be invalid");
            }
            return null;
        }
    } catch (error) {
        console.error("Error creating transaction:", error);
        return null;
    }
}

export const downloadKey = (key: JWKInterface) => {
    try {
        const keyString = JSON.stringify(key);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(keyString);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "arweave-key.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    } catch (error) {
        console.error("Error downloading key:", error);
    }
}

interface RawTransaction {
    id: string;
    owner: {
      address: string;
    };
    tags: Array<{
      name: string;
      value: string;
    }>;
    block: {
      height: number;
      timestamp: number;
    } | null;
    quantity: {
      ar: string;
    };
    recipient: string;
    data: {
      size: string;
    };
  }

interface ProcessedTransaction {
  id: string;
  type: string;
  amount: string;
  recipient: string;
  sender: string;
  timestamp: string;
  status: string;
  tags: Array<{
    name: string;
    value: string;
  }>;
  dataSize: string;
}

interface GraphQLResponse {
  data: {
    transactions: {
      edges: Array<{
        node: RawTransaction;
      }>;
    };
  };
}

export const getAllTransactions = async (address: string, limit: number = 10): Promise<ProcessedTransaction[]> => {
  try {
    // Simplified GraphQL query - using a more basic structure that's compatible with ArLocal
    const query = {
      query: `{
        transactions(
          first: ${limit}
        ) {
          edges {
            node {
              id
              owner {
                address
              }
              recipient
              tags {
                name
                value
              }
              block {
                height
                timestamp
              }
              quantity {
                ar
              }
              data {
                size
              }
            }
          }
        }
      }`
    };

    console.log("Sending GraphQL query:", JSON.stringify(query));

    const response = await fetch('http://localhost:1984/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });

    console.log("GraphQL response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("GraphQL error response:", errorText);
      throw new Error(`GraphQL request failed with status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json() as GraphQLResponse;
    console.log("GraphQL response:", result);
    
    if (!result.data?.transactions?.edges) {
      console.error('Unexpected GraphQL response format:', result);
      return [];
    }

    // Helper function to safely check if a string is base64 encoded
    const isBase64 = (str: string): boolean => {
      try {
        // Check if the string matches base64 pattern
        return /^[A-Za-z0-9+/=]+$/.test(str) && str.length % 4 === 0;
      } catch (e) {
        return false;
      }
    };

    // Helper function to safely decode base64
    const safeAtob = (str: string): string => {
      try {
        if (isBase64(str)) {
          return atob(str);
        }
        return str;
      } catch (e) {
        console.log("Failed to decode:", str);
        return str;
      }
    };

    // Transform the data into a more usable format
    const transactions = result.data.transactions.edges.map(edge => {
      const tx = edge.node;
      const isOwner = tx.owner.address === address;
      const isRecipient = tx.recipient === address;
      const amount = parseFloat(tx.quantity.ar);
      
      // Determine transaction type based on tags and recipient/sender
      let type = 'Other';
      
      // Process tags without using atob directly
      const appNameTag = tx.tags.find(tag => {
        const tagName = safeAtob(tag.name);
        return tagName === 'App-Name' || tagName === 'app-name';
      });
      
      const contentTypeTag = tx.tags.find(tag => {
        const tagName = safeAtob(tag.name);
        return tagName === 'Content-Type' || tagName === 'content-type';
      });
      
      if (appNameTag) {
        const appNameValue = safeAtob(appNameTag.value);
        
        if (appNameValue === 'CurioWewave') {
          // Default to Content Upload for CurioWewave app
          type = 'Content Upload';
          
          if (contentTypeTag) {
            const contentTypeValue = safeAtob(contentTypeTag.value);
            
            // Check for application/json content type which could be profile related
            if (contentTypeValue === 'application/json') {
              // Special case for profiles
              const profileTags = ['App-Name', 'username', 'fullName', 'interests'];
              const isProfileCreation = tx.tags.some(tag => {
                const tagName = safeAtob(tag.name);
                return profileTags.includes(tagName);
              });
              
              if (isProfileCreation) {
                type = 'Profile Creation';
              }
            }
          }
        }
      } else if (amount > 0) {
        // This is a token transfer
        if (isOwner && !isRecipient) {
          type = 'Sent';
        } else if (!isOwner && isRecipient) {
          type = 'Received';
        }
      }

      // Format timestamp - handle null block case
      let timestamp = 'Pending';
      let status = 'Pending';
      if (tx.block && tx.block.timestamp) {
        timestamp = new Date(tx.block.timestamp * 1000).toLocaleString();
        status = 'Completed';
      }

      return {
        id: tx.id,
        type,
        amount: amount > 0 ? `${amount} AR` : '0 AR',
        recipient: tx.recipient || 'N/A',
        sender: tx.owner.address,
        timestamp,
        status,
        tags: tx.tags,
        dataSize: tx.data?.size?.toString() || "0"
      };
    });

    // Filter out transactions not related to the specified address
    const relevantTransactions = transactions.filter(tx => 
      tx.sender === address || tx.recipient === address
    );

    // Remove duplicates and sort by timestamp (pending first, then by time)
    const uniqueTransactions = relevantTransactions.reduce((acc: ProcessedTransaction[], current) => {
      // Only add if it's a different transaction ID or different type
      const exists = acc.find(tx => tx.id === current.id && tx.type === current.type);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Sort transactions: pending first, then by timestamp
    return uniqueTransactions.sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return 0;
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

interface Tag {
  name: string;
  value: string;
}

interface TransactionNode {
  id: string;
  owner: {
    address: string;
  };
  tags: Tag[];
  data: {
    size: string;
  };
}

interface TransactionEdge {
  node: TransactionNode;
}

interface UserSignInResponse {
  data: {
    transactions: {
      edges: TransactionEdge[];
    };
  };
}

export const userSignIn = async (walletAddress: string, username: string): Promise<boolean> => {
  try {
    console.log("Attempting to sign in with:", { walletAddress, username });
    
    // Create GraphQL query to find profile transactions with the matching address and username
    const query = {
      query: `{
        transactions(
          owners: ["${walletAddress}"]
        ) {
          edges {
            node {
              id
              owner {
                address
              }
              tags {
                name
                value
              }
              data {
                size
              }
            }
          }
        }
      }`
    };

    console.log("Sending GraphQL query to find user:", JSON.stringify(query));

    const response = await fetch('http://localhost:1984/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GraphQL error response:", errorText);
      return false;
    }

    const result = await response.json() as UserSignInResponse;
    console.log("GraphQL response for user search:", result);
    
    if (!result.data?.transactions?.edges) {
      console.error('Unexpected GraphQL response format:', result);
      return false;
    }

    // Helper function to safely get tag value
    const safeGetTagValue = (str: string): string => {
      try {
        // In ArLocal, tags are not base64 encoded
        return str;
      } catch (e) {
        console.log("Using original tag value:", str);
        return str;
      }
    };
    
    console.log("Found transactions:", result.data.transactions.edges.length);
    
    // Debug: Print all transactions and their tags
    result.data.transactions.edges.forEach((edge, i) => {
      console.log(`Transaction ${i}:`, edge.node.id);
      console.log(`Tags for transaction ${i}:`);
      edge.node.tags.forEach(tag => {
        const rawName = tag.name;
        const rawValue = tag.value;
        console.log(`- Raw tag: ${rawName} = ${rawValue}`);
        console.log(`- Processed tag: ${safeGetTagValue(rawName)} = ${safeGetTagValue(rawValue)}`);
      });
    });

    // Find transactions that are profile creations
    const profileTransactions = result.data.transactions.edges.filter((edge: TransactionEdge) => {
      const tx = edge.node;
      
      // Check all tags to find App-Name and Content-Type
      let isAppNameMatch = false;
      let isContentTypeMatch = false;
      
      for (const tag of tx.tags) {
        const tagName = safeGetTagValue(tag.name);
        const tagValue = safeGetTagValue(tag.value);
        
        console.log(`Checking tag: ${tagName} = ${tagValue}`);
        
        // Check for App-Name tag
        if (tagName === 'App-Name' || tagName === 'app-name') {
          if (tagValue === 'CurioWewave') {
            console.log("Found matching App-Name tag");
            isAppNameMatch = true;
          }
        }
        
        // Check for Content-Type tag
        if (tagName === 'Content-Type' || tagName === 'content-type') {
          if (tagValue === 'application/json') {
            console.log("Found matching Content-Type tag");
            isContentTypeMatch = true;
          }
        }
      }
      
      const isProfileTransaction = isAppNameMatch && isContentTypeMatch;
      console.log(`Transaction ${tx.id} is profile transaction:`, isProfileTransaction);
      
      return isProfileTransaction;
    });

    console.log("Found profile transactions:", profileTransactions.length);

    if (profileTransactions.length === 0) {
      console.log("No profile transactions found for address:", walletAddress);
      return false;
    }

    // For each profile transaction, fetch and check the data
    for (const txEdge of profileTransactions) {
      const txId = txEdge.node.id;
      
      console.log("Fetching data for transaction:", txId);
      
      try {
        // Fetch the transaction data
        const arweaveInstance = await arweave;
        const txData = await arweaveInstance.transactions.getData(txId, {
          decode: true,
          string: true
        });
        
        if (!txData) {
          console.log("No data found for transaction:", txId);
          continue;
        }
        
        console.log("Transaction data:", txData);
        
        try {
          const profileData = JSON.parse(txData as string);
          console.log("Parsed profile data:", profileData);
          
          // Check if username matches
          if (profileData.username === username) {
            console.log("Found matching profile for wallet address and username!");
            
            // Update Redux store with the user's address
            store.dispatch(setUserAddress(walletAddress));
            
            return true;
          } else {
            console.log("Username doesn't match:", profileData.username, "vs", username);
          }
        } catch (parseError) {
          console.error("Error parsing profile data:", parseError);
          continue;
        }
      } catch (dataError) {
        console.error("Error fetching transaction data:", dataError);
        continue;
      }
    }
    
    // If we got here, no matching profile was found
    console.log("No matching profile found for the given username and wallet address");
    return false;
  } catch (error) {
    console.error("Error in user sign in:", error);
    return false;
  }
};

// if using Node.js

// interface GraphQLResponse {
//   data: {
//     transactions: {
//       edges: Array<{
//         node: {
//           id: string;
//           recipient: string;
//           quantity: {
//             ar: string;
//           };
//           tags: Array<{
//             name: string;
//             value: string;
//           }>;
//           block: {
//             timestamp: number;
//             height: number;
//           };
//         };
//       }>;
//     };
//   };
// }

// export const getTransactions = async (address: string) => {
//   try {
//     const query = {
//       query: `
//         query {
//           transactions(owners: ["${address}"], first: 100) {
//             edges {
//               node {
//                 id
//                 recipient
//                 quantity {
//                   ar
//                 }
//                 tags {
//                   name
//                   value
//                 }
//                 block {
//                   timestamp
//                   height
//                 }
//               }
//             }
//           }
//         }
//       `
//     };

//     const response = await fetch('http://localhost:1984/graphql', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(query)
//     });

//     if (!response.ok) {
//       console.error('GraphQL request failed with status:', response.status);
//       return [];
//     }

//     const result = await response.json() as GraphQLResponse;
//     if (!result.data || !result.data.transactions || !result.data.transactions.edges) {
//       console.error('Unexpected GraphQL response format:', result);
//       return [];
//     }
    
//     const transactions = result.data.transactions.edges.map(edge => edge.node);
//     return transactions;
//   } catch (error) {
//     console.error('Error fetching transactions:', error);
//     return [];
//   }
// }

