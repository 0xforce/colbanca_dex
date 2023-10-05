import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

// Define the state type
interface TokensState {
  Pair: {
    token_1_loaded: boolean;
    token_2_loaded: boolean;
    contracts: any[];
    symbols: string[];
  };
  balances: string[];
}

const initialState: TokensState = {
    Pair: { token_1_loaded: false, token_2_loaded: false, contracts: [], symbols: [] },
    balances: ['0', '0']
};

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setPair: (state, action: PayloadAction<{ token_1_loaded: boolean; token_2_loaded: boolean; token: ethers.Contract; symbol: string; token2: ethers.Contract; symbol2: string }>) => {
      state.Pair.token_1_loaded = action.payload.token_1_loaded;
      state.Pair.token_2_loaded = action.payload.token_2_loaded;

      // Update contracts and symbols separately for token1 and token2
      state.Pair.contracts = [action.payload.token, action.payload.token2];
      state.Pair.symbols = [action.payload.symbol, action.payload.symbol2];
    },
    setTokensBalances: (state, action: PayloadAction<{ balance_token_1: string; balance_token_2: string }>) => {
      state.balances = [action.payload.balance_token_1, action.payload.balance_token_2];
    },
  },
});

export const { setPair, setTokensBalances } = tokensSlice.actions;

export default tokensSlice.reducer;
