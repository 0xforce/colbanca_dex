import config from '../config.json'
import { useAppSelector, useAppDispatch } from '@/app/globalRedux/hooks'
import { loadTokens } from '../app/globalRedux/interactions'
import { setPair } from '../app/globalRedux/features/tokensSlice';

const Markets = () => {
    const provider = useAppSelector(state => state.connectionReducer.provider)
    const chainId = useAppSelector(state => state.connectionReducer.chainId)
    const dispatch = useAppDispatch()

    const marketHandler = async (e: any) => {
        if(provider) {
            const [token1Address, token2Address] = (e.target.value).split(",");
            const pair = await loadTokens(provider, [token1Address, token2Address])
            dispatch(setPair(pair))
        }
    }

    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Market</h2>
        </div>
        
        {chainId && (config as any)[chainId] ? (
            <select name="markets" id="markets" onChange={marketHandler}>
                <option value={`${(config as any)[chainId].CBNK.address},${(config as any)[chainId].mETH.address}`} >CBNK / mETH</option>
                <option value={`${(config as any)[chainId].CBNK.address},${(config as any)[chainId].mDAI.address}`} >CBNK / mDAI</option>
            </select>
        ) : (
            <div>
                Not Deployed to Network
            </div>
        )}

        <hr />
      </div>
    )
  }
  
  export default Markets;
