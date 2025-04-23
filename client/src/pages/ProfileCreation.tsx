import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useArweaveWallet, useDarkMode } from '../utils/util';
import API from '../globals/axiosConfig';
import { useSelector, useDispatch } from 'react-redux';
import { createTransaction } from '../utils/wallet';
import { setUserAddress } from '../redux/slices/arConnectionSlice';

// Add TypeScript declarations for the Arweave wallet
declare global {
  interface Window {
    arweaveWallet: {
      connect: (
        permissions: string[], 
        appInfo: { name: string; logo: string }, 
        gateway: { host: string; port: number; protocol: string }
      ) => Promise<void>;
      disconnect: () => Promise<void>;
      getActiveAddress: () => Promise<string>;
      getActivePublicKey: () => Promise<string>;
    };
  }
}

// Pre-defined interest categories
const interestOptions = [
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

// Fix the RootType import issue
interface StateType {
  arConnectionState: {
    walletKey: any;
    userAddress: string;
  };
}

const ProfileCreation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { 
    userAddress, 
    handleDisconnect,
    copyToClipboard,
    updateUserInterests
  } = useArweaveWallet();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { darkMode, toggleDarkMode } = useDarkMode();
  
  // Form state
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const keySelector = useSelector((state : StateType) => state.arConnectionState.walletKey);
  console.log("Key selector:", keySelector);

  // Load saved form data from localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem('profileFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFullName(parsedData.fullName || '');
        setUsername(parsedData.username || '');
        setSelectedInterests(parsedData.interests || []);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, []);

  // Save form data to localStorage when it changes
  useEffect(() => {
    // Only save if there's actual data to save
    if (fullName || username || selectedInterests.length > 0) {
      const formData = {
        fullName,
        username,
        interests: selectedInterests
      };
      localStorage.setItem('profileFormData', JSON.stringify(formData));
    }
  }, [fullName, username, selectedInterests]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(id => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!fullName.trim()) {
      setFormError("Please enter your full name");
      return;
    }
    
    if (!username.trim()) {
      setFormError("Please enter a username");
      return;
    }
    
    if (selectedInterests.length === 0) {
      setFormError("Please select at least one interest");
      return;
    }
    
    // Form data to be sent to backend
    const profileData = {
      walletAddress: userAddress,
      fullName,
      username,
      interests: selectedInterests,
    };
    
    // Save user interests to Redux
    updateUserInterests(selectedInterests);
    
    try {
      createTransaction(profileData, keySelector);
      // Use the API interceptor to send data to the backend
      const data = await API.post('/user/profile', profileData);
      
      console.log("Profile creation response:", data);
      
      // Simulate successful submission
      setFormError(null);
      setFormSubmitted(true);
      
      // Clear the saved form data on successful submission
      localStorage.removeItem('profileFormData');
      
      // Use React Router navigation instead of window.location
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      // Error handling is done by the interceptor
      // We can add specific UI feedback here
      console.error("Error in form submission:", error);
      setFormError("Failed to create profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-tr dark:from-red-500 dark:via-black dark:to-blue-500 transition-colors duration-200">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-md z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 ml-2 sm:ml-4">
                <Link to="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  CurioWeave
                </Link>
              </div>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-5 mr-2 sm:mr-4">
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
              
              {/* User profile dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 h-[50px]"
                >
                  <span className="mr-2">{userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Account'}</span>
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 py-2">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Connected as</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userAddress}</p>
                        <button 
                          onClick={copyToClipboard}
                          className="ml-2 text-blue-600 dark:text-blue-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <button 
                        onClick={handleDisconnect}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2v3.586l3.586 3.586H10v-7z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v7H6.414l2.293 2.293a1 1 0 101.414-1.414L7.828 9.172l3.535-3.535a1 1 0 10-1.414-1.414L5.172 9A2 2 0 005 10.172V15h6a1 1 0 001-1v-4.828a2 2 0 00-.586-1.414l-4-4A1 1 0 006 3.172V5h4V3a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center mr-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-black/60 shadow-lg">
            <div className="px-3 pt-3 pb-4 space-y-3 sm:px-4">
              <div className="flex justify-center p-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
              </div>
              
              <div className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Connected as</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userAddress}</p>
                    <button 
                      onClick={copyToClipboard}
                      className="ml-2 text-blue-600 dark:text-blue-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button 
                  onClick={handleDisconnect}
                  className="flex items-center w-full px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2v3.586l3.586 3.586H10v-7z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v7H6.414l2.293 2.293a1 1 0 101.414-1.414L7.828 9.172l3.535-3.535a1 1 0 10-1.414-1.414L5.172 9A2 2 0 005 10.172V15h6a1 1 0 001-1v-4.828a2 2 0 00-.586-1.414l-4-4A1 1 0 006 3.172V5h4V3a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content - Profile Creation Form */}
      <div className="container mx-auto px-4 pt-28 pb-12">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl bg-white dark:bg-black/30 rounded-xl shadow-lg p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Create Your Profile
            </h1>
            
            {formSubmitted ? (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6 text-center">
                <p>Profile created successfully! Redirecting to dashboard...</p>
              </div>
            ) : formError ? (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
                <p>{formError}</p>
              </div>
            ) : null}
            
            <form onSubmit={handleSubmit}>
              {/* Wallet Address (Auto-filled) */}
              <div className="mb-6">
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    id="walletAddress"
                    className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg w-full p-3 border border-gray-300 dark:border-gray-700 cursor-not-allowed"
                    value={userAddress}
                    disabled
                  />
                  <button 
                    type="button"
                    onClick={copyToClipboard}
                    className="ml-2 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Full Name */}
              <div className="mb-6">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg w-full p-3 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              
              {/* Username */}
              <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg w-full p-3 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              {/* Bio/About */}
              
              {/* Interests */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Your Interests *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <div 
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 select-none ${
                        selectedInterests.includes(interest.id)
                          ? 'bg-blue-500 dark:bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 border rounded-sm mr-2 flex items-center justify-center ${
                          selectedInterests.includes(interest.id)
                            ? 'bg-white dark:bg-white border-white'
                            : 'border-gray-400 dark:border-gray-500'
                        }`}>
                          {selectedInterests.includes(interest.id) && (
                            <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {interest.label}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Select at least one interest to personalize your feed
                </p>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl w-full md:w-auto md:min-w-[200px]"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCreation; 