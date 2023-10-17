"use client"

import Image from 'next/image'
import dapp from '../public/assets/dapp.svg'
import eth from '../public/assets/eth.svg'
import { useEffect, useState, useRef, RefObject } from 'react'
import { ethers } from 'ethers'

import { useAppSelector, useAppDispatch } from '@/app/globalRedux/hooks'
import { loadTokensBalances, loadExchangeBalances, transferTokens } from '../app/globalRedux/interactions'

import { setTokensBalances } from '../app/globalRedux/features/tokensSlice'
import { setExchangeBalances } from '../app/globalRedux/features/exchangeSlice'

const Balance = () => {
    const [isDeposit, setIsDeposit] = useState(true)
    const [token1TransferAmount, setToken1TransferAmount] = useState('0')
    const [token2TransferAmount, setToken2TransferAmount] = useState('0')

    const dispatch = useAppDispatch();

    const provider = useAppSelector(state => state.connectionReducer.provider);
    const account = useAppSelector(state => state.connectionReducer.account.address);

    const exchange = useAppSelector(state => state.exchangeReducer.exchange.contract);
    const exchangeBalances = useAppSelector(state => state.exchangeReducer.balances);
    const transferInProgress = useAppSelector(state => state.exchangeReducer.transferInProgress);

    const symbols = useAppSelector(state => state.tokensReducer.Pair.symbols);
    const tokens = useAppSelector(state => state.tokensReducer.Pair.contracts); 
    const tokenBalances = useAppSelector(state => state.tokensReducer.balances); 

    const loadBalance = async () => {
        const tokenBalances = await loadTokensBalances( tokens, account);
        dispatch(setTokensBalances(tokenBalances));
        const exchangeBalances = await loadExchangeBalances( exchange, tokens, account);
        dispatch(setExchangeBalances(exchangeBalances));
    }

    const depositRef: RefObject<HTMLButtonElement>  = useRef(null)
    const withdrawRef: RefObject<HTMLButtonElement> = useRef(null)

    const tabHandler = (e: any) => {
        if(depositRef.current && e.target.className !== depositRef.current.className) {
            e.target.className = 'tab tab--active'
            depositRef.current.className = 'tab'
            setIsDeposit(false)
        } else if (withdrawRef.current) {
            e.target.className = 'tab tab--active'
            withdrawRef.current.className = 'tab'
            setIsDeposit(true)
        }
    }

    const amountHandler = (e: any, token: ethers.Contract) => {
        if (token.address === tokens[0]?.address) {
            setToken1TransferAmount(e.target.value)
        } else {
            setToken2TransferAmount(e.target.value)
        }
    }

    const depositHandler = (e: any, token: ethers.Contract) => {
        e.preventDefault();
      
        if (provider) {
          if (token.address === tokens[0]?.address) {
            transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch);
            setToken1TransferAmount('0');
          } else {
            transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch);
            setToken2TransferAmount('0');
          }
        } else {
          console.error('Provider is null. Cannot perform deposit.');
        }
    };

    const withdrawHandler = (e: any, token: ethers.Contract) => {
        e.preventDefault();
      
        if (provider) {
          if (token.address === tokens[0]?.address) {
            transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch);
            setToken1TransferAmount('0');
          } else {
            transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch);
            setToken2TransferAmount('0');
          }
        } else {
          console.error('Provider is null. Cannot perform deposit.');
        }
    };

    useEffect(() => {
        if (exchange && account && tokens && tokens.length >= 2 && tokens[0]?.address && tokens[1]?.address) {
            loadBalance();
        }
    }, [exchange, account, tokens, transferInProgress, dispatch])
    

    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
            <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><Image src={dapp} alt='Token Logo'/>{symbols && symbols[0]}</p>
            <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
            <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
          </div>
  
          <form onSubmit={isDeposit ? ((e) => depositHandler(e, tokens[0])) : ((e) => withdrawHandler(e, tokens[0]))}>
            <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
            <input 
                type="text" 
                id='token0' 
                placeholder='0.0000' 
                value={token1TransferAmount === '0' ? '' : token1TransferAmount}
                onChange={(e) => amountHandler(e, tokens[0])} 
            />
  
            <button className='button' type='submit'>
                {isDeposit ? (<span>Deposit</span>) : (<span>Withdraw</span>)}
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><Image src={eth} alt='Token Logo'/>{symbols && symbols[1]}</p>
            <p><small>Wallet</small><br />{tokenBalances && tokenBalances[1]}</p>
            <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[1]}</p>
          </div>
  
          <form onSubmit={isDeposit ? ((e) => depositHandler(e, tokens[1])) : ((e) => withdrawHandler(e, tokens[1]))}>
            <label htmlFor="token1">{symbols && symbols[1]} Amount</label>
            <input 
                type="text" 
                id='token1' 
                placeholder='0.0000'
                value={token2TransferAmount === '0' ? '' : token2TransferAmount}
                onChange={(e) => amountHandler(e, tokens[1])} 
            />
  
            <button className='button' type='submit'>
                {isDeposit ? (<span>Deposit</span>) : (<span>Withdraw</span>)}
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;