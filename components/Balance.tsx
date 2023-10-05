import Image from 'next/image'
import dapp from '../public/assets/dapp.svg'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import { useAppSelector, useAppDispatch } from '@/app/globalRedux/hooks'
import { loadTokensBalances, loadExchangeBalances, transferTokens } from '../app/globalRedux/interactions'

import { setTokensBalances } from '../app/globalRedux/features/tokensSlice'
import { setExchangeBalances } from '../app/globalRedux/features/exchangeSlice'

const Balance = () => {
    const [token1TransferAmount, setToken1TransferAmount] = useState('0')

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
            console.log(tokenBalances)
            const exchangeBalances = await loadExchangeBalances( exchange, tokens, account);
            dispatch(setExchangeBalances(exchangeBalances));
            console.log(exchangeBalances)
    }

    const amountHandler = (e: any, token: ethers.Contract) => {
        if (token.address === tokens[0]?.address) {
            setToken1TransferAmount(e.target.value)
        }
    }

    const depositHandler = (e: any, token: ethers.Contract) => {
        e.preventDefault()

        if (provider && token.address === tokens[0]?.address) {
            transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
            setToken1TransferAmount('0')
        }
    }

    useEffect(() => {
        if (exchange && account && tokens && tokens.length >= 2 && tokens[0]?.address && tokens[1]?.address) {
            loadBalance();
        }
    }, [exchange, account, tokens, transferInProgress])
    

    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button className='tab tab--active'>Deposit</button>
            <button className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><Image src={dapp} alt='Token Logo'/>{symbols && symbols[0]}</p>
            <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
            <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
          </div>
  
          <form onSubmit={(e) => depositHandler(e, tokens[0])}>
            <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
            <input 
                type="text" 
                id='token0' 
                placeholder='0.0000' 
                value={token1TransferAmount === '0' ? '' : token1TransferAmount}
                onChange={(e) => amountHandler(e, tokens[0])} 
            />
  
            <button className='button' type='submit'>
              <span>Deposit</span>
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
  
          </div>
  
          <form>
            <label htmlFor="token1"></label>
            <input type="text" id='token1' placeholder='0.0000'/>
  
            <button className='button' type='submit'>
              <span></span>
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;