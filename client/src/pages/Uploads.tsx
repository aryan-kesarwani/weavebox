import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiFile, FiImage, FiVideo, FiMusic, FiFilter, FiChevronDown, FiDownload, FiExternalLink, FiCopy, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useArweaveWallet, useDarkMode } from '../utils/util';
// import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import API from '../globals/axiosConfig';
import { getStoredFiles, StoredFile } from '../utils/fileStorage';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Uploads = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date-desc');
  const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // const [showUploadPopup, setShowUploadPopup] = useState(false);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const [priceEstimate, setPriceEstimate] = useState<string | null>(null);
  // const [uploadProgress, setUploadProgress] = useState(0);
  // const [isUploading, setIsUploading] = useState(false);
  const [selectedFileDetails, setSelectedFileDetails] = useState<number | null>(null);
  const [fileDetailModal, setFileDetailModal] = useState<number | null>(null);
  const [previewModal, setPreviewModal] = useState<number | null>(null);

  const navigate = useNavigate();
  const { userAddress } = useArweaveWallet();
  const { darkMode} = useDarkMode();

  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>([]);


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

  // useEffect(() => {
  //   const handleClickOutside = (e: MouseEvent) => {
  //     const target = e.target as HTMLElement;
  //     if (!target.closest('.upload-popup-container') && !target.closest('.upload-button')) {
  //       setShowUploadPopup(false);
  //       clearFileSelection();
  //     }
  //     setShowFileTypeDropdown(false);
  //     setShowSortDropdown(false);
  //   };
    
  //   document.addEventListener('click', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('click', handleClickOutside);
  //   };
  // }, []);

  // useEffect(() => {
  //   if (showUploadPopup) {
  //     const script = document.createElement('script');
  //     script.src = 'https://accounts.google.com/gsi/client';
  //     script.async = true;
  //     script.defer = true;
  //     document.body.appendChild(script);

  //     return () => {
  //       const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
  //       if (scriptElement && scriptElement.parentNode) {
  //         scriptElement.parentNode.removeChild(scriptElement);
  //       }
  //     };
  //   }
  // }, [showUploadPopup]);

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

  useEffect(() => {
    const loadFiles = async () => {
      const storedFiles = await getStoredFiles();
      setUploadedFiles(storedFiles);
    };
    
    loadFiles();
    
    return () => {
      uploadedFiles.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, []);

  // const handleDisconnectWallet = () => {
  //   handleDisconnect();
  //   navigate('/');
  // };

  // const onDrop = useCallback((acceptedFiles: File[]) => {
  //   if (acceptedFiles.length > 0) {
  //     setSelectedFile(acceptedFiles[0]);
  //     const fileSize = acceptedFiles[0].size;
  //     const price = fileSize < 100 * 1024 ? 0 : (fileSize / 1000000) * 0.1;
  //     setPriceEstimate(`$${price.toFixed(4)}`);
  //   }
  // }, []);

  // useDropzone({
  //   onDrop,
  //   maxFiles: 1,
  //   accept: {
  //     'application/*': ['.pdf', '.doc', '.docx'],
  //     'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
  //     'video/*': ['.mp4', '.mov', '.avi'],
  //     'audio/*': ['.mp3', '.wav'],
  //   }
  // });

  // const clearFileSelection = () => {
  //   setSelectedFile(null);
  //   setPriceEstimate(null);
  //   setUploadProgress(0);
  // };

  // const handleCloseUploadPopup = () => {
  //   setShowUploadPopup(false);
  //   clearFileSelection();
  // };

  // const handleDeviceUpload = async () => {
  //   if (!selectedFile) return;
    
  //   setIsUploading(true);
  //   setUploadProgress(0);
    
  //   try {
  //     const simulateProgress = setInterval(() => {
  //       setUploadProgress(prev => {
  //         if (prev >= 90) {
  //           clearInterval(simulateProgress);
  //           return 90;
  //         }
  //         return prev + 10;
  //       });
  //     }, 300);
      
  //     const newFile = await storeFile(selectedFile, userAddress || '');
      
  //     clearInterval(simulateProgress);
  //     setUploadProgress(100);
      
  //     setUploadedFiles(prevFiles => [newFile, ...prevFiles]);
      
  //     setIsUploading(false);
  //     toast.success('File uploaded successfully!', {
  //       position: "bottom-right",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //     });
      
  //     clearFileSelection();
  //     setShowUploadPopup(false);
      
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //     toast.error('Failed to upload file. Please try again.', {
  //       position: "bottom-right",
  //       autoClose: 3000,
  //     });
  //     setIsUploading(false);
  //   }
  // };

  // const handleGoogleLogin = () => {
  //   const client = window.google.accounts.oauth2.initTokenClient({
  //     client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  //     scope: 'https://www.googleapis.com/auth/drive',
  //     callback: async (response: { access_token: string }) => {
  //       console.log('Token', response.access_token);
  //       if (response.access_token) {
  //         try {
  //           const result = await API.post('/auth/verify', {
  //             access_token: response.access_token
  //           });
  //           console.log('Login successful:', result);
  //           localStorage.setItem('googleAccessToken', response.access_token);
  //           toast.success('Connected to Google Drive successfully!', {
  //             position: "bottom-right",
  //             autoClose: 3000,
  //           });
  //           clearFileSelection();
  //           setShowUploadPopup(false);
  //         } catch (error) {
  //           console.error('Error during login:', error);
  //           toast.error('Failed to connect to Google Drive', {
  //             position: "bottom-right",
  //             autoClose: 3000,
  //           });
  //         }
  //       }
  //     },
  //   });

  //   client.requestAccessToken();
  // };

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
      
      {/* Use the Navbar component */}
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentPage="uploads"
      />

      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} currentPage="uploads" />

      <div className={`pt-16 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-[250px]' : 'ml-0'}`}>
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
                      setSelectedFileDetails(file.id !== undefined && selectedFileDetails === file.id ? null : file.id || null);
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
                    onClick={() => setPreviewModal(file.id ?? null)}
                  >
                    {file.type === 'image' ? (
                      <img 
                        src={file.url || `https://source.unsplash.com/random/300x300?${file.name.split('.')[0]}`} 
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
                            if (file.txHash === 'pending') {
                              toast.info("File is still being uploaded to Arweave. Please wait.", {
                                position: "bottom-right",
                                autoClose: 3000,
                                hideProgressBar: true,
                              });
                              return;
                            }
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
                          {file.txHash === 'pending' ? 'Uploading...' : 'Download'}
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (file.txHash === 'pending') {
                              toast.info("File is still being uploaded to Arweave. Please wait.", {
                                position: "bottom-right",
                                autoClose: 3000,
                                hideProgressBar: true,
                              });
                              return;
                            }
                            navigator.clipboard.writeText(`https://arweave.net/${file.txHash}`);
                            toast.info("Copied to clipboard", {
                              position: "bottom-right",
                              autoClose: 3000,
                              hideProgressBar: true,
                            });
                            setSelectedFileDetails(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <FiCopy className="w-4 h-4 mr-2" />
                          {file.txHash === 'pending' ? 'Uploading...' : 'Copy Transaction ID'}
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (file.txHash === 'pending') {
                              toast.info("File is still being uploaded to Arweave. Please wait.", {
                                position: "bottom-right",
                                autoClose: 3000,
                                hideProgressBar: true,
                              });
                              return;
                            }
                            window.open(`https://viewblock.io/arweave/tx/${file.txHash}`, '_blank');
                            setSelectedFileDetails(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <FiExternalLink className="w-4 h-4 mr-2" />
                          {file.txHash === 'pending' ? 'Uploading...' : 'View Transaction'}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (file.txHash === 'pending') {
                            toast.info("File is still being uploaded to Arweave. Please wait.", {
                              position: "bottom-right",
                              autoClose: 3000,
                              hideProgressBar: true,
                            });
                            return;
                          }
                          const link = document.createElement('a');
                          link.href = file.url || `https://arnode.asia/${file.txHash}`;
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (file.txHash === 'pending') {
                            toast.info("File is still being uploaded to Arweave. Please wait.", {
                              position: "bottom-right",
                              autoClose: 3000,
                              hideProgressBar: true,
                            });
                            return;
                          }
                          navigator.clipboard.writeText(`https://arnode.asia/${file.txHash}`);
                          toast.info("Copied to clipboard", {
                            position: "bottom-right",
                            autoClose: 3000,
                            hideProgressBar: true,
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
                      >
                        <FiCopy className="w-4 h-4 mr-2" />
                        Copy URL
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (file.txHash === 'pending') {
                            toast.info("File is still being uploaded to Arweave. Please wait.", {
                              position: "bottom-right",
                              autoClose: 3000,
                              hideProgressBar: true,
                            });
                            return;
                          }
                          window.open(`https://viewblock.io/arweave/tx/${file.txHash}`, '_blank');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
                      >
                        <FiExternalLink className="w-4 h-4 mr-2" />
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