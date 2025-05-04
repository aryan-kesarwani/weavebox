import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useArweaveWallet, useDarkMode} from '../utils/util';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { storeFile } from '../utils/fileStorage';
import Navbar from '../components/Navbar';
import { uploadArweave } from '../utils/turbo';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component



const Upload = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { userAddress } = useArweaveWallet();
  const { darkMode } = useDarkMode();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      const fileSize = acceptedFiles[0].size;
      const price = fileSize < 100 * 1024 ? 0 : (fileSize / 1000000) * 0.1;
      setPriceEstimate(`$${price.toFixed(4)}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/*': ['.pdf', '.doc', '.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav'],
    }
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {

      // Request necessary permissions
      await window.arweaveWallet.connect(['ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'SIGNATURE']);
      
      // Store the file in IndexedDB
      await storeFile(selectedFile, userAddress || '');
      
      // Upload to Arweave
      await uploadArweave();
      
      setUploadProgress(100);
      

      toast.success('File uploaded successfully!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setSelectedFile(null);
      setPriceEstimate(null);

      setTimeout(() => {
        navigate('/uploads');
      }, 1500);

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.', {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      setSelectedFile(null);
      setPriceEstimate(null);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <ToastContainer theme={darkMode ? 'dark' : 'light'} />
      
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentPage="upload"
      />

      <Sidebar isSidebarOpen={isSidebarOpen} currentPage="upload" />

      <div className={`pt-16 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-[250px]' : 'ml-0'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Upload File to Arweave
          </h1>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
              }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <FiUpload size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {isDragActive
                  ? "Drop the file here"
                  : "Drag and drop a file here, or click to select"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supported formats: PDF, DOC, DOCX, Images, Videos, Audio
              </p>
            </div>
          </div>

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">File Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">File Name:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">File Size:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Type:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedFile.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Estimated Cost:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {priceEstimate}
                  </span>
                </div>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-right">
                    {uploadProgress}%
                  </p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? 'Uploading...' : 'Upload to Arweave'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;