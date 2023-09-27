import { ethers, ContractInterface } from 'ethers';

type LoadTokenResult = {
  token: ethers.Contract;
  symbol: string;
  loaded: boolean;
};

export const loadToken = async (
  provider: ethers.providers.JsonRpcProvider,
  address: string,
  tokenAbi: ContractInterface
): Promise<LoadTokenResult> => {
  let token: ethers.Contract;
  let symbol: string;
  const loaded = true;

  token = new ethers.Contract(address, tokenAbi, provider);
  symbol = await token.symbol();

  return { token, symbol, loaded};
};
