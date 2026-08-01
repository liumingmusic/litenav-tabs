import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useStore } from '../lib/store';

export function Clock() {
  const [time, setTime] = useState(new Date());
  const clockColor = useStore(state => state.clockColor);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center mt-2 mb-2 tracking-wider drop-shadow-md relative z-10 transition-colors duration-300" style={{ color: clockColor }}>
       <div className="text-4xl sm:text-6xl font-bold mb-1 sm:mb-2 font-mono">
         {format(time, 'HH:mm:ss')}
       </div>
       <div className="text-xs sm:text-base font-medium opacity-90">
         {format(time, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
       </div>
    </div>
  );
}
