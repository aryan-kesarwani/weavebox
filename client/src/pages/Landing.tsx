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
  const { handleConnectWallet } = useArweaveWallet();
  
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
                  WeaveBox
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
              
              <button onClick={handleConnectWallet} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg text-lg">
                Connect Wallet
              </button>
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
                WeaveBox
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload and store your files permanently on Arweave with free or paid options
            </p>
            
            {/* Connect Wallet Button */}
            <div className="mt-16 flex items-center justify-center">
              <button 
                onClick={handleConnectWallet} 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl text-lg min-w-[220px]"
              >
                Connect Wallet
              </button>
            </div>

            {/* Comparison Table */}
            <div className="w-full max-w-4xl mx-auto mt-32 mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Why Choose Arweave Over Google Drive?</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-black/30 rounded-xl shadow-xl">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Feature</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-600 dark:text-blue-400">Arweave</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Google Drive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Storage Duration</td>
                      <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">Permanent (200+ years)</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">As long as you pay</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Decentralization</td>
                      <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">Fully decentralized</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Centralized</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Censorship Resistance</td>
                      <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">Highly resistant</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Subject to company policies</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Data Ownership</td>
                      <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">You own your data</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Company controls access</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Cost Model</td>
                      <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">One-time payment</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Recurring subscription</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Privacy</td>
                      <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">End-to-end encryption</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Company can access data</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Testimonials Section */}
            <div className="w-full max-w-6xl mx-auto mt-32 mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-12 text-center">What Our Users Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Testimonial 1 */}
                <div className="bg-white dark:bg-black/30 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      JD
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">John Doe</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Blockchain Developer</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    "WeaveBox has revolutionized how I store my important documents. The permanent storage on Arweave gives me peace of mind knowing my files will be accessible forever."
                  </p>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-white dark:bg-black/30 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      SA
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sarah Anderson</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Digital Artist</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    "As an artist, I need a reliable way to store my digital artwork. WeaveBox's permanent storage ensures my creations will be preserved for future generations."
                  </p>
                </div>

                {/* Testimonial 3 */}
                <div className="bg-white dark:bg-black/30 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      MR
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Michael Roberts</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Research Scientist</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    "The decentralized nature of WeaveBox gives me confidence that my research data will remain accessible and uncensored, regardless of political or corporate changes."
                  </p>
                </div>
              </div>
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

      {/* Footer */}
      <footer className="bg-gray-900/90 dark:bg-black/80 backdrop-blur-sm text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Us */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">About WeaveBox</h3>
              <p className="text-sm opacity-80">
                WeaveBox is a decentralized file storage platform built on Arweave, offering permanent storage solutions for your important files and documents.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Feedback Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Send Feedback</h3>
              <form className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your feedback"
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm opacity-60">
            <p>© {new Date().getFullYear()} WeaveBox. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
