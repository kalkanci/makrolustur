import React, { useState } from 'react';
import CodeGenerator from './components/CodeGenerator';
import HomeView from './components/HomeView';
import TemplatesView from './components/TemplatesView';
import WeatherDisplay from './components/WeatherDisplay';
import { FileSpreadsheet, Grid3X3, Bell, Menu, Search } from 'lucide-react';

type ViewState = 'home' | 'templates' | 'automation' | 'analysis' | 'settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // State to pass prompt from other pages to the generator
  const [generatorPrompt, setGeneratorPrompt] = useState<string>("");

  const handleNavigateToGenerator = (prompt: string) => {
    setGeneratorPrompt(prompt);
    setActiveView('automation');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-hidden">
      {/* 1. TOP HEADER (Excel Title Bar Style) */}
      <header className="relative z-30 shadow-sm shrink-0">
        <div className="bg-[#107C41] text-white h-12 flex items-center justify-between px-4 relative">
          
          {/* Left: App Logo & Name */}
          <div className="flex items-center gap-3">
             <button onClick={() => setActiveView('home')} className="flex items-center justify-center w-8 h-8 hover:bg-emerald-800/50 rounded transition-colors">
                <Grid3X3 className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('home')}>
                <span className="font-bold tracking-wide text-sm">AI XLSM Studio</span>
             </div>
             <div className="hidden md:flex ml-4 bg-emerald-800/40 rounded-md items-center px-2 py-1 border border-emerald-600/30">
                <Search className="w-3.5 h-3.5 text-emerald-100 mr-2" />
                <input 
                  type="text" 
                  placeholder="Ara..." 
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-emerald-200/70 w-48"
                />
             </div>
          </div>

          {/* Right: User Actions (User Profile Removed) */}
          <div className="flex items-center gap-1">
             <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-emerald-800 text-white' : 'hover:bg-emerald-800/50 text-emerald-50'}`}
             >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full border border-[#107C41]"></span>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 text-slate-800 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="px-4 py-2 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase">Bildirimler</div>
                    <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer">
                      <p className="text-xs font-semibold">Sistem Güncellendi</p>
                      <p className="text-[10px] text-slate-500">Yeni AI modeli (v2.5) aktif edildi.</p>
                    </div>
                  </div>
                )}
             </button>
          </div>
        </div>

        {/* 2. RIBBON NAVIGATION (Functional) */}
        <div className="bg-white border-b border-slate-200 h-11 flex items-center px-4 overflow-x-auto no-scrollbar shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
           <div className="flex gap-1 text-[13px] font-medium text-slate-600 whitespace-nowrap h-full items-center">
              <button 
                onClick={() => setActiveView('home')}
                className={`px-4 py-1.5 rounded transition-all ${activeView === 'home' ? 'bg-emerald-50 text-[#107C41] font-bold shadow-sm ring-1 ring-emerald-100' : 'hover:bg-slate-100 hover:text-slate-900'}`}
              >
                Giriş
              </button>
              <button 
                onClick={() => setActiveView('templates')}
                className={`px-4 py-1.5 rounded transition-all ${activeView === 'templates' ? 'bg-emerald-50 text-[#107C41] font-bold shadow-sm ring-1 ring-emerald-100' : 'hover:bg-slate-100 hover:text-slate-900'}`}
              >
                Şablonlar
              </button>
              <button 
                onClick={() => setActiveView('automation')}
                className={`px-4 py-1.5 rounded transition-all ${activeView === 'automation' ? 'bg-emerald-50 text-[#107C41] font-bold shadow-sm ring-1 ring-emerald-100' : 'hover:bg-slate-100 hover:text-slate-900'}`}
              >
                Otomasyon & Makro
              </button>
              <button 
                onClick={() => setActiveView('analysis')}
                className={`px-4 py-1.5 rounded transition-all ${activeView === 'analysis' ? 'bg-emerald-50 text-[#107C41] font-bold shadow-sm ring-1 ring-emerald-100' : 'hover:bg-slate-100 hover:text-slate-900'}`}
              >
                Analiz & Araçlar
              </button>
           </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
            
            {/* VIEW: HOME */}
            {activeView === 'home' && (
              <HomeView onNavigate={handleNavigateToGenerator} onViewChange={setActiveView} />
            )}

            {/* VIEW: TEMPLATES */}
            {activeView === 'templates' && (
              <TemplatesView onSelectTemplate={handleNavigateToGenerator} />
            )}

            {/* VIEW: AUTOMATION (Code Generator) */}
            {activeView === 'automation' && (
              <CodeGenerator initialPrompt={generatorPrompt} />
            )}

            {/* VIEW: ANALYSIS */}
            {activeView === 'analysis' && (
              <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                       <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold text-slate-800">Analiz & Araçlar</h2>
                       <p className="text-slate-500 text-sm">Canlı veriler ve yardımcı araçlar.</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WeatherDisplay />
                    
                    {/* Placeholder for future charts */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                       <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <Grid3X3 className="w-8 h-8 text-slate-300" />
                       </div>
                       <h3 className="font-semibold text-slate-700">Grafik Modülü</h3>
                       <p className="text-sm text-slate-400 mt-2">Gelişmiş grafik ve raporlama araçları yakında eklenecek.</p>
                    </div>
                 </div>
              </div>
            )}

        </div>
      </main>
    </div>
  );
};

export default App;