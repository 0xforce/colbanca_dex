import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state type
interface TokensState {
  CBNKToken: {
    loaded: boolean;
    contract: string | null;
    symbol: string | null;
  };
}

const initialState: TokensState = {
    CBNKToken: { loaded: false, contract: null, symbol: null },
};

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setCBNK: (state, action: PayloadAction<{ loaded: boolean; token: any; symbol: string }>) => {
      state.CBNKToken.loaded = action.payload.loaded;
      state.CBNKToken.contract = action.payload.token;
      state.CBNKToken.symbol = action.payload.symbol;
    },
  },
});

export const { setCBNK } = tokensSlice.actions;

export default tokensSlice.reducer;
