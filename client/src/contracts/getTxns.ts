import axios from 'axios';



interface GraphQLResponse {
  data: {
    transactions: {
      edges: Array<{
        node: {
          id: string;
          block: {
            height: number;
            timestamp: number;
          };
        };
      }>;
    };
  };
}

export const getTxns = async () => {
  const query = `{
    transactions(
      tags: [
        { name: "Wallet-Address", values: ["X1eaByYsceY-fVzlHubyLAFeH5IYckL1emmDayCSe0A"] }
      ]
      first: 10
    ) {
      edges {
        node {
           id
        tags {
          name
          value
        }
        }
      }
    }
  }`;
  
  const result = await axios.post<GraphQLResponse>('https://arnode.asia/graphql', { query });
  console.log(result.data.data.transactions.edges);
  return result.data.data.transactions.edges;
}

// import { useSelector } from "react-redux";
// import { RootState } from "../redux/store";

// const userAddress = useSelector((state: RootState) => state.arConnectionState.userAddress);

// export const getTxns = async () => {
// const query = {
//     query: `
//       query {
//         transactions(owners: ["${userAddress}"]) {
//           edges {
//             node {
//               id
//               tags {
//                 name
//                 value
//               }
//               data {
//                 size
//                 type
//               }
//             }
//           }
//         }
//       }
//     `
//   };
  
//   const response = await fetch('https://arweave.net/graphql', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(query),
//   });
//   const { data } = await response.json();
//   const transactions = data.transactions.edges.map((edge: any) => edge.node);
//   return transactions;
// }

// export default getTxns;
