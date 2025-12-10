import React, { useState, useEffect } from 'react';
import { CalendarClock } from 'lucide-react';

const WeatherDisplay: React.FC = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-2 flex items-center gap-3 h-full min-h-[50px] animate-in fade-in duration-500">
      <div className="bg-emerald-50 p-2 rounded-lg text-[#107C41]">
         <CalendarClock className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
         <span className="text-sm font-bold text-slate-800 leading-none mb-1">
            {date.toLocaleTimeString('tr-TR')}
         </span>
         <span className="text-[10px] text-slate-500 font-medium leading-none whitespace-nowrap">
            {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
         </span>
      </div>
    </div>
  );
};

export default WeatherDisplay;