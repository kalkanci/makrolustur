import React from 'react';
import CodeGenerator from './CodeGenerator';
import WeatherDisplay from './WeatherDisplay';
import { AppSettings } from '../services/geminiService';

interface HomeViewProps {
  initialPrompt?: string;
  onViewChange: (view: any) => void;
  onTemplateSelect?: (prompt: string) => void;
  settings: AppSettings;
}

const HomeView: React.FC<HomeViewProps> = ({ initialPrompt, onViewChange, onTemplateSelect, settings }) => {
  
  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col min-h-[calc(100vh-140px)]">
      
      {/* 1. HEADER ROW (Large Title) */}
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between pb-2 shrink-0 px-1">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
             Otomasyon Merkezi
           </h1>
           <p className="text-sm text-slate-500 font-medium">
             Excel işlemlerinizi yapay zeka ile hızlandırın.
           </p>
        </div>
        
        {/* Date/Time Widget */}
        <div className="w-full md:w-auto shrink-0 opacity-80 hover:opacity-100 transition-opacity">
            <WeatherDisplay />
        </div>
      </div>

      {/* 2. MAIN GENERATOR AREA */}
      <div className="flex-1 min-h-0">
         <CodeGenerator initialPrompt={initialPrompt} settings={settings} />
      </div>

    </div>
  );
};

export default HomeView;