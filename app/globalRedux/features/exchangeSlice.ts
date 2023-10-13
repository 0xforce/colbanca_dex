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
    isError?: boolean | null;
  };
  transferInProgress: boolean;
  allOrders: {
    loaded: boolean;
    data: any[];
  };
  cancelledOrders: {
    data: any[];
  };
  filledOrders: {
    data: any[];
  };
  index: number;
  data: any[];
  events: any[]
}

const initialState: ExchangeState = {
    exchange: { loaded: false, contract: null},
    balances: ['0', '0'],
    transaction: { transactionType: '', isPending: null, isSuccessful: null},
    transferInProgress: true,
    allOrders: {
      loaded: false, 
      data: []
    },
    cancelledOrders: {
      data: []
    },
    filledOrders: {
      data: []
    },
    index: 0,
    data: [],
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
      state.transaction = {transactionType: 'Transfer', isPending: false, isSuccessful: false, isError: true};
      state.transferInProgress = false;
    },
    setOrderRequest: (state) => {
      state.transaction ={transactionType: 'New Order', isPending: true, isSuccessful: false}
    },
    setOrderSuccess: (state, action) => {
      // Prevent duplicate orders
      state.index = state.allOrders.data.findIndex(order => order.id.toString() === action.payload.orderId?.toString())

      if(state.index === -1) {
        state.data = [...state.allOrders.data, action.payload.args]
      } else {
        state.data = state.allOrders.data
      }
      state.allOrders = {...state.allOrders, data: state.data }
      state.transaction = {transactionType: 'New Order', isPending: false, isSuccessful: true};
      state.events = [action.payload, ...state.events];
    },
    setOrderFail: (state) => {
      state.transaction = {transactionType: 'New Order', isPending: false, isSuccessful: false, isError: true};
    },
    allOrdersLoaded: (state, action) => {
      state.allOrders = {loaded: true, data: action.payload}
    },
    cancelledOrdersLoaded: (state, action) => {
      state.cancelledOrders = {data: action.payload}
    },
    filledOrdersLoaded: (state, action) => {
      state.filledOrders = {data: action.payload}
    },
    //----------------------------------------------------
    // Cancelling Orders
    setOrderCancelRequest: (state) => {
      state.transaction = {transactionType: 'Cancel', isPending: true, isSuccessful: false};
    },
    setOrderCancelSuccess: (state, action) => {
      state.transaction = {transactionType: 'Cancel', isPending: false, isSuccessful: true};
      state.cancelledOrders = {
        ...state.cancelledOrders, 
        data: [
          ...state.cancelledOrders.data,
          action.payload.args
        ]
      };
      state.events = [action.payload, ...state.events];
    },
    setOrderCancelFail: (state) => {
      state.transaction = {transactionType: 'Cancel', isPending: false, isSuccessful: false, isError: true};
    },
    //----------------------------------------------------
    // Filling Orders
    setOrderFillRequest: (state) => {
      state.transaction = {transactionType: 'Fill Order', isPending: true, isSuccessful: false};
    },
    setOrderFillSuccess: (state, action) => {
      // Prevent duplicate orders
      let index = state.filledOrders.data.findIndex((order) => order.id.toString() == action.payload.args.id.toString());
      let data;

      if(index === -1) {
        data = [...state.filledOrders.data, action.payload.args]
      } else {
        data = state.filledOrders.data
      }

      state.transaction = {transactionType: 'Fill Order', isPending: false, isSuccessful: true};
      state.filledOrders = {
        ...state.filledOrders,
        data
      }
      state.events = [action.payload, ...state.events];
    },
    setOrderFillFail: (state) => {
      state.transaction = {transactionType: 'Fill Order', isPending: false, isSuccessful: false, isError: true};
    },
  },
});

export const { setExchange, setExchangeBalances, setTransferRequest, setTransferSuccess, transferFail, setOrderRequest, setOrderSuccess, setOrderFail, allOrdersLoaded, cancelledOrdersLoaded, filledOrdersLoaded, setOrderCancelRequest, setOrderCancelSuccess, setOrderCancelFail, setOrderFillRequest, setOrderFillSuccess, setOrderFillFail } = exchangeSlice.actions;

export default exchangeSlice.reducer;