import React from 'react';
import CodeGenerator from './CodeGenerator';
import WeatherDisplay from './WeatherDisplay';

interface HomeViewProps {
  initialPrompt?: string;
  onViewChange: (view: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ initialPrompt }) => {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. HEADER ROW: Welcome + Date/Time */}
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-2xl font-light text-slate-800 mb-1">
             AI XLSM <span className="font-bold text-[#107C41]">Studio</span>
           </h1>
           <p className="text-sm text-slate-500">
             Hayalinizdeki Excel otomasyonunu saniyeler içinde oluşturun.
           </p>
        </div>
        
        {/* Date/Time Widget */}
        <div className="w-full md:w-auto">
            <WeatherDisplay />
        </div>
      </div>

      {/* 2. MAIN GENERATOR AREA */}
      <div className="min-h-[600px]">
         <CodeGenerator initialPrompt={initialPrompt} />
      </div>

    </div>
  );
};

export default HomeView;