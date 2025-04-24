import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUpload, FiImage, FiVideo, FiFolder, FiFolderPlus, FiUser, FiArrowRight, FiFile, FiMusic, FiDownload, FiExternalLink, FiCopy } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import API from '../globals/axiosConfig';
import { useArweaveWallet, useDarkMode } from '../utils/util';
import accessDriveFiles from '../googleAuths/accessDriveFiles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getStoredFiles, StoredFile } from '../utils/fileStorage';

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

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
}

type Props = {
  onFolderClick?: (folderId: string) => void; // Optional: For in-app folder navigation
};

const Dashboard = ({ onFolderClick }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedFileDetails, setSelectedFileDetails] = useState<number | null>(null);
  const [fileDetailModal, setFileDetailModal] = useState<number | null>(null);
  const [previewModal, setPreviewModal] = useState<number | null>(null);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);

  const navigate = useNavigate();
  const { userAddress, handleDisconnect } = useArweaveWallet();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [recentFiles, setRecentFiles] = useState<StoredFile[]>([]);

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

  const handleGoogleLogin = () => {
    // Initialize Google OAuth2 client
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive',
      callback: async (response: { access_token: string }) => {
        console.log('Token', response.access_token);
        if (response.access_token) {
          try {
            // Send the access token to your backend
            const result : GoogleDriveFile[] = await accessDriveFiles(response.access_token);
            setFiles(result)
            console.log(result);
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

  const handleDisconnectWallet = () => {
    handleDisconnect();
    navigate('/');
  };

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
      <div>
      <h2>My Google Drive Files</h2>
      <ul>
    {files.map(file => {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        // Folder: either link to Google Drive or handle in-app navigation
        return (
          <li key={file.id}>
            {onFolderClick ? (
              <button onClick={() => onFolderClick(file.id)}>📁 {file.name}</button>
            ) : (
              <a
                href={`https://drive.google.com/drive/folders/${file.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                📁 {file.name}
              </a>
            )}
          </li>
        );
      }
      // File: link to open in Google Drive
      return (
        <li key={file.id}>
          <a
            href={`https://drive.google.com/file/d/${file.id}/view`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {file.mimeType.startsWith('image/') && (
              <img
                src={`https://drive.google.com/uc?id=${file.id}`}
                alt={file.name}
                width={50}
                style={{ marginRight: 8 }}
              />
            )}
            📄 {file.name}
          </a>
        </li>
      );
    })}
  </ul>
    </div>
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <Link to="/" className="ml-4 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                WeaveBox
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              {/* Profile Button */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarOpen ? '250px' : '0px' }}
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg z-40 overflow-hidden"
      >
        <div className="p-4 space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 bg-gray-100 dark:bg-gray-700"
          >
            <FiUpload size={20} />
            <span>Upload</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/uploads')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <FiFolder size={20} />
            <span>View Uploads</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Upload Your Files
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Local Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUpload size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Upload from Device</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Upload files directly from your computer or mobile device to Arweave's permanent storage.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/upload')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg"
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFolderPlus size={32} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Import from Google Drive</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Connect your Google Drive account to import and permanently store your files on Arweave.
                </p>
                <motion.button
                  onClick={handleGoogleLogin}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg"
                >
                  Connect Google Drive
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Recent Files Section */}
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Files</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/uploads')}
                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-medium"
              >
                <span>View All</span>
                <FiArrowRight size={16} />
              </motion.button>
            </div>
            
            {recentFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer relative"
                  >
                    {/* Three dots menu */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFileDetails(file.id !== undefined && selectedFileDetails === file.id ? null : file.id ?? null);
                      }}
                      className="absolute top-2 right-2 z-10 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white file-menu-button"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

                    {/* File card onClick handler - to open preview */}
                    <div 
                      className="relative h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
                      onClick={() => setPreviewModal(file.id ?? null)}
                    >
                      {file.type === 'image' ? (
                        <img 
                          src={file.url} 
                          alt={file.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          {getFileIcon(file.type)}
                          <span className="text-xs mt-2 uppercase text-gray-500 dark:text-gray-400">
                            {file.name.split('.').pop()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dropdown menu */}
                    {selectedFileDetails === file.id && (
                      <div className="absolute top-2 right-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-30 border border-gray-200 dark:border-gray-700 file-menu-dropdown">
                        <div className="py-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFileDetails(null);
                              setFileDetailModal(file.id ?? null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
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
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
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
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <FiExternalLink className="w-4 h-4 mr-2" />
                            View File
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(`https://arweave.net/${file.txHash}`);
                              setSelectedFileDetails(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <FiCopy className="w-4 h-4 mr-2" />
                            Copy URL
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://viewblock.io/arweave/tx/${file.txHash}`, '_blank');
                              setSelectedFileDetails(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            View Transaction
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <FiFolder size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No files uploaded yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
                    Upload some files to see them here
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/upload')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upload Your First File
                  </motion.button>
                </div>
              </div>
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
