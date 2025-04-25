import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { useArweaveWallet } from '../utils/util';
import { createTransaction } from '../utils/wallet';
import { useSelector, useDispatch } from 'react-redux';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { setUserAddress } from '../redux/slices/arConnectionSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Fix the RootType import issue
interface StateType {
  arConnectionState: {
    walletKey: any;
    userAddress: string;
  };
}

// Import from the existing interface or redefine it here
interface FeedPayload {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorAddress: string;
  category: string; 
  timestamp: string;
  tags: string[];
  likes: number;
  comments: number;
  videoUrl: string;
  imageUrl: string;
  isVideo: boolean;
  textContent?: string; // Add this for text type content
}

// Supported content types
type ContentType = 'text' | 'image' | 'video';

// Available tag options (same as in Dashboard.tsx)
const tagOptions = [
  'AI', 'Learning', 'News', 'Web3', 'Travel', 'Twitter', 
  'Cryptocurrency', 'Technology', 'DeFi', 'NFT', 'DAO', 'Metaverse',
  'Tutorial', 'Trending', 'Featured'
];

// Available categories
const categoryOptions = [
  { id: 'ai', label: 'AI' },
  { id: 'learning', label: 'Learning' },
  { id: 'news', label: 'News' },
  { id: 'web3', label: 'Web3' },
  { id: 'travel', label: 'Travel' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'crypto', label: 'Cryptocurrency' },
  { id: 'tech', label: 'Technology' },
  { id: 'defi', label: 'DeFi' },
  { id: 'nft', label: 'NFT' },
  { id: 'dao', label: 'DAO' },
  { id: 'metaverse', label: 'Metaverse' }
];

