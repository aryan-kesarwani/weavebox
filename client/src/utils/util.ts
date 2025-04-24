import { useDispatch, useSelector } from "react-redux";
import { setIsConnected, setUserAddress, setUserInterests } from "../redux/slices/arConnectionSlice";
import { useNavigate } from "react-router-dom";
import { setDarkMode } from "../redux/slices/darkModeSlice";
import { useState, useEffect } from "react";

// Define RootState type that matches our redux structure
interface RootState {
  arConnectionState: {
    isConnected: boolean;
    userAddress: string;
    userInterests: string[];
  };
  darkModeState: boolean;
}

// Google user type
export interface GoogleUserInfo {
  name: string;
  email: string;
  picture: string;
  id: string;
  accessToken: string;
}

// Hook for Google user info
export const useGoogleUser = () => {
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(null);

  useEffect(() => {
    function getGoogleUser(): GoogleUserInfo | null {
      const user = localStorage.getItem('google_user');
      return user ? JSON.parse(user) : null;
    }
    
    const storedUser = getGoogleUser();
    if (storedUser) {
      setGoogleUser(storedUser);
    }
  }, []);

  const disconnectGoogle = async () => {
    // Try to revoke the token with Google
    try {
      const user = googleUser || JSON.parse(localStorage.getItem('google_user') || '{}');
      if (user && user.accessToken) {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${user.accessToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }
    } catch (error) {
      console.error('Error revoking Google token:', error);
    }
    
    // Clear from localStorage regardless of revocation success
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_timestamp');
    localStorage.removeItem('google_connected');
    localStorage.removeItem('google_user');
    
    // Update state
    setGoogleUser(null);
  };

  return { googleUser, disconnectGoogle };
};

// Move hooks into custom hook
export const useArweaveWallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userAddress, userInterests } = useSelector((state: RootState) => state.arConnectionState);

  const handleConnectWallet = async () => {
    await window.arweaveWallet.connect(
      ['ACCESS_ADDRESS', 'SIGN_TRANSACTION'],
      {
        name: 'WeaveBox',
        logo: 'https://arweave.net/logo.png'
      },
      { host: 'localhost', port: 1948, protocol: 'http' }
    );

    dispatch(setIsConnected(true));
    await getActiveAddress();
    navigate('/dashboard');
  };

  const handleDisconnect = async () => {
    await window.arweaveWallet.disconnect();
    dispatch(setIsConnected(false));
    dispatch(setUserAddress(''));
    dispatch(setUserInterests([]));
    navigate('/');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userAddress);
    alert("Address Copied to Clipboard");
  };

  const getActiveAddress = async () => {
    const address = await window.arweaveWallet.getActiveAddress();
    dispatch(setUserAddress(address));
    return address;
  };

  const getActivePubKey = async () => {
    const pubkey = await window.arweaveWallet.getActivePublicKey();
    console.log("Active user public key is = " + pubkey);
    return pubkey;
  };

  const updateUserInterests = (interests: string[]) => {
    dispatch(setUserInterests(interests));
  };

  return {
    userAddress,
    userInterests,
    handleConnectWallet,
    handleDisconnect,
    copyToClipboard,
    getActiveAddress,
    getActivePubKey,
    updateUserInterests
  };
};

export const useDarkMode = () => {
    const dispatch = useDispatch();

    const darkMode = useSelector((state: RootState) => state.darkModeState);
    
    const toggleDarkMode = () => {
        dispatch(setDarkMode(!darkMode));
    }

    return { darkMode, toggleDarkMode };
}