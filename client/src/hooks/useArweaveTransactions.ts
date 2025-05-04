//use to fetch all transactions from arweave
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export const useArweaveTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const userAddress = useSelector((state: RootState) => state.arConnectionState.userAddress);

  const fetchTransactions = useCallback(async (loadMore = false) => {
    if (!userAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching transactions for address:', userAddress);
      
      const query = {
        query: `
          query {
            transactions(
               
              first: 100,
              ${cursor ? `after: "${cursor}"` : ''},
              tags: [
                { name: "Wallet-Address", values: ["${userAddress}"] },
                { name: "Version", values: ["2.0.1"] }
              ]
            ) {
              edges {
                cursor
                node {
                  id
                  tags {
                    name
                    value
                  }
                }
              }
              pageInfo {
                hasNextPage
              }
            }
          }
        `
      };
      
      console.log('Query:', JSON.stringify(query, null, 2));
      
      const response = await fetch('https://g8way.io/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      
      const result = await response.json();
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        throw new Error(result.errors[0].message);
      }
      
      const { data } = result;
      const newTransactions = data.transactions.edges.map((edge: any) => edge.node);
      
      console.log('New transactions:', newTransactions);
      
      if (loadMore) {
        setTransactions(prev => [...prev, ...newTransactions]);
      } else {
        setTransactions(newTransactions);
      }

      const lastEdge = data.transactions.edges[data.transactions.edges.length - 1];
      setCursor(lastEdge?.cursor || null);
      setHasMore(data.transactions.pageInfo.hasNextPage);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [userAddress, cursor]);

  useEffect(() => {
    console.log('useEffect triggered with userAddress:', userAddress);
    fetchTransactions();
  }, [userAddress]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchTransactions(true);
    }
  }, [hasMore, loading, fetchTransactions]);

  return { transactions, loading, error, loadMore, hasMore };
}; 