const ContentUploadForm = () => {
  // Get user info from wallet
  const { userAddress } = useArweaveWallet();
  const dispatch = useDispatch();
  
  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contentType, setContentType] = useState<ContentType>('text');
  const [textContent, setTextContent] = useState('');
  const [category, setCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  
  // For file uploads
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Content upload state
  // const [ contentData, setContentData ] = useState<FeedPayload | null>(null);
  const keySelector = useSelector((state : StateType) => (state.arConnectionState.walletKey));
  
  // Preserve user wallet address on page refresh
  useEffect(() => {
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress && !userAddress) {
      dispatch(setUserAddress(savedAddress));
    } else if (userAddress) {
      localStorage.setItem('userAddress', userAddress);
    }
  }, [userAddress, dispatch]);

  // Save important wallet details to prevent data loss on page refresh
  useEffect(() => {
    if (userAddress && keySelector) {
      const timestamp = new Date().toISOString();
      
      // Save comprehensive wallet details
      const walletDetails = {
        address: userAddress,
        walletKey: keySelector,
        lastActivity: timestamp,
        currentAction: 'content_upload',
        uploadSessionId: Date.now().toString(),
        contentType: contentType
      };
      
      // Store wallet details in localStorage for persistence
      localStorage.setItem('weaveboxContentUploadSession', JSON.stringify(walletDetails));
      console.log('Saved wallet details for content upload session at:', timestamp);
    }
  }, [userAddress, keySelector, contentType]);

  // Load saved form data from localStorage
  useEffect(() => {
    const savedContentForm = localStorage.getItem('contentUploadForm');
    if (savedContentForm) {
      try {
        const parsedData = JSON.parse(savedContentForm);
        setTitle(parsedData.title || '');
        setExcerpt(parsedData.excerpt || '');
        setSelectedTags(parsedData.selectedTags || []);
        setContentType(parsedData.contentType || 'text');
        setTextContent(parsedData.textContent || '');
        setCategory(parsedData.category || '');
        
        // We can't restore file data from localStorage
        // but we can store file metadata
        if (parsedData.fileMetadata && parsedData.filePreview) {
          setFilePreview(parsedData.filePreview);
        }
      } catch (error) {
        console.error("Error parsing saved content form data:", error);
      }
    }
  }, []);

  // Save form data to localStorage when it changes
  useEffect(() => {
    // Only save if there's actual data to save
    if (title || excerpt || selectedTags.length > 0 || textContent) {
      const formData = {
        title,
        excerpt,
        selectedTags,
        contentType,
        textContent,
        category,
        fileMetadata: file ? {
          name: file.name,
          type: file.type,
          size: file.size
        } : null,
        filePreview
      };
      localStorage.setItem('contentUploadForm', JSON.stringify(formData));
    }
  }, [title, excerpt, selectedTags, contentType, textContent, category, file, filePreview]);
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Check if file type matches the selected content type
    const fileType = selectedFile.type.split('/')[0];
    if ((contentType === 'image' && fileType !== 'image') || 
        (contentType === 'video' && fileType !== 'video')) {
      setSubmitError(`Please select a ${contentType} file`);
      return;
    }
    
    setFile(selectedFile);
    setSubmitError('');
    
    // Create preview for images
    if (contentType === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };
  
  // Add a tag to the selected tags list
  const addTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
      setNewTag('');
    }
  };
  
  // Remove a tag from the selected tags list
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!userAddress) {
      setSubmitError('Please connect your wallet first');
      return;
    }
    
    if (!title || !excerpt || !category || selectedTags.length === 0) {
      setSubmitError('Please fill in all required fields');
      return;
    }
    
    if (contentType === 'text' && !textContent) {
      setSubmitError('Please enter some text content');
      return;
    }
    
    if ((contentType === 'image' || contentType === 'video') && !file) {
      setSubmitError(`Please upload a ${contentType} file`);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Check if wallet is connected
      if(!keySelector) {
        setSubmitError('Please connect your wallet first');
        setIsSubmitting(false);
        return;
      }
      
      console.log("Using wallet key:", !!keySelector);
      
      // Create the feed payload object
      const newContent: FeedPayload = {
        id: Date.now().toString(), // Temporary ID, would be replaced by transaction ID
        title,
        excerpt,
        author: userAddress,
        authorAddress: userAddress,
        category,
        timestamp: new Date().toISOString(),
        tags: selectedTags,
        likes: 0,
        comments: 0,
        videoUrl: contentType === 'video' && file ? URL.createObjectURL(file) : '',
        imageUrl: contentType === 'image' && file ? URL.createObjectURL(file) : '',
        isVideo: contentType === 'video',
        textContent: contentType === 'text' ? textContent : undefined
      };
      
      console.log('New content to upload:', newContent);
      
      try {
        // Upload content to Arweave
        const txn = await createTransaction(newContent, keySelector as JWKInterface);
        
        if(txn) {
          console.log("Transaction successful:", txn);
          toast.success('Content uploaded successfully!', {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Clear saved form data after successful submission
          localStorage.removeItem('contentUploadForm');
          
          // Reset form after successful upload
          setTimeout(() => {
            setTitle('');
            setExcerpt('');
            setSelectedTags([]);
            setContentType('text');
            setTextContent('');
            setCategory('');
            setFile(null);
            setFilePreview(null);
            setIsSubmitting(false);
          }, 3000);
        } else {
          throw new Error("Transaction failed");
        }
      } catch (error) {
        console.error('Error uploading content to Arweave:', error);
        setSubmitError('Failed to upload content to Arweave. Please try again.');
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error('Error preparing content:', error);
      setSubmitError('Failed to prepare content. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-black/30 rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Upload New Content
      </h2>
      
      {submitError && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                      focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-white"
            placeholder="Enter a title for your content"
            required
          />
        </div>
        
        {/* Excerpt / Description */}
        <div className="mb-4">
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Excerpt / Description *
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                      focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-white"
            placeholder="Brief description of your content"
            rows={3}
            required
          />
        </div>
        
        {/* Category */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                      focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-white"
            required
          >
            <option value="">Select a category</option>
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Tags */}
        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags *
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              list="tagOptions"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                        focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-white"
              placeholder="Select or type a tag"
            />
            <datalist id="tagOptions">
              {tagOptions.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={addTag}
              disabled={!newTag}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                      disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          
          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 
                          dark:text-blue-200 px-2 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 
                            dark:hover:text-blue-100"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          {selectedTags.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Please add at least one tag
            </p>
          )}
        </div>
        
        {/* Content Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content Type *
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="contentType"
                value="text"
                checked={contentType === 'text'}
                onChange={() => setContentType('text')}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Text</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="contentType"
                value="image"
                checked={contentType === 'image'}
                onChange={() => setContentType('image')}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Image</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="contentType"
                value="video"
                checked={contentType === 'video'}
                onChange={() => setContentType('video')}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Video</span>
            </label>
          </div>
        </div>
        
        {/* Dynamic Content Input Area */}
        <div className="mb-6">
          {contentType === 'text' && (
            <div>
              <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Text Content *
              </label>
              <textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                          focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 
                          text-gray-900 dark:text-white"
                placeholder="Enter your text content here"
                rows={8}
                required
              />
            </div>
          )}
          
          {(contentType === 'image' || contentType === 'video') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload {contentType === 'image' ? 'Image' : 'Video'} *
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 
                            border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 
                            dark:bg-gray-700 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="h-40 object-contain mb-2" />
                    ) : file && contentType === 'video' ? (
                      <div className="text-gray-500 dark:text-gray-400 mb-2">
                        Selected video: {file.name}
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {contentType === 'image' ? 'PNG, JPG or GIF' : 'MP4, WebM or OGG'}
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept={contentType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    
                  />
                </label>
              </div>
              {file && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                    font-semibold rounded-lg hover:shadow-lg transform transition-all duration-200 
                    hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? 'Uploading...' : 'Upload Content'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentUploadForm; 