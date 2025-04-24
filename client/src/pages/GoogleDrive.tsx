import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUpload, FiUser, FiFolder, FiFile, FiImage, FiVideo, FiMusic, FiFilter, FiChevronDown, FiExternalLink, FiDownload } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useArweaveWallet, useDarkMode, useGoogleUser } from '../utils/util';
import accessDriveFiles from '../googleAuths/accessDriveFiles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  size?: string;
  modifiedTime?: string;
}

const GoogleDrive = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name-asc');
  const [showFileTypeDropdown, setShowFileTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([{ id: 'root', name: 'My Drive' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileDetails, setSelectedFileDetails] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const navigate = useNavigate();
  const { userAddress, handleDisconnect } = useArweaveWallet();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { googleUser, disconnectGoogle } = useGoogleUser();

  // Check for Google token and load files
  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    const connected = localStorage.getItem('google_connected') === 'true';

    if (token && connected) {
      setGoogleToken(token);
      setIsGoogleConnected(true);
      loadFiles(currentFolderId, token);
    } else {
      navigate('/dashboard');
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        if (!e.target.closest('.file-type-dropdown') && 
            !e.target.closest('.file-type-button')) {
          setShowFileTypeDropdown(false);
        }
        if (!e.target.closest('.sort-dropdown') && 
            !e.target.closest('.sort-button')) {
          setShowSortDropdown(false);
        }
        if (selectedFileDetails && 
            !e.target.closest('.file-menu-button') && 
            !e.target.closest('.file-menu-dropdown')) {
          setSelectedFileDetails(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedFileDetails]);

  // Load files from Google Drive
  const loadFiles = async (folderId: string = 'root', token: string = googleToken || '') => {
    if (!token) return;

    setIsLoading(true);
    try {
      const result = await accessDriveFiles(token, folderId);
      setFiles(result);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load Google Drive files');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to a folder
  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    
    // Update folder path
    const pathIndex = folderPath.findIndex(item => item.id === folderId);
    if (pathIndex >= 0) {
      // If folder is already in path, truncate to that point
      setFolderPath(folderPath.slice(0, pathIndex + 1));
    } else {
      // Add to path
      setFolderPath([...folderPath, { id: folderId, name: folderName }]);
    }

    // Load the files for this folder
    loadFiles(folderId);
  };

  const handleDisconnectWallet = () => {
    handleDisconnect();
    navigate('/');
  };

  const handleDisconnectGoogle = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_timestamp');
    localStorage.removeItem('google_connected');
    navigate('/dashboard');
  };

  // Get file type icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) {
      return <FiImage size={24} className="text-blue-500" />;
    } else if (mimeType.includes('video')) {
      return <FiVideo size={24} className="text-purple-500" />;
    } else if (mimeType.includes('audio')) {
      return <FiMusic size={24} className="text-pink-500" />;
    } else if (mimeType === 'application/vnd.google-apps.folder') {
      return <FiFolder size={24} className="text-yellow-500" />;
    } else {
      return <FiFile size={24} className="text-gray-500" />;
    }
  };

  // Get file type for filtering
  const getFileType = (mimeType: string): string => {
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'audio';
    if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
    if (mimeType.includes('pdf') || mimeType.includes('document') || 
        mimeType.includes('spreadsheet') || mimeType.includes('presentation')) {
      return 'document';
    }
    return 'other';
  };

  // Filter and sort files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const fileType = getFileType(file.mimeType);
    const matchesType = fileTypeFilter === 'all' || fileType === fileTypeFilter;
    return matchesSearch && matchesType;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    // Always put folders first
    const aIsFolder = a.mimeType === 'application/vnd.google-apps.folder';
    const bIsFolder = b.mimeType === 'application/vnd.google-apps.folder';
    
    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;
    
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'date-asc':
        return (a.modifiedTime || '').localeCompare(b.modifiedTime || '');
      case 'date-desc':
        return (b.modifiedTime || '').localeCompare(a.modifiedTime || '');
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <ToastContainer theme={darkMode ? 'dark' : 'light'} />
      
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
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              {/* Profile Button - Shows Google user */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {googleUser?.picture ? (
                    <img 
                      src={googleUser.picture} 
                      alt={googleUser.name} 
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <FiUser size={20} />
                  )}
                  <span className="hidden md:inline">{googleUser?.name || userAddress?.slice(0, 6) + '...'}</span>
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2">
                    {googleUser && (
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Google Account</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{googleUser.email}</p>
                        <button
                          onClick={handleDisconnectGoogle}
                          className="mt-2 px-2 py-1 text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          Disconnect Google
                        </button>
                      </div>
                    )}
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
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
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
            <span>My Uploads</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/google-drive')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 bg-gray-100 dark:bg-gray-700"
          >
            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3 1.4.8 2.95 1.2 4.5 1.2h47.4c1.55 0 3.1-.4 4.5-1.2 1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65-70.7 0z" fill="#0066da"/>
              <path d="m45.15 12.1-28.1 48.8h56.2z" fill="#00ac47"/>
              <path d="m18.25 66.85 27-46.75-8.5-14.6c-.8-1.4-1.95-2.5-3.3-3.3-1.4-.8-2.95-1.2-4.5-1.2h-22.4l36.2 62.75z" fill="#ea4335"/>
              <path d="m73.55 20.5h-22.4c-1.55 0-3.1.4-4.5 1.2-1.35.8-2.5 1.9-3.3 3.3l-25.05 43.4 22.4-38.85z" fill="#00832d"/>
              <path d="m45.15 12.1-19.4 33.75-18-31.2c-.8 1.4-1.2 2.95-1.2 4.5v43.4c0 1.55.4 3.1 1.2 4.5l28.1-48.8z" fill="#2684fc"/>
              <path d="m73.05 66.85c.8-1.4 1.2-2.95 1.2-4.5v-43.4c0-1.55-.4-3.1-1.2-4.5l-36.2 62.75h32.9c1.55 0 3.1-.4 4.5-1.2 1.35-.8 2.5-1.9 3.3-3.3z" fill="#ffba00"/>
            </svg>
            <span>Google Drive</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-center md:text-left bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4 md:mb-0">
              Google Drive Files
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

          {/* Folder Path Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-1 mb-4 text-sm text-gray-600 dark:text-gray-400">
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                {index > 0 && <span className="mx-1">/</span>}
                <button
                  onClick={() => navigateToFolder(folder.id, folder.name)}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 ${
                    index === folderPath.length - 1 ? 'font-medium text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center my-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Files Grid */}
          {!isLoading && sortedFiles.length > 0 ? (
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

                  {/* File card onClick handler */}
                  <div 
                    className="relative h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                    onClick={() => {
                      if (file.mimeType === 'application/vnd.google-apps.folder') {
                        navigateToFolder(file.id, file.name);
                      } else if (file.mimeType.includes('image/')) {
                        setPreviewModal(file.id);
                      } else if (file.webViewLink) {
                        window.open(file.webViewLink, '_blank');
                      }
                    }}
                  >
                    {file.mimeType.includes('image/') && file.thumbnailLink ? (
                      <img 
                        src={file.thumbnailLink} 
                        alt={file.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {getFileIcon(file.mimeType)}
                        <span className="text-xs mt-2 uppercase text-gray-500 dark:text-gray-400">
                          {file.mimeType === 'application/vnd.google-apps.folder' 
                            ? 'Folder' 
                            : file.name.split('.').pop() || 'File'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {file.size || ''}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(file.modifiedTime)}
                      </span>
                    </div>
                  </div>

                  {/* File Details Dropdown Menu */}
                  {selectedFileDetails === file.id && (
                    <div className="absolute top-2 right-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-30 border border-gray-200 dark:border-gray-700 file-menu-dropdown">
                      <div className="py-1">
                        {file.mimeType === 'application/vnd.google-apps.folder' ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToFolder(file.id, file.name);
                              setSelectedFileDetails(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <FiFolder className="w-4 h-4 mr-2" />
                            Open Folder
                          </button>
                        ) : (
                          <>
                            {file.mimeType.includes('image/') && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFileDetails(null);
                                  setPreviewModal(file.id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                              >
                                <FiExternalLink className="w-4 h-4 mr-2" />
                                Preview
                              </button>
                            )}
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank');
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
                                window.open(`https://drive.google.com/file/d/${file.id}/view`, '_blank');
                                setSelectedFileDetails(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <FiExternalLink className="w-4 h-4 mr-2" />
                              Open in Drive
                            </button>
                            
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Store in arweave functionality would go here
                                toast.info("Feature coming soon: Store permanently on Arweave");
                                setSelectedFileDetails(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <FiUpload className="w-4 h-4 mr-2" />
                              Store on Arweave
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (!isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <FiFolder size={64} className="text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                {searchQuery ? 'No files found' : 'This folder is empty'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {searchQuery ? 'Try a different search term' : 'Your Google Drive folder is empty'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* File Preview Modal */}
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
                {files.map(file => file.id === previewModal && (
                  <h3 key={file.id} className="font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </h3>
                ))}
                <div className="flex items-center space-x-2">
                  {files.map(file => file.id === previewModal && (
                    <button 
                      key={`download-${file.id}`}
                      onClick={() => {
                        window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank');
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
                {files.map(file => {
                  if (file.id !== previewModal) return null;
                  
                  // Image Preview
                  if (file.mimeType.includes('image/')) {
                    return (
                      <div key={file.id} className="h-full w-full flex items-center justify-center p-4">
                        <img 
                          src={`https://drive.google.com/uc?id=${file.id}`}
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
                        {getFileIcon(file.mimeType)}
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        {file.name}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {file.mimeType}
                      </p>
                      <div className="flex justify-center space-x-4 mt-6">
                        <button 
                          onClick={() => {
                            window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                        >
                          <FiDownload className="mr-2" />
                          Download
                        </button>
                        <button 
                          onClick={() => {
                            window.open(`https://drive.google.com/file/d/${file.id}/view`, '_blank');
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                        >
                          <FiExternalLink className="mr-2" />
                          Open in Drive
                        </button>
                      </div>
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

export default GoogleDrive;