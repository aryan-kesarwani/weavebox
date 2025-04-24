import { useDispatch, useSelector } from "react-redux";
import { setIsConnected, setUserAddress, setUserInterests } from "../redux/slices/arConnectionSlice";
import { useNavigate } from "react-router-dom";
import { setDarkMode } from "../redux/slices/darkModeSlice";
import { useState } from "react";

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
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(() => {
    const savedUser = localStorage.getItem('google_user_info');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const setGoogleUserInfo = (userInfo: GoogleUserInfo | null) => {
    setGoogleUser(userInfo);
    if (userInfo) {
      localStorage.setItem('google_user_info', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('google_user_info');
    }
  };

  const disconnectGoogle = () => {
    setGoogleUserInfo(null);
    localStorage.removeItem('googleAccessToken');
  };

  return { googleUser, setGoogleUserInfo, disconnectGoogle };
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