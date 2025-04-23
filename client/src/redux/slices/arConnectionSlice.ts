import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { JWKInterface } from "arweave/node/lib/wallet";

interface ArConnectionState {
    isConnected: boolean;
    userAddress: string;
    userInterests: string[];
    walletKey: JWKInterface;
}

const initialState: ArConnectionState = {
    isConnected: false,
    userAddress: '',
    userInterests: [],
    walletKey: {} as JWKInterface,
};

const arConnectionSlice = createSlice({
    name: 'arConnection',
    initialState,
    reducers: {
        setIsConnected: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        setUserAddress: (state, action: PayloadAction<string>) => {
            state.userAddress = action.payload;
        },
        setUserInterests: (state, action: PayloadAction<string[]>) => {
            state.userInterests = action.payload;
        },
        setWalletKey : (state, action : PayloadAction<JWKInterface>) => {
            state.walletKey = action.payload;
        }
    }
})

export const { setIsConnected, setUserAddress, setUserInterests, setWalletKey } = arConnectionSlice.actions;
export default arConnectionSlice.reducer;
