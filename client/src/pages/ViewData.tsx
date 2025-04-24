import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import getTxns from '../contract/getTxns';

const userAddress = useSelector((state: RootState) => state.arConnectionState.userAddress);

interface Tag {
  name: string;
  value: string;
}

interface Transaction {
  id: string;
  tags: Tag[];
}

interface ArweaveTxnsProps {
    userAddress: string;
}

const ArweaveTxns: React.FC<ArweaveTxnsProps> = ({ userAddress }) => {
    const [txns, setTxns] = useState<Transaction[]>([]);
    
    useEffect(() => {
        if (userAddress) {
            getTxns();
          }
        }, [userAddress])

  return (
    <div>
      {txns.map((tx) => {
        const contentType = tx.tags.find((tag) => tag.name === 'Content-Type')?.value;
        const isImage = contentType?.startsWith('image/');
        const isVideo = contentType?.startsWith('video/');
        const url = `https://arweave.net/${tx.id}`;

        return (
          <div key={tx.id} style={{ marginBottom: '2rem' }}>
            <h4>Transaction ID: {tx.id}</h4>
            <div>
              {isImage && <img src={url} alt="Arweave content" style={{ maxWidth: 400 }} />}
              {isVideo && <video controls src={url} style={{ maxWidth: 400 }} />}
              {!isImage && !isVideo && (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  View Content
                </a>
              )}
            </div>
            <div>
              <strong>Metadata:</strong>
              <ul>
                {tx.tags.map((tag) => (
                  <li key={tag.name}>
                    {tag.name}: {tag.value}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ArweaveTxns;