import Image from 'next/image'
import sort from '../public/assets/sort.svg'

import { useAppDispatch, useAppSelector } from "@/app/globalRedux/hooks";

import { orderBookSelector } from '../app/globalRedux/selectors'
import { fillOrder } from '@/app/globalRedux/interactions';


const OrderBook = () => {
    const dispatch = useAppDispatch()

    const symbols = useAppSelector(state => state.tokensReducer.Pair.symbols)
    const provider = useAppSelector(state => state.connectionReducer.provider)
    const exchange = useAppSelector(state => state.exchangeReducer.exchange.contract)

    const orderBook = useAppSelector(orderBookSelector)

    const fillOrderHandler = (order:any) => {
      if(provider) {
        fillOrder(provider, exchange, order, dispatch)
      }
    }

    return (
      <div className="component exchange__orderbook">
        <div className='component__header flex-between'>
          <h2>Order Book</h2>
        </div>
  
        <div className="flex">

          {!orderBook || orderBook.sellOrders.length === 0 ? (
            <p className='flex-center'>No Sell Orders</p>
          ) : (
            <table className='exchange__orderbook--sell'>
              <caption>Selling</caption>
              <thead>
                <tr>
                  <th>{symbols && symbols[0]}<Image src={sort} alt='Sort' /></th>
                  <th>{symbols && symbols[0]}/{symbols && symbols[1]}<Image src={sort} alt='Sort' /></th>
                  <th>{symbols && symbols[1]}<Image src={sort} alt='Sort' /></th>
                </tr>
              </thead>
              <tbody>

                {/* MAPPING OF SELL ORDERS.... */}

                {orderBook && orderBook.sellOrders.map((order: any, index: any) => {
                  return(
                    <tr key={index} onClick={() => fillOrderHandler(order)}>
                      <td>{order.token0Amount}</td>
                      <td style={{color: `${order.orderTypeClass}`}}>{order.tokenPrice}</td>
                      <td>{order.token1Amount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
  
          <div className='divider'></div>
          
          {!orderBook || orderBook.buyOrders.length === 0 ? (
            <p className='flex-center'>No Buy Orders</p>
          ) : (
            <table className='exchange__orderbook--buy'>
              <caption>Buying</caption>
              <thead>
                <tr>
                  <th>{symbols && symbols[0]}<Image src={sort} alt='Sort' /></th>
                  <th>{symbols && symbols[0]}/{symbols && symbols[1]}<Image src={sort} alt='Sort' /></th>
                  <th>{symbols && symbols[1]}<Image src={sort} alt='Sort' /></th>
                </tr>
              </thead>
              <tbody>

                {/* MAPPING OF BUY ORDERS.... */}

                {orderBook && orderBook.buyOrders.map((order: any, index: any) => {
                  return(
                    <tr key={index} onClick={() => fillOrderHandler(order)}>
                      <td>{order.token0Amount}</td>
                      <td style={{color: `${order.orderTypeClass}`}}>{order.tokenPrice}</td>
                      <td>{order.token1Amount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

        </div>
      </div>
    );
  }
  
  export default OrderBook;