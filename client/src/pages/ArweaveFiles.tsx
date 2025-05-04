import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiFile, FiImage, FiVideo, FiMusic, FiFilter, FiChevronDown, FiExternalLink, FiCopy, FiX } from 'react-icons/fi';
// import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../utils/util';
// import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import API from '../globals/axiosConfig';
import { getStoredFiles, StoredFile } from '../utils/fileStorage';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useArweaveTransactions } from '../hooks/useArweaveTransactions';

interface Tag {
  name: string;
  value: string;
}

const Uploads = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date-desc');
  const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // const [showUploadPopup, setShowUploadPopup] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState(0);
  // const [isUploading, setIsUploading] = useState(false);
  const [selectedFileDetails, setSelectedFileDetails] = useState<string | null>(null);
  const [fileDetailModal, setFileDetailModal] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<string | null>(null);

  // const navigate = useNavigate();
  // const { userAddress, handleDisconnect } = useArweaveWallet();
  const { darkMode } = useDarkMode();
  const { transactions, loading, error, loadMore, hasMore } = useArweaveTransactions();

  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>([]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // const handleDisconnectWallet = () => {
  //   handleDisconnect();
  //   navigate('/');
  // };

  // const onDrop = useCallback((acceptedFiles: File[]) => {
  //   if (acceptedFiles.length > 0) {
  //     const fileSize = acceptedFiles[0].size;
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

  const getFileType = (tags: Tag[]) => {
    const contentType = tags.find(tag => tag.name === 'Content-Type')?.value || '';
    if (contentType.includes('image')) return 'image';
    if (contentType.includes('video')) return 'video';
    if (contentType.includes('audio')) return 'audio';
    if (contentType.includes('pdf') || contentType.includes('document')) return 'document';
    return 'file';
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = fileTypeFilter === 'all' || 
      tx.tags.some((tag: Tag) => tag.name === 'Content-Type' && tag.value.includes(fileTypeFilter));
    return matchesSearch && matchesType;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.id.localeCompare(b.id);
      case 'name-desc':
        return b.id.localeCompare(a.id);
      case 'date-desc':
        return 0; // Since we don't have date info in transactions
      case 'date-asc':
        return 0; // Since we don't have date info in transactions
      case 'size-desc':
        return 0; // Since we don't have size info in transactions
      case 'size-asc':
        return 0; // Since we don't have size info in transactions
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

  // const handleTagClick = (tag: string): void => {
  //   setSearchQuery(tag);
  // };

  const fetchTransactions = async (): Promise<void> => {
    try {
      // Implementation of fetchTransactions
      await Promise.resolve();
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <ToastContainer theme={darkMode ? 'dark' : 'light'} />
      
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentPage="uploads"
        fetchTransactions={fetchTransactions}
      />

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
              {sortedTransactions.length} {sortedTransactions.length === 1 ? 'transaction' : 'transactions'}
            </div>
          </div>
          {sortedTransactions.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sortedTransactions.map((tx) => {
                  const fileType = getFileType(tx.tags);
                  return (
                    <motion.div
                      key={tx.id}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer relative"
                    >
                      {/* Three dots menu */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFileDetails(tx.id !== selectedFileDetails ? tx.id : null);
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
                        onClick={() => setPreviewModal(tx.id)}
                      >
                        {fileType === 'image' ? (
                          <img 
                            src={`https://arnode.asia/${tx.id}`}
                            alt={tx.id}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            {getFileIcon(fileType)}
                            <span className="text-xs mt-2 uppercase text-gray-500 dark:text-gray-400">
                              {fileType}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* File Info section */}
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={tx.id}>
                          {tx.id}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {fileType}
                          </span>
                        </div>
                      </div>

                      {/* File Details Dropdown Menu */}
                      {selectedFileDetails === tx.id && (
                        <div className="absolute top-2 right-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-30 border border-gray-200 dark:border-gray-700 file-menu-dropdown">
                          <div className="py-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFileDetails(null);
                                setFileDetailModal(tx.id);
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
                                window.open(`https://arnode.asia/${tx.id}`, '_blank');
                                setSelectedFileDetails(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <FiExternalLink className="w-4 h-4 mr-2" />
                              View on Arweave
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`https://arnode.asia/${tx.id}`);
                                toast.success('URL copied to clipboard');
                                setSelectedFileDetails(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <FiCopy className="w-4 h-4 mr-2" />
                              Copy URL
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {!hasMore && !loading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No more transactions to load
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <FiFolder size={64} className="text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No transactions found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {searchQuery || fileTypeFilter !== 'all' ? 'Try different search criteria' : 'No transactions available'}
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

      {fileDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 relative">
            <button 
              onClick={() => setFileDetailModal(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <FiX size={24} />
            </button>
            
            {transactions.map(tx => tx.id === fileDetailModal && (
              <div key={tx.id}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {tx.id}
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                        <p className="font-medium text-gray-900 dark:text-white break-all">{tx.id}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Content Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tx.tags.find((tag: Tag) => tag.name === 'Content-Type')?.value || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tags</p>
                        <div className="space-y-1">
                          {tx.tags.map((tag: Tag, index: number) => (
                            <p key={index} className="font-medium text-blue-600 dark:text-blue-400 break-all">
                              {tag.name}: {tag.value}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Actions</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => window.open(`https://arnode.asia/${tx.id}`, '_blank')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                      >
                        <FiExternalLink className="w-4 h-4 mr-2" />
                        View on Arweave
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://arnode.asia/${tx.id}`);
                          toast.success('URL copied to clipboard');
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
                      >
                        <FiCopy className="w-4 h-4 mr-2" />
                        Copy URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {previewModal && (
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
              <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 flex items-center justify-between shadow-md z-10">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {previewModal}
                </h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => window.open(`https://arnode.asia/${previewModal}`, '_blank')}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="View"
                  >
                    <FiExternalLink className="text-gray-600 dark:text-gray-300" size={20} />
                  </button>
                  <button 
                    onClick={() => setPreviewModal(null)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Close"
                  >
                    <FiX className="text-gray-600 dark:text-gray-300" size={20} />
                  </button>
                </div>
              </div>

              <div className="absolute inset-0 pt-16 pb-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <div className="mb-4 p-6 bg-white dark:bg-gray-700 rounded-full inline-flex">
                    {getFileIcon(getFileType(transactions.find(tx => tx.id === previewModal)?.tags || []))}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    {previewModal}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {getFileType(transactions.find(tx => tx.id === previewModal)?.tags || [])}
                  </p>
                  <button 
                    onClick={() => window.open(`https://arnode.asia/${previewModal}`, '_blank')}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
                  >
                    <FiExternalLink className="mr-2" />
                    View on Arweave
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Uploads;