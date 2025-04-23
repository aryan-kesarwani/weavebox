import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArweaveWallet, useDarkMode } from '../utils/util';
import { createWallet, userSignIn } from '../utils/wallet';
import { setUserAddress } from '../redux/slices/arConnectionSlice';
import { useDispatch } from 'react-redux';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [walletAddressInput, setWalletAddressInput] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Use the custom hooks
  const { 
    userAddress, 
    handleConnectWallet, 
    handleDisconnect, 
    copyToClipboard 
  } = useArweaveWallet();
  
  // Determine if connected based on userAddress being present
  const isConnected = !!userAddress;

  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCreateWallet = async () => {
    try {
      const result = await createWallet();
      if (result) {
        const { address } = result;

        console.log("Wallet created successfully");
        dispatch(setUserAddress(address));
        alert("Wallet created successfully!");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error in wallet creation:", error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Attempting to sign in with:", walletAddressInput, username);
      const success = await userSignIn(walletAddressInput, username);
      
      if (success) {
        console.log("Sign in successful!");
        dispatch(setUserAddress(walletAddressInput));
        setShowSignInModal(false);
        navigate('/dashboard');
      } else {
        alert("Sign in failed. Please check your wallet address and username.");
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      alert("An error occurred during sign in.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-tr dark:from-purple-700 dark:via-white dark:to-green-500 transition-colors duration-200">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-md z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 ml-2 sm:ml-4">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  CurioWeave
                </span>
              </div>
            </div>
            
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
              
              {isConnected ? 
            <div className="flex justify-center items-center space-x-6">
            <div onMouseEnter={() => setIsHovered(true)}  
                onMouseLeave={() => setIsHovered(false)} 
                className="relative flex justify-center items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg text-lg h-[50px] min-w-[150px]">
                
                <span className="flex items-center whitespace-nowrap">{userAddress.slice(0,6)}...
                <button onClick={copyToClipboard} className="cursor-pointer transition hover:scale-90 duration-200 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
                    <path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
                    </svg>
                </button>
                </span> 
                {isHovered && <div className="w-max absolute  top-20 rounded-md shadow-md bg-black text-white text-lg font-semibold p-4">
                {userAddress}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full h-0 w-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-black">
                </div>
                </div>} 
            </div>
            <button onClick={handleDisconnect} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg text-lg h-[50px] min-w-[150px]">
                Disconnect Wallet
            </button>
            </div>
            : <button onClick={handleConnectWallet} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg text-lg">
                Connect Wallet
            </button>
            }
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
            <div className="px-3 pt-3 pb-4 space-y-2 sm:px-4">
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
              <div className="flex justify-center p-2">
                <button
                  onClick={handleConnectWallet}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg text-lg"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-28">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] text-center">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                CurioWeave
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover and explore curated Web3 content in our decentralized application platform
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-white dark:bg-black/30 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="text-blue-600 dark:text-blue-400 mb-4">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Curated Content</h3>
                <p className="text-gray-600 dark:text-gray-400">Access hand-picked Web3 content from trusted sources</p>
              </div>
              
              <div className="p-6 bg-white dark:bg-black/30 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="text-purple-600 dark:text-purple-400 mb-4">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure Platform</h3>
                <p className="text-gray-600 dark:text-gray-400">Built on blockchain technology for maximum security</p>
              </div>
              
              <div className="p-6 bg-white dark:bg-black/30 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Community Driven</h3>
                <p className="text-gray-600 dark:text-gray-400">Join a thriving community of Web3 enthusiasts</p>
              </div>
            </div>
            
            {/* Create new wallet Button */}
            <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6">
              <button 
                onClick={handleCreateWallet} 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl text-lg min-w-[220px]"
              >
                Create new wallet
              </button>
              
              <button 
                onClick={() => setShowSignInModal(true)} 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl text-lg min-w-[220px]"
              >
                Sign in with wallet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowSignInModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sign in with wallet</h3>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Wallet Address
                </label>
                <input
                  id="walletAddress"
                  type="text"
                  value={walletAddressInput}
                  onChange={(e) => setWalletAddressInput(e.target.value)}
                  placeholder="Enter your wallet address"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
