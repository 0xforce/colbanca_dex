import { useAppSelector } from "@/app/globalRedux/hooks";
import { filledOrdersSelector } from "@/app/globalRedux/selectors";

import sort from '../public/assets/sort.svg'
import Image from "next/image";

import Banner from "./Banner";

const Trades = () => {
    const filledOrders = useAppSelector(filledOrdersSelector)
    const symbols = useAppSelector(state => state.tokensReducer.Pair.symbols)

  return (
    <div className="component exchange__trades">
      <div className='component__header flex-between'>
        <h2>Trades</h2>
      </div>

      {!filledOrders || filledOrders.length === 0 ? (
        <Banner text='No Transactions' />
      ) : (

        <table>
            <thead>
            <tr>
                <th>Time<Image src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}<Image src={sort} alt="Sort" /></th>
                <th>{symbols && symbols[0]}/{symbols && symbols[1]}<Image src={sort} alt="Sort" /></th>
            </tr>
            </thead>
            <tbody>
                {filledOrders && filledOrders.map((order: any, index: any) => {
                    return(
                        <tr key={index}>
                            <td>{order.formattedTimestamp}</td>
                            <td style={{color: `${order.tokenPriceClass}`}}>{order.token0Amount}</td>
                            <td>{order.tokenPrice}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
      )}
    </div>
  );
}

export default Trades;