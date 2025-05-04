import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiImage, FiVideo, FiFolder, FiFolderPlus, FiArrowRight, FiFile, FiMusic, FiDownload, FiExternalLink, FiCopy, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useArweaveWallet, useDarkMode } from '../utils/util';
import { toast } from 'react-toastify';
import { getStoredFiles, StoredFile } from '../utils/fileStorage';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
// import API from '../globals/axiosConfig';
// import accessDriveFiles from '../googleAuths/accessDriveFiles';
import 'react-toastify/dist/ReactToastify.css';

// Declare the google namespace for TypeScript
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

// interface GoogleDriveFile {
//   id: string;
//   name: string;
//   mimeType: string;
// }

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFileDetails, setSelectedFileDetails] = useState<number | null>(null);
  const [fileDetailModal, setFileDetailModal] = useState<number | null>(null);
  const [previewModal, setPreviewModal] = useState<number | null>(null);
  // const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const navigate = useNavigate();
  const { userAddress} = useArweaveWallet();
  const { darkMode } = useDarkMode();

  const [recentFiles, setRecentFiles] = useState<StoredFile[]>([]);

  // Check wallet connection and redirect if disconnected
  useEffect(() => {
    if (!userAddress) {
      navigate('/');
    }
  }, [userAddress, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Load Google OAuth2 script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        selectedFileDetails !== null &&
        e.target instanceof Element && !e.target.closest('.file-menu-button') &&
        !e.target.closest('.file-menu-dropdown')
      ) {
        setSelectedFileDetails(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedFileDetails]);

  useEffect(() => {
    // Load files from IndexedDB
    const loadFiles = async () => {
      const storedFiles = await getStoredFiles();
      // Only show the 4 most recent files
      setRecentFiles(storedFiles.slice(0, 4));
    };
    
    loadFiles();
    
    // Clean up object URLs when component unmounts
    return () => {
      recentFiles.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, []);

  useEffect(() => {
    const connected = localStorage.getItem('google_connected') === 'true';
    setIsGoogleConnected(connected);
  }, []);

  const handleGoogleLogin = () => {
    // Initialize Google OAuth2 client
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive',
      callback: async (response: { access_token: string }) => {
        console.log('Token', response.access_token);
        if (response.access_token) {
          try {
            // Store the token in localStorage for GoogleDrive page to use
            localStorage.setItem('google_access_token', response.access_token);
            
            // Store the time when token was obtained
            localStorage.setItem('google_token_timestamp', Date.now().toString());
            
            // Set Google user as logged in
            localStorage.setItem('google_connected', 'true');
            
            // Redirect to Google Drive page
            navigate('/google-drive');
          } catch (error) {
            console.error('Error during login:', error);
            alert('Failed to connect to Google Drive. Please try again.');
          }
        }
      },
    });

    // Request access token
    client.requestAccessToken();
  };

  // const handleDisconnectWallet = () => {
  //   handleDisconnect();
  //   navigate('/');
  // };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'image':
        return <FiImage size={24} className="text-blue-500" />;
      case 'video':
        return <FiVideo size={24} className="text-purple-500" />;
      case 'audio':
        return <FiMusic size={24} className="text-pink-500" />;
      default:
        return <FiFile size={24} className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Use the Navbar component */}
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentPage="dashboard"
      />

      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} currentPage="dashboard" />

      {/* Main Content */}
      <div className={`pt-16 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-[250px]' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Enhanced Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Welcome to WeaveBox
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your gateway to permanent, decentralized storage on Arweave.
            </p>
          </div>
          
          {/* Enhanced Upload Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Local Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiUpload size={40} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Upload from Device</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Upload From Local Device.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/upload')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  Upload Files
                </motion.button>
              </div>
            </motion.div>

            {/* Google Drive Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiFolderPlus size={40} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Import from Google Drive</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Connect your Google Drive account to import and permanently store your files on Arweave.
                </p>
                <motion.button
                  onClick={isGoogleConnected ? () => navigate('/google-drive') : handleGoogleLogin}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {isGoogleConnected ? 'View Drive' : 'Connect Google Drive'}
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Recent Files Section */}
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Files</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {recentFiles.length} {recentFiles.length === 1 ? 'file' : 'files'}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/uploads')}
                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <span>View All</span>
                <FiArrowRight size={16} />
              </motion.button>
            </div>
            
            {recentFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recentFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer relative group"
                  >
                    {/* Three dots menu */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFileDetails(file.id !== undefined && selectedFileDetails === file.id ? null : file.id ?? null);
                      }}
                      className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white file-menu-button transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

                    {/* File Preview */}
                    <div 
                      className="relative h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={() => setPreviewModal(file.id ?? null)}
                    >
                      {file.type === 'image' ? (
                        <img 
                          src={file.url} 
                          alt={file.name} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          {getFileIcon(file.type)}
                          <span className="text-xs mt-2 uppercase text-gray-500 dark:text-gray-400">
                            {file.name.split('.').pop()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                        {file.name}
                      </h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {file.date}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {file.size}
                        </span>
                      </div>
                    </div>

                    {/* File Actions Dropdown */}
                    {selectedFileDetails === file.id && (
                      <div className="absolute top-12 right-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-30 border border-gray-200 dark:border-gray-700 file-menu-dropdown">
                        <div className="py-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFileDetails(null);
                              setFileDetailModal(file.id ?? null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            View Details
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = file.url || `https://arweave.net/${file.txHash}`;
                              link.download = file.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              setSelectedFileDetails(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"
                          >
                            <FiDownload className="w-4 h-4 mr-2" />
                            Download
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFileDetails(null);
                              setPreviewModal(file.id ?? null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"
                          >
                            <FiExternalLink className="w-4 h-4 mr-2" />
                            View File
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(`https://arweave.net/${file.txHash}`);
                              toast.success('URL copied to clipboard');
                              setSelectedFileDetails(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"
                          >
                            <FiCopy className="w-4 h-4 mr-2" />
                            Copy URL
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    <FiFolder size={40} className="text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No files uploaded yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">
                    Upload some files to see them here
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/upload')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Upload Your First File
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* File Details Modal */}
      {fileDetailModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 relative">
            <button 
              onClick={() => setFileDetailModal(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FiX size={24} />
            </button>
            
            {recentFiles.map(file => file.id === fileDetailModal && (
              <div key={file.id}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {file.name}
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">File Name</p>
                        <p className="font-medium text-gray-900 dark:text-white break-all">{file.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded On</p>
                        <p className="font-medium text-gray-900 dark:text-white">{file.date} at {file.time}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                        <p className="font-medium text-gray-900 dark:text-white">{file.size}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">{file.contentType || file.type}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Hash</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400 break-all">
                          {file.txHash}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Storage Status</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {file.permanentlyStored ? 'Permanently Stored' : 'Processing'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded By</p>
                        <p className="font-medium text-gray-900 dark:text-white break-all">
                          {file.uploadedBy || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Actions</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = file.url || `https://arweave.net/${file.txHash}`;
                          link.download = file.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                      >
                        <FiDownload className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button 
                        onClick={() => {
                          setFileDetailModal(null);
                          setPreviewModal(file.id ?? null);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 flex items-center"
                      >
                        <FiExternalLink className="w-4 h-4 mr-2" />
                        View File
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://arweave.net/${file.txHash}`);
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
                      >
                        <FiCopy className="w-4 h-4 mr-2" />
                        Copy URL
                      </button>
                      <button 
                        onClick={() => window.open(`https://viewblock.io/arweave/tx/${file.txHash}`, '_blank')}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        View Transaction
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Modal - Google Drive Style */}
      <AnimatePresence>
        {previewModal !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-4/5 h-4/5 max-w-5xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with file name and close button */}
              <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 flex items-center justify-between shadow-md z-10">
                {recentFiles.map(file => file.id === previewModal && (
                  <h3 key={file.id} className="font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </h3>
                ))}
                <div className="flex items-center space-x-2">
                  {recentFiles.map(file => file.id === previewModal && (
                    <button 
                      key={`download-${file.id}`}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = file.url || `https://arweave.net/${file.txHash}`;
                        link.download = file.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      title="Download"
                    >
                      <FiDownload className="text-gray-600 dark:text-gray-300" size={20} />
                    </button>
                  ))}
                  <button 
                    onClick={() => setPreviewModal(null)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Close"
                  >
                    <FiX className="text-gray-600 dark:text-gray-300" size={20} />
                  </button>
                </div>
              </div>

              {/* File Preview Content */}
              <div className="absolute inset-0 pt-16 pb-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                {recentFiles.map(file => {
                  if (file.id !== previewModal) return null;
                  
                  // Image Preview
                  if (file.type === 'image' && file.url) {
                    return (
                      <div key={file.id} className="h-full w-full flex items-center justify-center p-4">
                        <img 
                          src={file.url} 
                          alt={file.name} 
                          className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
                        />
                      </div>
                    );
                  }
                  
                  // Non-image files - just show icon and name
                  return (
                    <div key={file.id} className="text-center">
                      <div className="mb-4 p-6 bg-white dark:bg-gray-700 rounded-full inline-flex">
                        {file.type === 'video' ? (
                          <FiVideo size={64} className="text-purple-500" />
                        ) : file.type === 'audio' ? (
                          <FiMusic size={64} className="text-pink-500" />
                        ) : file.type === 'document' ? (
                          <FiFile size={64} className="text-blue-500" />
                        ) : (
                          <FiFile size={64} className="text-gray-500" />
                        )}
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        {file.name}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {file.contentType || file.type} • {file.size}
                      </p>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = file.url || `https://arweave.net/${file.txHash}`;
                          link.download = file.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
                      >
                        <FiDownload className="mr-2" />
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
