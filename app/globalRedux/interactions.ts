import { ethers } from 'ethers';
import TOKEN_ABI from '../../constants/abis/Token.json';
import EXCHANGE_ABI from '../../constants/abis/Exchange.json';
import { Dispatch } from '@reduxjs/toolkit'

import { setTransferRequest, setTransferSuccess, transferFail, setOrderRequest, setOrderSuccess, setOrderFail, allOrdersLoaded, cancelledOrdersLoaded, filledOrdersLoaded, setOrderCancelRequest, setOrderCancelFail, setOrderCancelSuccess, setOrderFillRequest, setOrderFillFail, setOrderFillSuccess } from './features/exchangeSlice';

type LoadTokenResult = {
  token: any;
  symbol: string;
  token_1_loaded: boolean;
  token2: any;
  symbol2: string;
  token_2_loaded: boolean;
};

type LoadExchangeResult = {
    exchange: ethers.Contract;
    loaded: boolean;
}

export const loadAccount = async (provider: ethers.providers.JsonRpcProvider) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = ethers.utils.getAddress(accounts[0])

    let balance = await provider.getBalance(address)
    const formatBalance = ethers.utils.formatEther(balance)

    return {address, balance: formatBalance};
}

export const loadTokens = async (
  provider: ethers.providers.JsonRpcProvider,
  addresses: string[]
): Promise<LoadTokenResult> => {
  let token: any;
  let symbol: string;
  let token2: any;
  let symbol2: string;
  
  const token_1_loaded = true;
  token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
  symbol = await token.symbol();

  const token_2_loaded = true;
  token2 = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
  symbol2 = await token2.symbol();

  return { token, symbol, token_1_loaded, token2, symbol2, token_2_loaded};
};

export const loadExchange = async (
  provider: ethers.providers.JsonRpcProvider,
  address: string
): Promise<LoadExchangeResult> => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    const loaded = true;
    return {exchange, loaded};
};

export const subscribeToEvents = (exchange: ethers.Contract, dispatch: Dispatch): void => {
  exchange.on('Deposit', (token, user, amount, balance, event) => {
    // Dispatch the action with the event payload
    dispatch(setTransferSuccess(event));
  });

  exchange.on('Withdraw', (token, user, amount, balance, event) => {
    // Dispatch the action with the event payload
    dispatch(setTransferSuccess(event));
  });

  exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
    dispatch(setOrderSuccess(event))
  })

  exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
    dispatch(setOrderCancelSuccess(event))
  })

  exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {
    dispatch(setOrderFillSuccess(event))
  })

  // Handle errors, if necessary
  exchange.on('error', (error) => {
    console.error('Error in event listener:', error);
  });
}


// Load user Balances (wallet & Exchange Balances)

export const loadTokensBalances = async (tokens: ethers.Contract[], account: string) => {
  const balance_token_1 = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
  const balance_token_2 = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
  
  return {balance_token_1, balance_token_2}
}

export const loadExchangeBalances = async (exchange: ethers.Contract, tokens: ethers.Contract[], account: string) => {
  const exchange_token_1 = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
  const exchange_token_2 = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
  
  return { exchange_token_1, exchange_token_2}
}


/// LOAD ALL ORDERS

export const loadAllOrders = async (provider: ethers.providers.JsonRpcProvider, exchange: ethers.Contract, dispatch: Dispatch) => {
  const block = await provider.getBlockNumber()

  // Fetch canceled orders
  const cancelStream = await exchange.queryFilter('Cancel', 0, block)
  const cancelledOrders = cancelStream.map(event => event.args)

  dispatch(cancelledOrdersLoaded(cancelledOrders))

  // Fetch filled orders
  const tradeStream = await exchange.queryFilter('Trade', 0, block)
  const filledOrders = tradeStream.map(event => event.args)

  dispatch(filledOrdersLoaded(filledOrders))

  //Fetch all orders
  const orderStream = await exchange.queryFilter('Order', 0, block)
  const allOrders = orderStream.map(event => event.args)

  dispatch(allOrdersLoaded(allOrders))
}

///---------------------------------------------------------------------------------------
/// Transfer tokens

export const transferTokens = async (provider: ethers.providers.JsonRpcProvider, exchange: ethers.Contract, transferType: string, token: ethers.Contract, amount: string, dispatch: Dispatch) => {
  let transaction
  dispatch(setTransferRequest())

  try {
    const signer = await provider.getSigner()
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)
    
    if(transferType === 'Deposit') {
      transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
      await transaction.wait()
      transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
    } else {
      transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
    }

    await transaction.wait()
    
  } catch (error) {
    dispatch(transferFail())
  }
}

// Orders (Buy & Sell)

export const makeBuyOrder = async (provider: ethers.providers.JsonRpcProvider, exchange: ethers.Contract, tokens: ethers.Contract[], order: any, dispatch: Dispatch) => {
  const tokenGet = tokens[0].address
  const amountGet = ethers.utils.parseUnits(order.amount, 18)
  const tokenGive = tokens[1].address
  const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)

  dispatch(setOrderRequest())

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    await transaction.wait()
    
  } catch (error) {
    dispatch(setOrderFail())
  }
}

export const makeSellOrder = async (provider: ethers.providers.JsonRpcProvider, exchange: ethers.Contract, tokens: ethers.Contract[], order: any, dispatch: Dispatch) => {
  const tokenGet = tokens[1].address
  const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)
  const tokenGive = tokens[0].address
  const amountGive = ethers.utils.parseUnits(order.amount, 18)

  dispatch(setOrderRequest())

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
    await transaction.wait()
    
  } catch (error) {
    dispatch(setOrderFail())
  }
}
//-----------------------------------------------------------------------------------
// CANCEL ORDER

export const cancelOrder = async(provider: ethers.providers.JsonRpcProvider, exchange: ethers.Contract, order: any, dispatch: Dispatch) => {

  dispatch(setOrderCancelRequest())

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).cancelOrder(order.id)
    await transaction.wait()
    
  } catch (error) {
    dispatch(setOrderCancelFail())
  }
}

//-----------------------------------------------------------------------------------
// FILL ORDER

export const fillOrder = async (provider: ethers.providers.JsonRpcProvider, exchange: ethers.Contract, order: any, dispatch: Dispatch) => {
  dispatch(setOrderFillRequest())

  try {
    const signer = await provider.getSigner()
    const transaction = await exchange.connect(signer).fillOrder(order.id)
    await transaction.wait()
    
  } catch (error) {
    dispatch(setOrderFillFail())
  }
}
