import React from 'react';
import CodeGenerator from './components/CodeGenerator';
import { FileSpreadsheet, Key } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 shrink-0 z-20 shadow-md sticky top-0 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg shadow-sm border border-white/10">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              AI XLSM Oluşturucu
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-full transition-colors"
            >
              <Key className="w-3 h-3" />
              API Anahtarı Al (Ücretsiz)
            </a>
            <span className="text-xs font-medium px-2 py-1 bg-slate-700 text-slate-200 rounded-full hidden sm:inline-block border border-slate-600">
                Pro v2.1
            </span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Github
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CodeGenerator />
      </main>
    </div>
  );
};

export default App;