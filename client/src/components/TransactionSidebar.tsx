import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFile, FiImage, FiDownload } from 'react-icons/fi';

interface TransactionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: any[];
  isLoading: boolean;
}

const TransactionSidebar = ({ isOpen, onClose, transactions, isLoading }: TransactionSidebarProps) => {
  const getFileIcon = (contentType: string) => {
    if (contentType.includes('image/')) {
      return <FiImage className="w-5 h-5 text-blue-500" />;
    }
    return <FiFile className="w-5 h-5 text-gray-500" />;
  };

  const getContentType = (tags: any[]) => {
    const contentTypeTag = tags.find(tag => tag.name === 'Content-Type');
    return contentTypeTag ? contentTypeTag.value : 'Unknown';
  };

  const getFileExtension = (tags: any[]) => {
    const extensionTag = tags.find(tag => tag.name === 'File-Extension');
    return extensionTag ? extensionTag.value : '';
  };

  const getWalletAddress = (tags: any[]) => {
    const walletTag = tags.find(tag => tag.name === 'Wallet-Address');
    return walletTag ? walletTag.value : '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No transactions found
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((txn, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(getContentType(txn.node.tags))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-medium text-gray-900 dark:text-white break-all">
                            {txn.node.id}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <div>Type: {getContentType(txn.node.tags)}</div>
                          <div>Extension: {getFileExtension(txn.node.tags)}</div>
                          <div>Wallet: {getWalletAddress(txn.node.tags).slice(0, 8)}...{getWalletAddress(txn.node.tags).slice(-8)}</div>
                        </div>
                        <div className="mt-2">
                          <a
                            href={`https://arweave.net/${txn.node.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <FiDownload className="w-3 h-3 mr-1" />
                            View on Arweave
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionSidebar; 