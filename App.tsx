import React, { useState } from 'react';
import HomeView from './components/HomeView';
import { Grid3X3, Plus } from 'lucide-react';

const App: React.FC = () => {
  // State to pass prompt to the generator
  const [generatorPrompt, setGeneratorPrompt] = useState<string>("");
  // Key to force re-render/reset of components
  const [resetKey, setResetKey] = useState<number>(0);

  const handleTemplateSelect = (prompt: string) => {
    setGeneratorPrompt(prompt);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewSession = () => {
    setGeneratorPrompt("");
    setResetKey(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-hidden">
      {/* 1. iOS STYLE BLURRED HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
        <div className="h-14 flex items-center justify-between px-6 relative max-w-[1800px] mx-auto w-full">
          
          {/* Left: App Logo & Name */}
          <div className="flex items-center gap-3">
             <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#107C41] to-[#159950] rounded-lg shadow-sm text-white">
                <Grid3X3 className="w-4 h-4" />
             </div>
             <div className="flex flex-col leading-none select-none">
                <span className="font-semibold tracking-tight text-lg text-slate-800">AI XLSM Studio</span>
             </div>
          </div>

          {/* Right: New Button (iOS Action Button Style) */}
          <div className="flex items-center gap-2">
             <button 
                onClick={handleNewSession}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 active:scale-95 transition-all font-medium text-sm"
             >
                <Plus className="w-4 h-4" />
                Yeni
             </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 scroll-smooth">
            
            {/* SINGLE PAGE VIEW */}
            {/* Using key to force full reset when 'New' is clicked */}
            <HomeView 
                key={resetKey}
                initialPrompt={generatorPrompt} 
                onTemplateSelect={handleTemplateSelect}
                onViewChange={() => {}} 
            />

            {/* Footer */}
            <footer className="mt-12 border-t border-slate-200/60 py-8 text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                    <Grid3X3 className="w-3 h-3" />
                    <span className="text-xs font-semibold">AI XLSM Studio</span>
                </div>
                <p className="text-[10px] text-slate-400">
                    &copy; 2024 Designed with Gemini.
                </p>
            </footer>

        </div>
      </main>
    </div>
  );
};

export default App;