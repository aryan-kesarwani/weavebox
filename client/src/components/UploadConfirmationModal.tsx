import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUpload, FiImage } from 'react-icons/fi';

interface UploadConfirmationModalProps {
  selectedFiles: any[];
  onConfirm: () => void;
  onCancel: () => void;
  onCompressImages?: () => void;
}

const UploadConfirmationModal = ({ selectedFiles, onConfirm, onCancel, onCompressImages }: UploadConfirmationModalProps) => {
  const [totalSize, setTotalSize] = useState(0);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [hasImages, setHasImages] = useState(false);

  useEffect(() => {
    // Calculate total size
    const size = selectedFiles.reduce((acc, file) => {
      const fileSize = file.size ? parseInt(file.size) : 0;
      return acc + fileSize;
    }, 0);
    setTotalSize(size);

    // Check if there are any images
    const images = selectedFiles.filter(file => 
      file.type?.startsWith('image/') || 
      file.mimeType?.startsWith('image/') ||
      file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    setHasImages(images.length > 0);

    // Calculate estimated price (simplified)
    const estimatedArweavePrice = size * 0.00000002; // Simplified price estimate
    setEstimatedPrice(estimatedArweavePrice);
  }, [selectedFiles]);

  // Format file size from bytes to KB, MB, GB etc.
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Confirm Upload to Arweave
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Files:</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-500 dark:text-gray-400">Total Size:</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {formatFileSize(totalSize)}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-500 dark:text-gray-400">Estimated Cost:</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {estimatedPrice.toFixed(8)} AR
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Files will be uploaded to Arweave permanently. This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            {hasImages && onCompressImages && (
              <button
                onClick={onCompressImages}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <FiImage className="mr-2" />
                Compress Images
              </button>
            )}
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FiUpload className="mr-2" />
              Confirm Upload
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadConfirmationModal;