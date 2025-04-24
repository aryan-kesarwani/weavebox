import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiX } from 'react-icons/fi';

interface UploadProgressBarProps {
  visible: boolean;
  progress: number;
  fileName: string;
  fileCount: number;
  currentFileIndex: number;
  isComplete: boolean;
  onClose: () => void;
}

const UploadProgressBar = ({
  visible,
  progress,
  fileName,
  fileCount,
  currentFileIndex,
  isComplete,
  onClose
}: UploadProgressBarProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50"
        >
          {isComplete ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Upload Complete
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fileCount} {fileCount === 1 ? 'file' : 'files'} uploaded successfully
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <FiX size={18} />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Uploading to Arweave
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fileName} ({currentFileIndex} of {fileCount})
                  </p>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadProgressBar;