import Link from 'next/link'
import Image from 'next/image'
import logo from '../public/assets/logo2.png'
import eth from '../public/assets/eth.svg'

import { useAppSelector, useAppDispatch } from '@/app/globalRedux/hooks'
import Blockies from 'react-blockies'

import { loadAccount } from '@/app/globalRedux/interactions'
import { setAccount, setChainId } from '@/app/globalRedux/features/connectionSlice'
import { ethers } from 'ethers'

import config from '../config.json'
import { useEffect } from 'react'

function Navbar() {
    const dispatch = useAppDispatch();
    const provider = useAppSelector(state => state.connectionReducer.provider)
    const chainId = useAppSelector(state => state.connectionReducer.chainId)
    const { address, balance } = useAppSelector(state => state.connectionReducer.account)

    function getRpcProvider(provider: any) {
        return provider ? provider : new ethers.providers.Web3Provider(window.ethereum);
    }

    const connectHandler = async () => {
        // Load account...
        const rpcProvider = getRpcProvider(provider);
        // Fetch current account and balance from Metamask
        const account = await loadAccount(rpcProvider);
        dispatch(setAccount(account))
    }

    const networkHandler = async (e: any) => {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: e.target.value }]
        })
    }

    return(
        <div className='exchange__header grid'>
            <div className='exchange__header--brand flex'>
                <Image src={logo} alt='logo' className='logo'/>
                <h1>ColBanca Exchange</h1>
            </div>

            <div className='exchange__header--networks flex'>
                <Image src={eth} alt='ETH Logo' className='Eth Logo'/>

                {chainId && (
                    <select name='networks' id='networks' value={(config as any)[chainId] ? `0x${chainId.toString()}` : '0'} onChange={networkHandler}>
                        <option value='0' disabled>Select Network</option>
                        <option value='0x7A69'>Localhost</option>
                        <option value='0x5'>Goerli</option>
                    </select>
                )}
            </div>

            <div className='exchange__header--account flex'>
                {balance ? (
                    <p><small>My Balance</small>{Number(balance).toFixed(4)}</p>
                ) : (
                    <p><small>My Balance</small>0 ETH</p>
                )}

                {address ? (
                     <Link href={(config as any)[chainId] ? `${(config as any)[chainId].explorerURL}/address/${address}` : '#'} target="_blank">
                        {address.slice(0,5) + '...' + address.slice(38,42)}
                        <Blockies  
                            seed={address}
                            size={10}
                            scale={3}
                            color='#2187D0'
                            bgColor='#f1f2f9'
                            spotColor='#767f92'
                            className='identicon'
                        />
                    </Link>
                ) : (
                    <button className='button' onClick={connectHandler}>Connect</button>
                )}
            </div>
        </div>
    )
}

export default Navbar
