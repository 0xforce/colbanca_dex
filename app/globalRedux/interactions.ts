import { ethers } from 'ethers';
import TOKEN_ABI from '../../constants/abis/Token.json';
import EXCHANGE_ABI from '../../constants/abis/Exchange.json';

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