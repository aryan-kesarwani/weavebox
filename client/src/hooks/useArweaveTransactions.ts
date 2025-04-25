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
      const query = {
        query: `
          query {
            transactions(
              owners: ["${userAddress}"], 
              first: 100,
              ${cursor ? `after: "${cursor}"` : ''}
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
      
      const response = await fetch('https://arweave.net/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      
      const { data } = await response.json();
      const newTransactions = data.transactions.edges.map((edge: any) => edge.node);
      
      if (loadMore) {
        setTransactions(prev => [...prev, ...newTransactions]);
      } else {
        setTransactions(newTransactions);
      }

      const lastEdge = data.transactions.edges[data.transactions.edges.length - 1];
      setCursor(lastEdge?.cursor || null);
      setHasMore(data.transactions.pageInfo.hasNextPage);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, cursor]);

  useEffect(() => {
    fetchTransactions();
  }, [userAddress]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchTransactions(true);
    }
  }, [hasMore, loading, fetchTransactions]);

  return { transactions, loading, error, loadMore, hasMore };
}; 