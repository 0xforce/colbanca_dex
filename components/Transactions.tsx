import { useAppSelector } from "@/app/globalRedux/hooks";
import { myOpenOrdersSelector } from '../app/globalRedux/selectors'

import sort from '../public/assets/sort.svg'
import Image from "next/image";

import Banner from "./Banner";

const Transactions = () => {
  const myOpenOrders = useAppSelector(myOpenOrdersSelector)
  const symbols = useAppSelector(state => state.tokensReducer.Pair.symbols)

    return (
      <div className="component exchange__transactions">
        <div>
          <div className='component__header flex-between'>
            <h2>My Orders</h2>
  
            <div className='tabs'>
              <button className='tab tab--active'>Orders</button>
              <button className='tab'>Trades</button>
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
  
        {/* <div> */}
          {/* <div className='component__header flex-between'> */}
            {/* <h2>My Transactions</h2> */}
  
            {/* <div className='tabs'> */}
              {/* <button className='tab tab--active'>Orders</button> */}
              {/* <button className='tab'>Trades</button> */}
            {/* </div> */}
          {/* </div> */}
  
          {/* <table> */}
            {/* <thead> */}
              {/* <tr> */}
                {/* <th></th> */}
                {/* <th></th> */}
                {/* <th></th> */}
              {/* </tr> */}
            {/* </thead> */}
            {/* <tbody> */}
  
              {/* <tr> */}
                {/* <td></td> */}
                {/* <td></td> */}
                {/* <td></td> */}
              {/* </tr> */}
  
            {/* </tbody> */}
          {/* </table> */}
  
        {/* </div> */}
      </div>
    )
  }

export default Transactions;