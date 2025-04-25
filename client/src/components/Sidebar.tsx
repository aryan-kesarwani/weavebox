import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiFolder, FiGlobe } from 'react-icons/fi';
import { isGoogleConnected } from '../utils/googleAuth';

type SidebarProps = {
  isSidebarOpen: boolean;
  currentPage: 'dashboard' | 'upload' | 'uploads' | 'google-drive' | 'arweavefiles';
};

const Sidebar = ({ isSidebarOpen, currentPage }: SidebarProps) => {
  const navigate = useNavigate();
  const connected = isGoogleConnected();

  const handleGoogleDriveClick = () => {
    if (connected) {
      navigate('/google-drive');
    } else {
      // Trigger Google login
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive',
        callback: (response: { access_token: string }) => {
          if (response.access_token) {
            localStorage.setItem('google_access_token', response.access_token);
            localStorage.setItem('google_token_timestamp', Date.now().toString());
            localStorage.setItem('google_connected', 'true');
            navigate('/google-drive');
          }
        },
      });
      client.requestAccessToken();
    }
  };

  return (
    <motion.div
      initial={{ width: '250px' }}
      animate={{ width: isSidebarOpen ? '250px' : '0px' }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg z-40 overflow-hidden"
    >
      <div className="p-4 space-y-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
            currentPage === 'dashboard' ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <FiUpload size={20} />
          <span>Dashboard</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/upload')}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
            currentPage === 'upload' ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <FiUpload size={20} />
          <span>Upload</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/uploads')}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
            currentPage === 'uploads' ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <FiFolder size={20} />
          <span>Recent Uploads</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/arweavefiles')}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
            currentPage === 'arweavefiles' ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <FiGlobe size={20} />
          <span>All Files</span>
        </motion.button>




        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogleDriveClick}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
            currentPage === 'google-drive' ? 'bg-gray-100 dark:bg-gray-700' : ''
          }`}
        >
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3 1.4.8 2.95 1.2 4.5 1.2h47.4c1.55 0 3.1-.4 4.5-1.2 1.35-.8 2.5-1.9 3.3-3.3l3.85-6.65-70.7 0z" fill="#0066da"/>
            <path d="m45.15 12.1-28.1 48.8h56.2z" fill="#00ac47"/>
            <path d="m18.25 66.85 27-46.75-8.5-14.6c-.8-1.4-1.95-2.5-3.3-3.3-1.4-.8-2.95-1.2-4.5-1.2h-22.4l36.2 62.75z" fill="#ea4335"/>
            <path d="m73.55 20.5h-22.4c-1.55 0-3.1.4-4.5 1.2-1.35.8-2.5 1.9-3.3 3.3l-25.05 43.4 22.4-38.85z" fill="#00832d"/>
            <path d="m45.15 12.1-19.4 33.75-18-31.2c-.8 1.4-1.2 2.95-1.2 4.5v43.4c0 1.55.4 3.1 1.2 4.5l28.1-48.8z" fill="#2684fc"/>
            <path d="m73.05 66.85c.8-1.4 1.2-2.95 1.2-4.5v-43.4c0-1.55-.4-3.1-1.2-4.5l-36.2 62.75h32.9c1.55 0 3.1-.4 4.5-1.2 1.35-.8 2.5-1.9 3.3-3.3z" fill="#ffba00"/>
          </svg>
          <span>
            {connected ? 'Google Drive' : 'Connect Google Drive'}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;