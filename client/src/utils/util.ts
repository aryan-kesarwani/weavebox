import { useDispatch, useSelector } from "react-redux";
import { setIsConnected, setUserAddress, setUserInterests } from "../redux/slices/arConnectionSlice";
import { useNavigate } from "react-router-dom";
import { setDarkMode } from "../redux/slices/darkModeSlice";

// Define RootState type that matches our redux structure
interface RootState {
  arConnectionState: {
    isConnected: boolean;
    userAddress: string;
    userInterests: string[];
  };
  darkModeState: boolean;
}

// Move hooks into custom hook
export const useArweaveWallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userAddress, userInterests } = useSelector((state: RootState) => state.arConnectionState);

  const handleConnectWallet = async () => {
    await window.arweaveWallet.connect(
      ['ACCESS_ADDRESS', 'SIGN_TRANSACTION'],
      {
        name: 'CurioWeave',
        logo: 'https://arweave.net/logo.png'
      },
      { host: 'localhost', port: 1948, protocol: 'http' }
    );

    dispatch(setIsConnected(true));
    await getActiveAddress();
    navigate('/profile');
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