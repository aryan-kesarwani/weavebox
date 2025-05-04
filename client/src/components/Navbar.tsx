import { useState, Dispatch, SetStateAction } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiUser, FiChevronLeft } from 'react-icons/fi';
import { useArweaveWallet, useDarkMode, useGoogleUser } from '../utils/util';
import { toast } from 'react-toastify';

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  currentPage: string;
  fetchTransactions?: () => Promise<void>;
}

const Navbar = ({ isSidebarOpen, setIsSidebarOpen, currentPage, fetchTransactions }: NavbarProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { userAddress, handleDisconnect } = useArweaveWallet();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { googleUser, disconnectGoogle } = useGoogleUser();

  const handleDisconnectWallet = () => {
    // First disconnect from wallet
    handleDisconnect();
    
    // Also log out from Google if connected
    if (googleUser) {
      // Revoke Google access token
      if (googleUser.accessToken) {
        // Attempt to revoke the token with Google
        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${googleUser.accessToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).catch(err => console.error('Error revoking Google token:', err));
      }
      
      // Clear all Google-related data from localStorage
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('google_token_timestamp');
      localStorage.removeItem('google_connected');
      localStorage.removeItem('google_user');
      
      // Call the disconnectGoogle from hook to update state
      disconnectGoogle();
    }
    
    // Navigate to landing page
    navigate('/');
  };

  const handleDisconnectGoogle = () => {
    // Revoke Google access token if present
    if (googleUser && googleUser.accessToken) {
      // Call Google's revoke endpoint
      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${googleUser.accessToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).catch(err => console.error('Error revoking Google token:', err));
    }
    
    // Clear all Google-related data from localStorage
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_timestamp');
    localStorage.removeItem('google_connected');
    localStorage.removeItem('google_user');
    
    // Close the profile menu
    setShowProfileMenu(false);
    
    // Call the disconnectGoogle method from the hook
    disconnectGoogle();
    
    // If we're on Google Drive page, redirect to dashboard
    if (currentPage === 'google-drive') {
      navigate('/dashboard');
    } else {
      // Show a success message
      toast.success('Disconnected from Google Drive', {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <nav className="fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isSidebarOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
            </button>
            <Link to="/dashboard" className="ml-4 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Profile Button - Shows Google user's first name or wallet address */}
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
                <span className="hidden md:inline">
                  {googleUser?.name 
                    ? googleUser.name.split(' ')[0] 
                    : userAddress ? userAddress.slice(0, 6) + '...' : 'Connect Wallet'
                  }
                </span>
              </button>
              
              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{userAddress || 'Not connected'}</p>
                  </div>
                  {userAddress && (
                    <>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          fetchTransactions && fetchTransactions();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Transaction History
                      </button>
                      <button
                        onClick={handleDisconnectWallet}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Disconnect Wallet
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;