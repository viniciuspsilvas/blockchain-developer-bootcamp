import { FC, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAccount,
  selectNetwork
} from "../lib/features/providers/providerSlice";
import { myEventsSelector } from "../lib/features/exchanges/selectors";
import { selectTransaction, selectAutoClose, toggleAutoClose } from "../lib/features/exchanges/exchangeSlice";
import { config } from "../app/page";
import { RootState } from "../lib/store";

export const Alert: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const network = useSelector(selectNetwork);
  const account = useSelector(selectAccount);
  const transaction = useSelector(selectTransaction);
  const isPending = transaction?.isPending;
  const isError = transaction?.isError;
  const events = useSelector((state: RootState) => myEventsSelector(state));
  const autoClose = useSelector(selectAutoClose);
  const dispatch = useDispatch();

  // Show alert when there's a new event
  useEffect(() => {
    const shouldShowAlert = (events[0] || isPending || isError) && account;
    if (shouldShowAlert) {
      setIsVisible(true);
      setCountdown(5);
    }
  }, [events[0]?.id, isPending, isError, account]);

  // Handle countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isVisible && autoClose && events[0]) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsVisible(false);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVisible, autoClose, events[0]]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-[300px] h-[100px] bg-[#222D41] rounded-lg shadow-lg flex flex-col justify-center items-center text-center transition-all duration-500 ease-in-out ${!isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {autoClose && events[0] && !isPending && !isError && (
          <span className="text-xs text-gray-400">
            Closing in {countdown}s
          </span>
        )}
        {events[0] && !isPending && !isError && (
          <button 
            onClick={() => dispatch(toggleAutoClose())}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {autoClose ? 'Auto' : 'Manual'}
          </button>
        )}
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {isPending ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Transaction Pending...</span>
        </div>
      ) : isError ? (
        <div>
          <span>Transaction Will Fail</span>
        </div>
      ) : events[0] ? (
        <div className="flex flex-col items-center">
          <span>Transaction Successful</span>
          <a
            href={
              config[network]
                ? `${config[network].explorerURL}/tx/${events[0]?.transactionHash}`
                : "#"
            }
            target="_blank"
            rel="noreferrer"
            className="text-blue hover:text-white mt-1"
          >
            {events[0]?.transactionHash?.slice(0, 6) +
              "..." +
              events[0]?.transactionHash?.slice(60, 66)}
          </a>
        </div>
      ) : null}
    </div>
  );
};
