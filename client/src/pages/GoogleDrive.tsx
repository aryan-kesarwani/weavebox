import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiUser, FiFolder, FiFile, FiImage, FiVideo, FiMusic, FiFilter, FiChevronDown, FiExternalLink, FiDownload, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useArweaveWallet, useDarkMode, useGoogleUser } from '../utils/util';
import accessDriveFiles from '../googleAuths/accessDriveFiles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { imageCacheDB } from '../utils/imageCacheDB';
import { storeFile } from '../utils/fileStorage';
import { db } from '../utils/db';
import { uploadArweave } from '../utils/turbo';
import UploadConfirmationModal from '../components/UploadConfirmationModal';
import UploadProgressBar from '../components/UploadProgressBar';
import { getTxns } from '../contracts/getTxns';
import TransactionSidebar from '../components/TransactionSidebar';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
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
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [imageBlobs, setImageBlobs] = useState<Record<string, string>>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});
  const abortControllerRef = useRef<Record<string, AbortController>>({});

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadFile, setCurrentUploadFile] = useState<string>('');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const [authError, setAuthError] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  const navigate = useNavigate();
  const { userAddress, handleDisconnect } = useArweaveWallet();
  const { darkMode, toggleDarkMode } = useDarkMode();
  useGoogleUser();

  // Check for Google token and load files
  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    const connected = localStorage.getItem('google_connected') === 'true';

    if (token && connected) {
      setGoogleToken(token);
      setIsGoogleConnected(true);
      loadFiles(currentFolderId, token);
    } else {
      setAuthError(true);
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
    if (!token) {
      setAuthError(true);
      return;
    }

    setIsLoading(true);
    setAuthError(false);
    
    try {
      const result = await accessDriveFiles(token, folderId);
      setFiles(result);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      
      // Check if it's an authentication error (typically 401)
      const isAuthError = error instanceof Error && 
        error.message.includes('401') || 
        (error instanceof Error && error.message.includes('auth'));
      
      if (isAuthError && !isRefreshingToken) {
        // Try to refresh the token
        await refreshGoogleToken();
      } else {
        toast.error('Failed to load Google Drive files');
        setAuthError(true);
        setIsLoading(false);
      }
    }
  };

  // Add a function to refresh the Google token
  const refreshGoogleToken = async () => {
    setIsRefreshingToken(true);
    
    try {
      // Initialize Google OAuth2 client for token refresh
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (response: { access_token: string }) => {
          if (response.access_token) {
            console.log('Token refreshed successfully');
            // Store the refreshed token
            localStorage.setItem('google_access_token', response.access_token);
            localStorage.setItem('google_token_timestamp', Date.now().toString());
            
            // Update state
            setGoogleToken(response.access_token);
            
            // Try loading files again with the new token
            await loadFiles(currentFolderId, response.access_token);
          } else {
            setAuthError(true);
          }
          setIsRefreshingToken(false);
        },
        error_callback: () => {
          console.error('Failed to refresh Google token');
          setAuthError(true);
          setIsRefreshingToken(false);
        }
      });

      // Request a new access token
      client.requestAccessToken();
    } catch (error) {
      console.error('Error during token refresh:', error);
      setAuthError(true);
      setIsRefreshingToken(false);
    }
  };

  // Add function to handle new Google sign-in
  const handleGoogleSignIn = () => {
    // Initialize Google OAuth2 client
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      callback: async (response: { access_token: string }) => {
        if (response.access_token) {
          try {
            // Store the token in localStorage
            localStorage.setItem('google_access_token', response.access_token);
            localStorage.setItem('google_token_timestamp', Date.now().toString());
            localStorage.setItem('google_connected', 'true');
            
            // Fetch user info from Google API
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                'Authorization': `Bearer ${response.access_token}`
              }
            });
            
            if (userInfoResponse.ok) {
              const userInfo = await userInfoResponse.json();
              
              // Store user info
              const googleUserData = {
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
                id: userInfo.id,
                accessToken: response.access_token
              };
              
              localStorage.setItem('google_user', JSON.stringify(googleUserData));
            }
            
            // Update state and load files
            setGoogleToken(response.access_token);
            setIsGoogleConnected(true);
            setAuthError(false);
            await loadFiles(currentFolderId, response.access_token);
            
          } catch (error) {
            console.error('Error during Google sign-in:', error);
            toast.error('Failed to connect to Google Drive');
            setAuthError(true);
          }
        }
      }
    });

    // Request access token
    client.requestAccessToken();
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
    // Clear all Google-related data from localStorage
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_timestamp');
    localStorage.removeItem('google_connected');
    localStorage.removeItem('google_user');
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  // Get file type icon
  const getFileIcon = (mimeType: string) => {
    // Images
    if (mimeType.includes('image/')) {
      return <FiImage size={24} className="text-blue-500" />;
    }
    
    // Videos
    if (mimeType.includes('video/')) {
      return <FiVideo size={24} className="text-purple-500" />;
    }
    
    // Audio
    if (mimeType.includes('audio/')) {
      return <FiMusic size={24} className="text-pink-500" />;
    }
    
    // Folders
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <FiFolder size={24} className="text-yellow-500" />;
    }
    
    // PDF
    if (mimeType === 'application/pdf') {
      return (
        <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18H17V16H7V18Z" fill="currentColor" />
          <path d="M17 14H7V12H17V14Z" fill="currentColor" />
          <path d="M7 10H11V8H7V10Z" fill="currentColor" />
          <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
        </svg>
      );
    }
    
    // Google Docs
    if (mimeType === 'application/vnd.google-apps.document') {
      return (
        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor" />
          <path d="M14 3V8H19L14 3Z" fill="white" fillOpacity="0.3" />
          <path d="M7 14H17V16H7V14Z" fill="white" />
          <path d="M7 10H17V12H7V10Z" fill="white" />
          <path d="M7 18H13V20H7V18Z" fill="white" />
        </svg>
      );
    }
    
    // Google Sheets
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      return (
        <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor" />
          <path d="M14 3V8H19L14 3Z" fill="white" fillOpacity="0.3" />
          <path d="M7 14H10V17H7V14Z" fill="white" />
          <path d="M11 14H17V17H11V14Z" fill="white" />
          <path d="M7 10H10V13H7V10Z" fill="white" />
          <path d="M11 10H17V13H11V10Z" fill="white" />
        </svg>
      );
    }
    
    // Google Slides
    if (mimeType === 'application/vnd.google-apps.presentation') {
      return (
        <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor" />
          <path d="M14 3V8H19L14 3Z" fill="white" fillOpacity="0.3" />
          <rect x="7" y="10" width="10" height="7" fill="white" />
        </svg>
      );
    }
    
    // Default file icon
    return <FiFile size={24} className="text-gray-500" />;
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

  // Get Google App type from MIME type
  const getGoogleAppType = (mimeType: string): string => {
    if (mimeType === 'application/vnd.google-apps.document') return 'Document';
    if (mimeType === 'application/vnd.google-apps.spreadsheet') return 'Spreadsheet';
    if (mimeType === 'application/vnd.google-apps.presentation') return 'Presentation';
    if (mimeType === 'application/vnd.google-apps.drawing') return 'Drawing';
    if (mimeType === 'application/vnd.google-apps.form') return 'Form';
    if (mimeType === 'application/vnd.google-apps.script') return 'Script';
    if (mimeType === 'application/vnd.google-apps.site') return 'Site';
    return 'File';
  };

  // Get more human-readable file type label
  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType.includes('image/')) return 'Image';
    if (mimeType.includes('video/')) return 'Video';
    if (mimeType.includes('audio/')) return 'Audio';
    if (mimeType === 'application/pdf') return 'PDF Document';
    if (mimeType.includes('text/')) return 'Text File';
    if (mimeType.includes('application/vnd.google-apps.')) {
      return `Google ${getGoogleAppType(mimeType)}`;
    }
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml')) return 'Word Document';
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml')) return 'Excel Spreadsheet';
    if (mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml')) return 'PowerPoint Presentation';
    
    // Return file extension if available
    const fileType = mimeType.split('/')[1];
    return fileType ? fileType.toUpperCase() : 'Unknown Type';
  };

  // Get file extension from MIME type
  const getFileExtension = (mimeType: string): string => {
    const mimeToExt: {[key: string]: string} = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'text/html': 'html',
      'text/css': 'css',
      'text/javascript': 'js',
      'application/json': 'json',
      'application/xml': 'xml',
      'application/zip': 'zip',
      'application/x-rar-compressed': 'rar',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx'
    };
    
    return mimeToExt[mimeType] || mimeType.split('/')[1] || 'file';
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

  const fetchImageBlob = async (fileId: string, fileName: string) => {
    if (imageBlobs[fileId]) {
      // If we already have a blob URL for this image, just use it
      setImageLoadingStates(prev => ({ ...prev, [fileId]: 'loaded' }));
      return;
    }

    setImageLoadingStates(prev => ({ ...prev, [fileId]: 'loading' }));
    
    // First try to get the image from cache
    try {
      const cachedBlob = await imageCacheDB.getImage(fileId);
      if (cachedBlob) {
        console.log('Using cached image for:', fileName);
        const objectUrl = URL.createObjectURL(cachedBlob);
        setImageBlobs(prev => ({ ...prev, [fileId]: objectUrl }));
        setImageLoadingStates(prev => ({ ...prev, [fileId]: 'loaded' }));
        return;
      }
    } catch (error) {
      console.warn('Error checking image cache:', error);
      // Continue with fetch if cache fails
    }
    
    // Create an abort controller for this request
    abortControllerRef.current[fileId] = new AbortController();
    const { signal } = abortControllerRef.current[fileId];

    try {
      // Fetch the image with authorization header instead of URL param
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${googleToken}`
        },
        signal
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Convert blob to object URL
      const objectUrl = URL.createObjectURL(blob);
      
      // Store the object URL
      setImageBlobs(prev => ({ ...prev, [fileId]: objectUrl }));
      setImageLoadingStates(prev => ({ ...prev, [fileId]: 'loaded' }));

      // Cache the blob in IndexedDB
      try {
        await imageCacheDB.cacheImage(fileId, fileName, blob);
      } catch (cacheError) {
        console.warn('Failed to cache image:', cacheError);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Fetch aborted:', fileId);
      } else {
        console.error('Error fetching image:', error);
        setImageLoadingStates(prev => ({ ...prev, [fileId]: 'error' }));
      }
    }
  };

  const cleanupImageBlobs = () => {
    // Revoke all object URLs to prevent memory leaks
    Object.values(imageBlobs).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    
    // Abort any in-progress fetches
    Object.values(abortControllerRef.current).forEach(controller => {
      controller.abort();
    });
    
    // Clear the state
    setImageBlobs({});
    setImageLoadingStates({});
    abortControllerRef.current = {};
  };

  useEffect(() => {
    return () => {
      cleanupImageBlobs();
    };
  }, []);

  useEffect(() => {
    if (previewModal === null) {
      cleanupImageBlobs();
    }
  }, [previewModal]);

  useEffect(() => {
    if (previewModal && files.find(f => f.id === previewModal)?.mimeType.includes('image/')) {
      const file = files.find(f => f.id === previewModal);
      if (file) {
        fetchImageBlob(file.id, file.name);
      }
    }
  }, [previewModal, files]);

  const cacheGoogleDriveImage = async (fileId: string, fileName: string, blob: Blob) => {
    // Skip caching if the blob is too large (e.g., > 5MB)
    if (blob.size > 5 * 1024 * 1024) return;
    
    try {
      if (typeof window.indexedDB !== 'undefined') {
        const request = window.indexedDB.open('GoogleDriveImageCache', 1);
        
        // Set up the database if it doesn't exist
        request.onupgradeneeded = (event) => {
          const db = request.result;
          if (!db.objectStoreNames.contains('images')) {
            db.createObjectStore('images', { keyPath: 'id' });
          }
        };
        
        // Once the database is open, store the image
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(['images'], 'readwrite');
          const store = tx.objectStore('images');
          
          store.put({
            id: fileId,
            name: fileName,
            blob: blob,
            timestamp: Date.now()
          });
        };

        request.onerror = (event) => {
          console.error("IndexedDB error:", event);
        };
      }
    } catch (error) {
      console.warn('Failed to cache image in IndexedDB:', error);
    }
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      // Clear selected files when exiting selection mode
      setSelectedFiles(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const toggleFileSelection = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the file when selecting
    
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  const uploadSelectedToArweave = async () => {
    // Show confirmation modal first instead of proceeding directly
    setShowUploadConfirmation(true);
  };

  const handleConfirmUpload = async () => {
    setShowUploadConfirmation(false);
    
    const filesToUpload = [...selectedFiles];
    if (filesToUpload.length === 0) return;
    
    // Reset progress states
    setUploadProgress(0);
    setCurrentFileIndex(0);
    setCurrentUploadFile('');
    setUploadComplete(false);
    setShowUploadProgress(true);
    
    // Create a copy for tracking progress
    setUploadingFiles(new Set(filesToUpload));
    
    // Track success and failures
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < filesToUpload.length; i++) {
      const fileId = filesToUpload[i];
      const file = files.find(f => f.id === fileId);
      if (!file) continue;
      
      setCurrentFileIndex(i + 1);
      setCurrentUploadFile(file.name);
      
      try {
        // Start progress
        setUploadProgress(10);
        
        // First get the file metadata to check if it's a Google Workspace file
        const metadataResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Accept': 'application/json'
          }
        });

        if (!metadataResponse.ok) {
          throw new Error(`Failed to get file metadata: ${metadataResponse.status}`);
        }

        const metadata = await metadataResponse.json();
        
        // If it's a Google Workspace file, use export endpoint
        let downloadUrl;
        if (metadata.mimeType.includes('google-apps')) {
          // Map Google Workspace mime types to export formats
          const exportMimeTypes: Record<string, string> = {
            'application/vnd.google-apps.document': 'application/pdf',
            'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          };
          
          const exportMimeType = exportMimeTypes[metadata.mimeType] || 'application/pdf';
          downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${exportMimeType}`;
        } else {
          downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        }

        // Download the file
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Accept': '*/*'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status}`);
        }
        
        // Download complete
        setUploadProgress(40);
        
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create a File object from the blob
        const fileObject = new File([blob], file.name, { 
          type: metadata.mimeType,
          lastModified: file.modifiedTime ? new Date(file.modifiedTime).getTime() : Date.now() 
        });
        
        // Store file in IndexedDB with 'pending' status
        const storedFile = await storeFile(fileObject, userAddress || 'anonymous');
        
        // Update the file status to 'uploading'
        await db.files.update(storedFile.id!, { status: 'uploading' });
        
        // Almost done
        setUploadProgress(90);
        
        // Update counters
        successCount++;
        
        // Remove from uploading set
        const newUploadingFiles = new Set(uploadingFiles);
        newUploadingFiles.delete(fileId);
        setUploadingFiles(newUploadingFiles);
        
        // Set progress to 100% for this file
        setUploadProgress(100);
        
        // Small delay to show 100% before moving to next file
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        failCount++;
        
        // Remove from uploading set even if failed
        const newUploadingFiles = new Set(uploadingFiles);
        newUploadingFiles.delete(fileId);
        setUploadingFiles(newUploadingFiles);
      }
    }
    
    // All files processed
    setUploadComplete(true);
    
    // Show completion message
    toast.success(`Successfully stored ${successCount} file${successCount !== 1 ? 's' : ''}${failCount > 0 ? ` (${failCount} failed)` : ''}`, {
      position: "bottom-right",
      autoClose: 5000,
    });
    
    // Clear selection after successful storage
    setSelectedFiles(new Set());
    setSelectionMode(false);

    // Start Arweave upload process
    try {
      await window.arweaveWallet.connect(['ACCESS_PUBLIC_KEY', 'SIGN_TRANSACTION', 'SIGNATURE']);
      await uploadArweave();
      toast.success('Files uploaded to Arweave successfully!', {
        position: "bottom-right",
        autoClose: 5000,
      });
    } catch (error) {
      console.error('Failed to upload files to Arweave:', error);
      toast.error('Failed to upload files to Arweave', {
        position: "bottom-right",
        autoClose: 5000,
      });
    }
  };

  const handleCloseProgress = () => {
    setShowUploadProgress(false);
    setUploadComplete(false);
  };

  // Fetch Transaction
  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const txns = await getTxns();
      setTransactions(txns);
      setIsRightSidebarOpen(true);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <ToastContainer theme={darkMode ? 'dark' : 'light'} />
      
      {/* Use the Navbar component */}
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentPage="google-drive"
        fetchTransactions={fetchTransactions}
      />

      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} currentPage="google-drive" />

      {/* Main Content */}
      <div className={`pt-16 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-[250px]' : 'ml-0'}`}>
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

          {/* Selection Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button
                onClick={toggleSelectionMode}
                className={`mr-4 px-4 py-2 rounded-lg flex items-center ${
                  selectionMode 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {selectionMode ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Selection
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Select Files
                  </>
                )}
              </button>
              
              {selectionMode && (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">
                    {selectedFiles.size} selected
                  </span>
                  
                  {selectedFiles.size > 0 && (
                    <button
                      onClick={clearSelection}
                      className="mr-4 px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    >
                      Clear Selection
                    </button>
                  )}
                </>
              )}
            </div>
            
            {selectionMode && selectedFiles.size > 0 && (
              <button
                onClick={uploadSelectedToArweave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                disabled={selectedFiles.size === 0}
              >
                <FiUpload className="mr-2" />
                Upload {selectedFiles.size} {selectedFiles.size === 1 ? 'File' : 'Files'} to Arweave
              </button>
            )}
          </div>

          {/* Authentication Error UI */}
          {authError && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <img 
                src="https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" 
                alt="Google Drive" 
                className="w-16 h-16 mb-6"
              />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                Unable to access your Google Drive files
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
                Your Google Drive session may have expired or you might need to reconnect your account.
              </p>
              
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" className="mr-3">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Sign in with Google
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !authError && (
            <div className="flex justify-center my-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Files Grid - Only show when not in auth error state */}
          {!isLoading && !authError && sortedFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  whileHover={{ scale: 1.03 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer relative ${
                    selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Selection Checkbox - Only visible in selection mode */}
                  {selectionMode && (
                    <div 
                      className="absolute top-2 left-2 z-20 bg-white dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-gray-600 shadow-md"
                      onClick={(e) => toggleFileSelection(file.id, e)}
                    >
                      {selectedFiles.has(file.id) ? (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : null}
                    </div>
                  )}
                  
                  {/* Upload Indicator - Show when file is being uploaded */}
                  {uploadingFiles.has(file.id) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
                      <div className="text-white text-center p-4">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm">Uploading...</p>
                      </div>
                    </div>
                  )}
                  
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

                  {/* File card onClick handler - Update to handle selection mode */}
                  <div 
                    className="relative h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                    onClick={(e) => {
                      if (selectionMode) {
                        toggleFileSelection(file.id, e);
                      } else {
                        // Existing onClick behavior for normal mode
                        if (file.mimeType === 'application/vnd.google-apps.folder') {
                          navigateToFolder(file.id, file.name);
                        } else if (file.mimeType.includes('image/') || file.mimeType === 'application/pdf') {
                          setPreviewModal(file.id);
                        } else if (file.mimeType.includes('google-apps')) {
                          window.open(file.webViewLink, '_blank');
                        } else if (file.mimeType.includes('audio/') || file.mimeType.includes('video/')) {
                          setPreviewModal(file.id);
                        } else {
                          setPreviewModal(file.id);
                        }
                      }
                    }}
                  >
                    {/* Improved thumbnail display with better fallbacks */}
                    {file.mimeType.includes('image/') ? (
                      file.thumbnailLink ? (
                        <img 
                          src={file.thumbnailLink}
                          alt={file.name} 
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=random&size=200`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <FiImage size={36} className="text-blue-500" />
                        </div>
                      )
                    ) : file.thumbnailLink ? (
                      <img 
                        src={file.thumbnailLink}
                        alt={file.name} 
                        className="w-full h-full object-contain"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(file.name)}&background=random&size=200`;
                        }}
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
                              onClick={async (e) => {
                                e.stopPropagation();
                                // Convert the file into a temp array for the upload function
                                setSelectedFiles(new Set([file.id]));
                                uploadSelectedToArweave(); // This will now show confirmation first
                                setSelectedFileDetails(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <FiUpload className="w-4 h-4 mr-2" />
                              Upload to Arweave
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (!isLoading && !authError && (
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

      {/* Transaction History Sidebar */}
      <TransactionSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        transactions={transactions}
        isLoading={isLoadingTransactions}
      />

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
                  
                  // Image Preview with direct authentication
                  if (file.mimeType.includes('image/')) {
                    return (
                      <div key={file.id} className="h-full w-full flex items-center justify-center p-4 relative">
                        {/* Loading indicator */}
                        {(!imageBlobs[file.id] || imageLoadingStates[file.id] === 'loading') && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        
                        {/* Error state */}
                        {imageLoadingStates[file.id] === 'error' && (
                          <div className="text-center p-4">
                            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-red-500 dark:text-red-400">Failed to load image.</p>
                            <div className="flex justify-center space-x-4 mt-6">
                              <button 
                                onClick={() => fetchImageBlob(file.id, file.name)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Try Again
                              </button>
                              <button 
                                onClick={() => window.open(`https://drive.google.com/file/d/${file.id}/view`, '_blank')}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                Open in Google Drive
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Successfully loaded image */}
                        {imageBlobs[file.id] && (
                          <img 
                            src={imageBlobs[file.id]}
                            alt={file.name}
                            className="max-h-full max-w-full object-contain rounded-lg shadow-lg z-10"
                          />
                        )}
                      </div>
                    );
                  }
                  
                  // PDF Preview
                  if (file.mimeType === 'application/pdf') {
                    return (
                      <div key={file.id} className="h-full w-full p-4">
                        <iframe 
                          src={`https://drive.google.com/file/d/${file.id}/preview`}
                          className="w-full h-full border-0 rounded-lg shadow-lg" 
                          title={file.name}
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  
                  // Google Docs, Sheets, Slides, etc.
                  if (file.mimeType.includes('google-apps')) {
                    return (
                      <div key={file.id} className="text-center">
                        <div className="mb-4 p-6 bg-white dark:bg-gray-700 rounded-full inline-flex">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                          {file.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          Google {getGoogleAppType(file.mimeType)}
                        </p>
                        <button 
                          onClick={() => {
                            window.open(file.webViewLink, '_blank');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
                        >
                          <FiExternalLink className="mr-2" />
                          Open in Google Docs
                        </button>
                      </div>
                    );
                  }
                  
                  // Video files
                  if (file.mimeType.includes('video/')) {
                    return (
                      <div key={file.id} className="h-full w-full flex items-center justify-center p-4">
                        <video 
                          controls
                          className="max-h-full max-w-full rounded-lg shadow-lg"
                        >
                          <source src={`https://drive.google.com/uc?id=${file.id}`} type={file.mimeType} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    );
                  }
                  
                  // Audio files
                  if (file.mimeType.includes('audio/')) {
                    return (
                      <div key={file.id} className="text-center">
                        <div className="mb-4 p-6 bg-white dark:bg-gray-700 rounded-full inline-flex">
                          <FiMusic size={64} className="text-pink-500" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                          {file.name}
                        </h3>
                        <audio controls className="mb-6">
                          <source src={`https://drive.google.com/uc?id=${file.id}`} type={file.mimeType} />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    );
                  }
                  
                  // Any other file types - show icon and download button
                  return (
                    <div key={file.id} className="text-center">
                      <div className="mb-4 p-6 bg-white dark:bg-gray-700 rounded-full inline-flex">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        {file.name}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {getFileTypeLabel(file.mimeType)}
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

      {/* Selection Mode Toolbar */}
      {selectionMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between z-50">
          <div className="flex items-center space-x-4">
            <button 
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Selection
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button 
            onClick={uploadSelectedToArweave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <FiUpload className="mr-2" />
            Upload to Arweave
          </button>
        </div>
      )}

      {/* Upload Confirmation Modal */}
      {showUploadConfirmation && (
        <UploadConfirmationModal
          selectedFiles={files.filter(file => selectedFiles.has(file.id))}
          onConfirm={handleConfirmUpload}
          onCancel={() => setShowUploadConfirmation(false)}
        />
      )}

      {/* Upload Progress Bar */}
      <UploadProgressBar
        visible={showUploadProgress}
        progress={uploadProgress}
        fileName={currentUploadFile}
        fileCount={selectedFiles.size}
        currentFileIndex={currentFileIndex}
        isComplete={uploadComplete}
        onClose={handleCloseProgress}
      />

    </div>
  );
};

export default GoogleDrive;