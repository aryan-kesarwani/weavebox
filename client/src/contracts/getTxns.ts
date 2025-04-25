import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const userAddress = useSelector((state: RootState) => state.arConnectionState.userAddress);

export const getTxns = async (userAddress: string) => {
const query = {
    query: `
      query {
        transactions(owners: ["${userAddress}"]) {
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
      }
    `
  };
  
  const response = await fetch('https://arweave.net/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  const { data } = await response.json();
  const transactions = data.transactions.edges.map((edge: any) => edge.node);
  return transactions;
}

export default getTxns;
