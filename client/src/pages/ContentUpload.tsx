import { Link } from 'react-router-dom';
import ContentUploadForm from '../components/ContentUploadForm';
import { useArweaveWallet, useDarkMode } from '../utils/util';

const ContentUpload = () => {
  const { userAddress, handleDisconnect, copyToClipboard } = useArweaveWallet();
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Apply dark mode class to html element
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

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
              <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Dashboard
              </Link>
              
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
              
              {/* User wallet info */}
              {userAddress && (
                <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-28 pb-12">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create New Content
              </h1>
              <Link 
                to="/dashboard" 
                className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
            
            <ContentUploadForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentUpload; 