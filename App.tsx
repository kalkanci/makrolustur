import React from 'react';
import CodeGenerator from './components/CodeGenerator';
import { FileSpreadsheet } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-lg shadow-sm">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-600">
              AI XLSM Oluşturucu
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full hidden sm:inline-block">
                Beta v2.0
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        
        <div className="mb-6 text-center max-w-2xl mx-auto">
             <h2 className="text-3xl font-bold text-slate-900 mb-2">Excel Makrolarını Saniyeler İçinde Yazın</h2>
             <p className="text-slate-600">
                 Kodlama bilmenize gerek yok. Yapmak istediğinizi anlatın, yapay zeka sizin için profesyonel VBA kodunu hazırlasın ve indirilebilir dosya (.bas) haline getirsin.
             </p>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col mb-8">
            <CodeGenerator />
        </div>

        <footer className="text-center text-sm text-slate-400 pb-6">
            Gemini 2.5 AI Modeli Tarafından Güçlendirilmiştir • Güvenli Kod Üretimi
        </footer>
      </main>
    </div>
  );
};

export default App;