import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import { ethers } from 'ethers';

interface ConnectionState {
    provider: ethers.providers.JsonRpcProvider;
    chainId: string;
    account: {};
}

export const connectionSlice = createSlice({
    name: 'connection',
    initialState: {
        provider: null,
        chainId: null,
        account: {
            address: '0x...0000',
            balance: '0'
        },
    },
    reducers: {
        setProvider: (state, action) => {
            state.provider = action.payload;
        },
        setChainId: (state, action) => {
            state.chainId = action.payload;
        },
        setAccount: (state, action: PayloadAction<{ address: string; balance: string }>) => {
            state.account.address = action.payload.address;
            state.account.balance = action.payload.balance;
        }
    }
})

export const {setProvider, setChainId, setAccount} = connectionSlice.actions

export default connectionSlice.reducer