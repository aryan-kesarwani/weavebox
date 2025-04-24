import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiUpload, FiUser } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useArweaveWallet } from '../utils/util';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Upload = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { userAddress, handleDisconnect } = useArweaveWallet();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      // Calculate price estimate
      const fileSize = acceptedFiles[0].size;
      // Show 0 AR for files less than 100KB
      const price = fileSize < 100 * 1024 ? 0 : (fileSize / 1000000) * 0.1; // $0.1 per MB for files >= 100KB
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

  const handleDisconnectWallet = () => {
    handleDisconnect();
    navigate('/');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress (replace with actual Arweave upload)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast.success('File uploaded successfully!', {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <ToastContainer />
      {/* Navbar - Same as Dashboard */}
      <nav className="fixed w-full bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <Link to="/" className="ml-4 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                WeaveBox
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FiUser size={20} />
                  <span className="hidden md:inline">{userAddress?.slice(0, 6)}...</span>
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Wallet Address</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{userAddress}</p>
                    </div>
                    <button
                      onClick={handleDisconnectWallet}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Upload File to Arweave
          </h1>

          {/* Drag and Drop Area */}
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

          {/* File Details and Price Estimate */}
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-4">File Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">File Name:</span>
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">File Size:</span>
                  <span className="font-medium">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Type:</span>
                  <span className="font-medium">{selectedFile.type}</span>
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