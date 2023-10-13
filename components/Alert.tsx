import { useAppSelector } from "@/app/globalRedux/hooks";
import { myEventsSelector } from "@/app/globalRedux/selectors";
import { useEffect, useRef } from "react";

import config from '@/config.json'


const Alert = () => {
    const account = useAppSelector(state => state.connectionReducer.account.address)
    const network = useAppSelector(state => state.connectionReducer.chainId)
    const isPending = useAppSelector(state => state.exchangeReducer.transaction.isPending)
    const isError = useAppSelector(state => state.exchangeReducer.transaction.isError)
    const events = useAppSelector(myEventsSelector)

    const alertRef = useRef(null)

    const removeHandler = async (e:any) => {
        if(alertRef.current) {
            (alertRef.current as HTMLDivElement).className = 'alert--remove'
        }
    }

    useEffect(() => {
        if((events[0] || isPending || isError) && alertRef.current && account) {
            (alertRef.current as HTMLDivElement).className = 'alert'
        }
    }, [events, isPending, isError, account])

    return (
        <div>
            {isPending ? (
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                    <h1>Transaction Pending...</h1>
                </div>
            ) : isError ? (
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                    <h1>Transaction Will Fail</h1>
                </div>
            ) : !isPending && events[0] ? (
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                    <h1>Transaction Successful</h1>
                    <a
                        href={(config as any)[network] ? `${(config as any)[network].explorerURL}/tx/${events[0].transactionHash}` : '#'}
                        target='_blank'
                        rel='noreferrer'
                    >
                        {events[0].transactionHash.slice(0,6) + '...' + events[0].transactionHash.slice(60,66)}
                    </a>
                </div>
            ) : (
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div>
            )}
        </div>
    );
}
  
export default Alert;