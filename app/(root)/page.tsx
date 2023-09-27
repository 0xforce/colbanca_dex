"use client";

import { useEffect } from 'react';
import { ethers } from 'ethers';
import TOKEN_ABI from '../../constants/abis/Token.json';
import { loadToken } from '../globalRedux/interactions'
import configJson from '../../config.json';

import { useAppDispatch, useAppSelector } from '../globalRedux/hooks';
import {setProvider, setChainId, setAccount} from '../globalRedux/features/connectionSlice';
import { setCBNK } from '../globalRedux/features/tokensSlice';

// Define a type for your configuration
interface ChainConfig {
  exchange: { address: string };
  CBNK: { address: string };
  mETH: { address: string };
  mDAI: { address: string };
  // Add other properties as needed
}

// Perform the type assertion when importing
const config: Record<string, ChainConfig> = configJson as Record<string, ChainConfig>;

export default function Home() {
  const provider = useAppSelector(state => state.connectionReducer.provider)
  const chainId = useAppSelector(state => state.connectionReducer.chainId)
  const dispatch = useAppDispatch()

  const loadBlockchainData = async () => {
    try {
      // Ensure that MetaMask or a similar provider is available
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        dispatch(setAccount(account))

        //Connect ethers to blockchain
        const loadProvider = new ethers.providers.Web3Provider(window.ethereum);
        dispatch(setProvider(loadProvider))

        const { chainId } = await loadProvider.getNetwork();
        dispatch(setChainId(chainId))

        const token = await loadToken(loadProvider, config[chainId].CBNK.address, TOKEN_ABI )
        dispatch(setCBNK(token))

      } else {
        console.error('Provider not detected. Please install MetaMask or a similar wallet.');
      }
    } catch (error) {
      console.error('Error requesting data:', error);
    }
  }

  useEffect(() => {
    loadBlockchainData();
  }, [])
  

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  )
}
