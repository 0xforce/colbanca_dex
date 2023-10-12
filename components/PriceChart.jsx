import { useAppSelector } from "@/app/globalRedux/hooks";

import Chart from 'react-apexcharts'
import { options, defaultSeries } from './PriceChart.config';

import { priceChartSelector } from '../app/globalRedux/selectors'

import Banner from "./Banner";
import Image from "next/image";

import arrowDown from '../public/assets/down-arrow.svg'
import arrowUp from '../public/assets/up-arrow.svg'

const PriceChart = () => {
    const account = useAppSelector(state => state.connectionReducer.account.address)
    const symbols = useAppSelector(state => state.tokensReducer.Pair.symbols)
    const priceChart = useAppSelector(priceChartSelector)

    return (
      <div className="component exchange__chart">
        <div className='component__header flex-between'>
          <div className='flex'>
  
            <h2>{symbols && `${symbols[0]}/${symbols[1]}`}</h2>

            {priceChart && (
              <div className='flex'>
                {priceChart.lastPriceChange === '+' ? (
                  <Image src={arrowUp} alt="Arrow down" />
                ) : (
                  <Image src={arrowDown} alt="Arrow down" />
                )}
                <span className='up'>{priceChart.lastPrice}</span>
              </div>
            )}
          </div>
        </div>
  
        {/* Price chart goes here */}

        {!account ? (
            <Banner text={'Please connect with Metamask'} />
        ) : (
            <Chart 
                type="candlestick"
                options={options}
                series={priceChart ? priceChart.series : defaultSeries}
                width="100%"
                height="100%"
            />
        )}
  
      </div>
    );
  }
  
  export default PriceChart;
  