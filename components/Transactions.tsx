import { useAppSelector } from "@/app/globalRedux/hooks";
import { myOpenOrdersSelector, myFilledOrdersSelector } from '../app/globalRedux/selectors'

import sort from '../public/assets/sort.svg'
import Image from "next/image";

import Banner from "./Banner";
import { useState, useRef, RefObject } from "react";

const Transactions = () => {
  const [showMyOrders, setShowMyOrders] = useState(true)
  const myOpenOrders = useAppSelector(myOpenOrdersSelector)
  const myFilledOrders = useAppSelector(myFilledOrdersSelector)
  const symbols = useAppSelector(state => state.tokensReducer.Pair.symbols)

  const tradeRef: RefObject<HTMLButtonElement> = useRef(null)
  const orderRef: RefObject<HTMLButtonElement> = useRef(null)

  const tabHandler = (e:any) => {
    if (orderRef.current && e.target.className !== orderRef.current.className) {
      e.target.className = 'tab tab--active'
      orderRef.current.className = 'tab'
      setShowMyOrders(false)
    } else if(tradeRef.current) {
      e.target.className = 'tab tab--active'
      tradeRef.current.className = 'tab'
      setShowMyOrders(true)
    }
  }

    return (
      <div className="component exchange__transactions">
        {showMyOrders ? (
          <div>
            <div className='component__header flex-between'>
              <h2>My Orders</h2>
    
              <div className='tabs'>
                <button onClick={tabHandler} ref={orderRef} className='tab tab--active'>Orders</button>
                <button onClick={tabHandler} ref={tradeRef} className='tab'>Trades</button>
              </div>
            </div>

              {!myOpenOrders || myOpenOrders.length === 0 ? (
                <Banner text="No Open Orders" />
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>{symbols && symbols[0]}<Image src={sort} alt="Sort" /></th>
                      <th>{symbols && symbols[0]}/{symbols && symbols[1]}<Image src={sort} alt="Sort" /></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOpenOrders && myOpenOrders.map((order: any, index: any) => {
                      return(
                        <tr key={index}>
                          <td style={{color: `${order.orderTypeClass}`}}>{order.token0Amount}</td>
                          <td>{order.tokenPrice}</td>
                          <td>button</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
          </div>
        ) : (
          <div>
            <div className='component__header flex-between'>
              <h2>My Transactions</h2>
    
              <div className='tabs'>
                <button onClick={tabHandler} ref={orderRef} className='tab tab--active'>Orders</button>
                <button onClick={tabHandler} ref={tradeRef} className='tab'>Trades</button>
              </div>
            </div>
    
            <table>
              <thead>
                <tr>
                  <th>Time<Image src={sort} alt="Sort" /></th>
                  <th>{symbols && symbols[0]}<Image src={sort} alt="Sort" /></th>
                  <th>{symbols && symbols[0]}/{symbols && symbols[1]}<Image src={sort} alt="Sort" /></th>
                </tr>
              </thead>
              <tbody>
                {myFilledOrders && myFilledOrders.map((order: any, index: any) => {
                  return(
                    <tr key={index}>
                      <td>{order.formattedTimestamp}</td>
                      <td style={{color: `${order.orderClass}`}}>{order.orderSign}{order.token0Amount}</td>
                      <td>{order.tokenPrice}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
    
          </div>
        )}
      </div>
    )
  }

export default Transactions;
