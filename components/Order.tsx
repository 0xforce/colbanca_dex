import { useState, useRef, RefObject } from 'react'
import { makeBuyOrder, makeSellOrder } from '@/app/globalRedux/interactions'
import { useAppDispatch, useAppSelector } from '@/app/globalRedux/hooks'

const Order = () => {
    const dispatch = useAppDispatch()
    const provider = useAppSelector(state => state.connectionReducer.provider)
    const tokens = useAppSelector(state => state.tokensReducer.Pair)
    const exchange = useAppSelector(state => state.exchangeReducer.exchange)

    const [isBuy, setIsBuy] = useState(true)
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)

    const buyRef: RefObject<HTMLButtonElement> = useRef(null)
    const sellRef: RefObject<HTMLButtonElement> = useRef(null)

    const tabHandler = (e: any) => {
        if(buyRef.current && e.target.className !== buyRef.current.className) {
            e.target.className = 'tab tab--active'
            buyRef.current.className = 'tab'
            setIsBuy(false)
        } else if (sellRef.current) {
            e.target.className = 'tab tab--active'
            sellRef.current.className = 'tab'
            setIsBuy(true)
        }
    }

    const buyHandler = (e: any) => {
        e.preventDefault()

        if(provider) {
            makeBuyOrder(provider, exchange.contract, tokens.contracts , { amount, price }, dispatch)
        } else {
            console.error('Provider is null. Cannot perform deposit.');
        }

        setAmount(0)
        setPrice(0)
    }

    const sellHandler = (e: any) => {
        e.preventDefault()
        if(provider) {
            makeSellOrder(provider, exchange.contract, tokens.contracts , { amount, price }, dispatch)
        } else {
            console.error('Provider is null. Cannot perform deposit.');
        }
        setAmount(0)
        setPrice(0)
    }

    return (
      <div className="component exchange__orders">
        <div className='component__header flex-between'>
          <h2>New Order</h2>
          <div className='tabs'>
            <button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
            <button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
          </div>
        </div>
  
        <form onSubmit={isBuy ? buyHandler : sellHandler}>
          {isBuy ? (
              <label>Buy Amount</label>
          ) : (
              <label>Sell Amount</label>
          )}

          <input 
            type="text" 
            id='amount' 
            placeholder='0.0000' 
            value={amount === 0 ? '' : amount}
            onChange={(e: any) => setAmount(e.target.value)} />

          {isBuy ? (
              <label>Buy Price</label>
          ) : (
              <label>Sell Price</label>
          )}
  
          <input 
            type="text" 
            id='price' 
            placeholder='0.0000' 
            value={price === 0 ? '' : price}
            onChange={(e: any) => setPrice(e.target.value)}/>
  
          <button className='button button--filled' type='submit'>
            {isBuy ? (
                <span>Buy Order</span>
            ) : (
                <span>Sell Order</span>
            )}
          </button>
        </form>
      </div>
    );
}
  
export default Order;