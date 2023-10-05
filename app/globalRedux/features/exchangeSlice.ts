import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

// Define the state type
interface ExchangeState {
  exchange: {
    loaded: boolean;
    contract: any;
  };
  balances: string[];
  transaction: {
    transactionType: string;
    isPending: boolean | null;
    isSuccessful: boolean | null;
  };
  transferInProgress: boolean;
  isError?: boolean | null;
  events: any[]
}

const initialState: ExchangeState = {
    exchange: { loaded: false, contract: null},
    balances: ['0', '0'],
    transaction: { transactionType: '', isPending: null, isSuccessful: null},
    transferInProgress: true,
    events: []
};

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    setExchange: (state, action: PayloadAction<{loaded: boolean; exchange: ethers.Contract;}>) => {
      state.exchange.loaded = action.payload.loaded;
      state.exchange.contract = action.payload.exchange;
    },
    setExchangeBalances: (state, action: PayloadAction<{exchange_token_1: string; exchange_token_2: string;}>) => {
      state.balances = [action.payload.exchange_token_1, action.payload.exchange_token_2];
    },
    setTransferRequest: (state) => {
      state.transaction = {transactionType: 'Transfer', isPending: true, isSuccessful: false};
      state.transferInProgress = true;
    },
    setTransferSuccess: (state, action) => {
      state.transaction = {transactionType: 'Transfer', isPending: false, isSuccessful: true};
      state.transferInProgress = false;
      state.events = [action.payload, ...state.events];
    },
    transferFail: (state) => {
      state.transaction = {transactionType: 'Transfer', isPending: false, isSuccessful: false};
      state.transferInProgress = false;
      state.isError = true;
    },
  },
});

export const { setExchange, setExchangeBalances, setTransferRequest, setTransferSuccess, transferFail } = exchangeSlice.actions;

export default exchangeSlice.reducer;