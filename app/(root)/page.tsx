"use client";

import { useEffect } from 'react';
import { ethers } from 'ethers';
import TOKEN_ABI from '../../constants/abis/Token.json';
import configJson from '../../config.json';

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

  const loadBlockchainData = async () => {
    try {
      // Ensure that MetaMask or a similar provider is available
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log(accounts[0]);

        //Connect ethers to blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        let { chainId } = await provider.getNetwork()
        console.log(chainId)
        chainId = typeof chainId === 'number' ? chainId : parseInt(chainId, 10);

        // Token Smart Contract
        const token = new ethers.Contract(config[chainId].CBNK.address, TOKEN_ABI, provider)
        console.log(token.address)
        const symbol = await token.symbol()
        console.log(symbol)

      } else {
        console.error('Ethereum provider not detected. Please install MetaMask or a similar wallet.');
      }
    } catch (error) {
      console.error('Error requesting Ethereum accounts:', error);
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
