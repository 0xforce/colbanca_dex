import {createSlice} from '@reduxjs/toolkit';

export const connectionSlice = createSlice({
    name: 'connection',
    initialState: {
        provider: null,
        chainId: null,
        account: null,
    },
    reducers: {
        setProvider: (state, action) => {
            state.provider = action.payload;
        },
        setChainId: (state, action) => {
            state.chainId = action.payload;
        },
        setAccount: (state, action) => {
            state.account = action.payload;
        }
    }
})

export const {setProvider, setChainId, setAccount} = connectionSlice.actions

export default connectionSlice.reducer