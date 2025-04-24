import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUpload, FiUser, FiFolder, FiFile, FiImage, FiVideo, FiMusic, FiFilter, FiChevronDown, FiFolderPlus, FiDownload, FiExternalLink, FiCopy } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useArweaveWallet, useDarkMode } from '../utils/util';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from '../globals/axiosConfig';

const Uploads = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date-desc');
  const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileDetails, setSelectedFileDetails] = useState<number | null>(null);
  const [fileDetailModal, setFileDetailModal] = useState<number | null>(null);
  const [previewModal, setPreviewModal] = useState<number | null>(null);

  const navigate = useNavigate();
  const { userAddress, handleDisconnect } = useArweaveWallet();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [uploadedFiles, setUploadedFiles] = useState([
    { 
      id: 1, 
      name: 'vacation.jpg', 
      type: 'image', 
      url: 'https://source.unsplash.com/random/300x300?vacation', 
      date: '2025-04-20', 
      time: '14:35:22',
      size: '2.3 MB', 
      sizeInBytes: 2408448,
      txHash: 'Dx7qi8kF0JkjZ-rwDuJRuq4-6YY4b0Wla0nh2vK2Ui8',
      contentType: 'image/jpeg',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 2, 
      name: 'document.pdf', 
      type: 'document', 
      url: '', 
      date: '2025-04-18', 
      time: '10:15:00',
      size: '1.1 MB', 
      sizeInBytes: 1153434,
      txHash: 'TxHashExample2',
      contentType: 'application/pdf',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 3, 
      name: 'presentation.pptx', 
      type: 'document', 
      url: '', 
      date: '2025-04-15', 
      time: '08:45:30',
      size: '4.7 MB', 
      sizeInBytes: 4928307,
      txHash: 'TxHashExample3',
      contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 4, 
      name: 'beach.jpg', 
      type: 'image', 
      url: 'https://source.unsplash.com/random/300x300?beach', 
      date: '2025-04-10', 
      time: '16:20:00',
      size: '3.2 MB', 
      sizeInBytes: 3355443,
      txHash: 'TxHashExample4',
      contentType: 'image/jpeg',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 5, 
      name: 'music.mp3', 
      type: 'audio', 
      url: '', 
      date: '2025-04-05', 
      time: '12:00:00',
      size: '5.8 MB', 
      sizeInBytes: 6082560,
      txHash: 'TxHashExample5',
      contentType: 'audio/mpeg',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 6, 
      name: 'tutorial.mp4', 
      type: 'video', 
      url: '', 
      date: '2025-04-01', 
      time: '09:30:00',
      size: '15.2 MB', 
      sizeInBytes: 15937536,
      txHash: 'TxHashExample6',
      contentType: 'video/mp4',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 7, 
      name: 'mountains.jpg', 
      type: 'image', 
      url: 'https://source.unsplash.com/random/300x300?mountains', 
      date: '2025-03-28', 
      time: '18:45:00',
      size: '2.9 MB', 
      sizeInBytes: 3040722,
      txHash: 'TxHashExample7',
      contentType: 'image/jpeg',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 8, 
      name: 'contract.docx', 
      type: 'document', 
      url: '', 
      date: '2025-03-25', 
      time: '11:00:00',
      size: '0.8 MB', 
      sizeInBytes: 838860,
      txHash: 'TxHashExample8',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 9, 
      name: 'code.zip', 
      type: 'archive', 
      url: '', 
      date: '2025-03-20', 
      time: '14:00:00',
      size: '7.3 MB', 
      sizeInBytes: 7654604,
      txHash: 'TxHashExample9',
      contentType: 'application/zip',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 10, 
      name: 'sunset.jpg', 
      type: 'image', 
      url: 'https://source.unsplash.com/random/300x300?sunset', 
      date: '2025-03-15', 
      time: '19:30:00',
      size: '1.6 MB', 
      sizeInBytes: 1677721,
      txHash: 'TxHashExample10',
      contentType: 'image/jpeg',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 11, 
      name: 'podcast.mp3', 
      type: 'audio', 
      url: '', 
      date: '2025-03-10', 
      time: '08:00:00',
      size: '12.4 MB', 
      sizeInBytes: 13004185,
      txHash: 'TxHashExample11',
      contentType: 'audio/mpeg',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
    { 
      id: 12, 
      name: 'forest.jpg', 
      type: 'image', 
      url: 'https://source.unsplash.com/random/300x300?forest', 
      date: '2025-03-05', 
      time: '15:00:00',
      size: '2.1 MB', 
      sizeInBytes: 2202010,
      txHash: 'TxHashExample12',
      contentType: 'image/jpeg',
      permanentlyStored: true,
      uploadedBy: userAddress
    },
  ]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.upload-popup-container') && !target.closest('.upload-button')) {
        setShowUploadPopup(false);
        clearFileSelection();
      }
      setShowFileTypeDropdown(false);
      setShowSortDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showUploadPopup) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (scriptElement && scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement);
        }
      };
    }
  }, [showUploadPopup]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedFileDetails !== null && e.target instanceof HTMLElement && !e.target.closest('.file-menu-button') && !e.target.closest('.file-menu-dropdown')) {
        setSelectedFileDetails(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedFileDetails]);

  const handleDisconnectWallet = () => {
    handleDisconnect();
    navigate('/');
  };

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

  const clearFileSelection = () => {
    setSelectedFile(null);
    setPriceEstimate(null);
    setUploadProgress(0);
  };

  const handleCloseUploadPopup = () => {
    setShowUploadPopup(false);
    clearFileSelection();
  };

  const handleDeviceUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
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
          clearFileSelection();
          setShowUploadPopup(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleGoogleLogin = () => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive',
      callback: async (response: { access_token: string }) => {
        console.log('Token', response.access_token);
        if (response.access_token) {
          try {
            const result = await API.post('/auth/verify', {
              access_token: response.access_token
            });
            console.log('Login successful:', result);
            localStorage.setItem('googleAccessToken', response.access_token);
            toast.success('Connected to Google Drive successfully!', {
              position: "bottom-right",
              autoClose: 3000,
            });
            clearFileSelection();
            setShowUploadPopup(false);
          } catch (error) {
            console.error('Error during login:', error);
            toast.error('Failed to connect to Google Drive', {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        }
      },
    });

    client.requestAccessToken();
  };

  const filteredFiles = uploadedFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = fileTypeFilter === 'all' || file.type === fileTypeFilter;
    return matchesSearch && matchesType;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'size-asc':
        return a.sizeInBytes - b.sizeInBytes;
      case 'size-desc':
        return b.sizeInBytes - a.sizeInBytes;
      default:
        return 0;
    }
  });

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'image':
        return <FiImage size={24} className="text-blue-500" />;
      case 'video':
        return <FiVideo size={24} className="text-purple-500" />;
      case 'audio':
        return <FiMusic size={24} className="text-pink-500" />;
      case 'document':
        return <FiFile size={24} className="text-orange-500" />;
      case 'archive':
        return <FiFolder size={24} className="text-green-500" />;
      default:
        return <FiFile size={24} className="text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch(type) {
      case 'all': return 'All Files';
      case 'image': return 'Images';
      case 'video': return 'Videos';
      case 'audio': return 'Music';
      case 'document': return 'Documents';
      case 'archive': return 'Archives';
      default: return 'Unknown';
    }
  };

  const getSortLabel = (option: string) => {
    switch(option) {
      case 'date-desc': return 'Newest First';
      case 'date-asc': return 'Oldest First';
      case 'name-asc': return 'Name (A-Z)';
      case 'name-desc': return 'Name (Z-A)';
      case 'size-desc': return 'Size (Largest)';
      case 'size-asc': return 'Size (Smallest)';
      default: return 'Sort by';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <ToastContainer theme={darkMode ? 'dark' : 'light'} />
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUploadPopup(!showUploadPopup);
                }}
                className="upload-button flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors"
                aria-label="Upload files"
              >
                <FiUpload size={20} />
                <span className="hidden sm:inline">Upload</span>
              </button>
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
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FiUser size={20} />
                  <span className="hidden md:inline">{userAddress?.slice(0, 6)}...</span>
                </button>
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
      {showUploadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="upload-popup-container bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 relative">
            <button 
              onClick={handleCloseUploadPopup} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Upload Your Files
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
                <div className="text-center flex flex-col flex-1 justify-between">
                  <div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiUpload size={32} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload from Device</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Upload files directly from your computer or mobile device to Arweave's permanent storage.
                    </p>
                  </div>
                  <div 
                    {...getRootProps()} 
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg cursor-pointer text-center mt-auto"
                  >
                    <input {...getInputProps()} />
                    Select Files
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
                <div className="text-center flex flex-col flex-1 justify-between">
                  <div>
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiFolderPlus size={32} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Import from Google Drive</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Connect your Google Drive account to import and permanently store your files on Arweave.
                    </p>
                  </div>
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg mt-auto"
                  >
                    Connect Google Drive
                  </button>
                </div>
              </div>
            </div>
            {selectedFile && (
              <div className="mt-8 bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">File Details</h3>
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
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
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
                  onClick={handleDeviceUpload}
                  disabled={isUploading}
                  className={`w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Upload to Arweave'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <FiUpload size={20} />
            <span>Upload</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/uploads')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 bg-gray-100 dark:bg-gray-700"
          >
            <FiFolder size={20} />
            <span>View Uploads</span>
          </motion.button>
        </div>
      </motion.div>
      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4 md:mb-0">
              Your Uploads
            </h1>
            <div className="w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFileTypeDropdown(!showFileTypeDropdown);
                  setShowSortDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FiFilter size={16} />
                <span>{getFileTypeLabel(fileTypeFilter)}</span>
                <FiChevronDown size={16} className={`transition-transform ${showFileTypeDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showFileTypeDropdown && (
                <div className="absolute mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700">
                  {['all', 'image', 'video', 'audio', 'document', 'archive'].map(type => (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileTypeFilter(type);
                        setShowFileTypeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${
                        fileTypeFilter === type ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      {type === 'all' ? (
                        <FiFolder size={16} className="text-gray-500" />
                      ) : (
                        getFileIcon(type)
                      )}
                      <span className="text-gray-800 dark:text-gray-200">{getFileTypeLabel(type)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortDropdown(!showSortDropdown);
                  setShowFileTypeDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span>{getSortLabel(sortOption)}</span>
                <FiChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showSortDropdown && (
                <div className="absolute mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700">
                  {['date-desc', 'date-asc', 'name-asc', 'name-desc', 'size-desc', 'size-asc'].map(option => (
                    <button
                      key={option}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortOption(option);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        sortOption === option ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                    >
                      <span className="text-gray-800 dark:text-gray-200">{getSortLabel(option)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              {sortedFiles.length} {sortedFiles.length === 1 ? 'file' : 'files'}
            </div>
          </div>
          {sortedFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer relative"
                >
                  {/* Three dots menu */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFileDetails(selectedFileDetails === file.id ? null : file.id);
                    }}
                    className="absolute top-2 right-2 z-10 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white file-menu-button"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>

                  {/* File card onClick handler - opens preview */}
                  <div 
                    className="relative h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                    onClick={() => setPreviewModal(file.id)}
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
                  
                  {/* File Info section */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {file.size}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {file.date}
                      </span>
                    </div>
                  </div>

                  {/* File Details Dropdown Menu */}
                  {selectedFileDetails === file.id && (
                    <div className="absolute top-2 right-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-30 border border-gray-200 dark:border-gray-700 file-menu-dropdown">
                      <div className="py-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFileDetails(null);
                            setFileDetailModal(file.id);
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
                            // Logic for downloading - no toast
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
                            setPreviewModal(file.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <FiExternalLink className="w-4 h-4 mr-2" />
                          View File
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Copy transaction URL to clipboard
                            navigator.clipboard.writeText(`https://arweave.net/${file.txHash}`);
                            // Show short-lived toast for clipboard copy
                            toast.info("Copied to clipboard", {
                              position: "bottom-right",
                              autoClose: 3000,
                              hideProgressBar: true,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                            });
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
                            // Open Arweave explorer in a new tab
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
            <div className="flex flex-col items-center justify-center py-16">
              <FiFolder size={64} className="text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No files found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {searchQuery || fileTypeFilter !== 'all' ? 'Try different search criteria' : 'Upload some files to get started'}
              </p>
              {(searchQuery || fileTypeFilter !== 'all') && (
                <div className="flex space-x-3 mt-4">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Clear Search
                    </button>
                  )}
                  {fileTypeFilter !== 'all' && (
                    <button
                      onClick={() => setFileTypeFilter('all')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Show All Files
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {fileDetailModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 relative">
            <button 
              onClick={() => setFileDetailModal(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FiX size={24} />
            </button>
            
            {uploadedFiles.map(file => file.id === fileDetailModal && (
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
                        <p className="font-medium text-gray-900 dark:text-white">{file.size} ({(file.sizeInBytes / 1024 / 1024).toFixed(2)} MB)</p>
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
                          {file.uploadedBy}
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
                          setPreviewModal(file.id);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 flex items-center"
                      >
                        <FiExternalLink className="w-4 h-4 mr-2" />
                        View File
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://arweave.net/${file.txHash}`);
                          // Show short-lived toast for clipboard copy
                          toast.info("Copied to clipboard", {
                            position: "bottom-right",
                            autoClose: 3000,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                          });
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
      
      {/* Add File Preview Modal - Google Drive Style */}
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
                {uploadedFiles.map(file => file.id === previewModal && (
                  <h3 key={file.id} className="font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </h3>
                ))}
                <div className="flex items-center space-x-2">
                  {uploadedFiles.map(file => file.id === previewModal && (
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
                {uploadedFiles.map(file => {
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
                        ) : file.type === 'archive' ? (
                          <FiFolder size={64} className="text-green-500" />
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

export default Uploads;