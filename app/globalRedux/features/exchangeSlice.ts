import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

// Define the state type
interface ExchangeState {
  exchange: {
    loaded: boolean;
    contract: any;
  };
}

const initialState: ExchangeState = {
    exchange: { loaded: false, contract: null},
};

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    setExchange: (state, action: PayloadAction<{loaded: boolean; exchange: ethers.Contract;}>) => {
      state.exchange.loaded = action.payload.loaded;
      state.exchange.contract = action.payload.exchange;
    },
  },
});

export const { setExchange } = exchangeSlice.actions;

export default exchangeSlice.reducer;