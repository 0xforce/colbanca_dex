"use client";

import { useEffect } from 'react';
import { ethers } from 'ethers';
import { loadAccount, loadTokens, loadExchange } from '../globalRedux/interactions'
import configJson from '../../config.json';

import { useAppDispatch, useAppSelector } from '../globalRedux/hooks';
import {setProvider, setChainId, setAccount} from '../globalRedux/features/connectionSlice';
import { setPair1 } from '../globalRedux/features/tokensSlice';
import { setExchange } from '../globalRedux/features/exchangeSlice';

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
        
        //Connect ethers to blockchain
        const loadProvider = new ethers.providers.Web3Provider(window.ethereum);
        dispatch(setProvider(loadProvider))
        
        // Fetch current account and balance from Metamask
        const account = await loadAccount(loadProvider);
        dispatch(setAccount(account))

        //Fetch current network's chainId
        const { chainId } = await loadProvider.getNetwork();
        dispatch(setChainId(chainId))

        // Load token smart contracts
        const CBNK = config[chainId].CBNK
        const mETH = config[chainId].mETH
        const pair1 = await loadTokens(loadProvider, [CBNK.address, mETH.address])
        dispatch(setPair1(pair1))

        // Load exchange smart contract
        const exchangeConfig = config[chainId].exchange;
        const exchange = await loadExchange(loadProvider, exchangeConfig.address)
        dispatch(setExchange(exchange))

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
