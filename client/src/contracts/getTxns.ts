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


export const getTxns = async (userAddress: string) => {
  const query = `{
    transactions(
      tags: [
        { name: "Wallet-Address", values: ["${userAddress}"] }
      ]
      first: 100
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

export default getTxns;
