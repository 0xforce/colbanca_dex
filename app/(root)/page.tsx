"use client";

import { useEffect } from 'react';
import { ethers } from 'ethers';
import { loadTokens, loadExchange, loadAccount, subscribeToEvents, loadAllOrders } from '../globalRedux/interactions'
import configJson from '../../config.json';

import { useAppDispatch, useAppSelector } from '../globalRedux/hooks';
import {setProvider, setChainId, setAccount} from '../globalRedux/features/connectionSlice';
import { setPair } from '../globalRedux/features/tokensSlice';
import { setExchange } from '../globalRedux/features/exchangeSlice';

import Navbar from '../../components/Navbar'
import Markets from '../../components/Markets'
import Balance from '../../components/Balance'
import Order from '../../components/Order'
import PriceChart from '../../components/PriceChart'
import Transactions from '../../components/Transactions'
import Trades from '../../components/Trades'
import OrderBook from '../../components/OrderBook'
import Alert from '../../components/Alert'

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
  const dispatch = useAppDispatch()

  const loadBlockchainData = async () => {
    try {
      // Ensure that MetaMask or a similar provider is available
      if (window.ethereum) {
        
        //Connect ethers to blockchain
        const loadProvider = new ethers.providers.Web3Provider(window.ethereum);
        dispatch(setProvider(loadProvider))

        //Fetch current network's chainId
        const { chainId } = await loadProvider.getNetwork();
        dispatch(setChainId(chainId))

        // reload page when network changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload()
        })

        // Fetch current account and balance from Metamask when changed
        window.ethereum.on('accountsChanged', async () => {
          const account = await loadAccount(loadProvider);
          dispatch(setAccount(account))
        })

        // Load token smart contracts
        const CBNK = config[chainId].CBNK
        const mETH = config[chainId].mETH
        const pair = await loadTokens(loadProvider, [CBNK.address, mETH.address])
        dispatch(setPair(pair))

        // Load exchange smart contract
        const exchangeConfig = config[chainId].exchange;
        let data = await loadExchange(loadProvider, exchangeConfig.address)
        dispatch(setExchange(data))

        //Listen to events
        const {exchange} = await loadExchange(loadProvider, exchangeConfig.address)
        if (exchange) {
          // Fetch all orders: open, filled, cancelled
          loadAllOrders(loadProvider, exchange, dispatch)

          //Listen to Events
          subscribeToEvents(exchange, dispatch);
        }

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

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart />

          <Transactions />

          <Trades />

          <OrderBook />

        </section>
      </main>

      <Alert />

    </div>
  )
}
