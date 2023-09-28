import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

// Define the state type
interface TokensState {
  Pair1: {
    token_1_loaded: boolean;
    token_2_loaded: boolean;
    contracts: any[];
    symbols: string[];
  };
}

const initialState: TokensState = {
    Pair1: { token_1_loaded: false, token_2_loaded: false, contracts: [], symbols: [] },
};

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setPair1: (state, action: PayloadAction<{ token_1_loaded: boolean; token_2_loaded: boolean; token: ethers.Contract; symbol: string; token2: ethers.Contract; symbol2: string }>) => {
      state.Pair1.token_1_loaded = action.payload.token_1_loaded;
      state.Pair1.contracts = [...state.Pair1.contracts, action.payload.token];
      state.Pair1.symbols = [...state.Pair1.symbols, action.payload.symbol];

      state.Pair1.token_2_loaded = action.payload.token_2_loaded;
      state.Pair1.contracts = [...state.Pair1.contracts, action.payload.token2];
      state.Pair1.symbols = [...state.Pair1.symbols, action.payload.symbol2];
    },
  },
});

export const { setPair1 } = tokensSlice.actions;

export default tokensSlice.reducer;
