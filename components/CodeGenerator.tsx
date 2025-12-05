import React, { useState, useEffect } from 'react';
import { 
  FileCode, Copy, Check, Download, Sparkles, Info, 
  History, Zap, MessageSquare, Trash2, ChevronRight, Edit3 
} from 'lucide-react';
import { generateExcelMacro } from '../services/geminiService';

interface HistoryItem {
  id: string;
  prompt: string;
  code: string;
  date: Date;
}

const TEMPLATES = [
  { label: "Döviz Kuru Çekici", prompt: "Bir butona basınca güncel USD ve EUR kurlarını çekip A1 ve A2 hücrelerine yazan ve tarih ekleyen bir makro yaz." },
  { label: "Boş Satırları Temizle", prompt: "Aktif sayfadaki A sütununda boş olan tüm satırları tespit edip komple silen bir makro yaz." },
  { label: "PDF Olarak Kaydet", prompt: "Aktif sayfayı masaüstüne o günün tarihiyle isimlendirilmiş bir PDF dosyası olarak kaydeden makro yaz." },
  { label: "Tüm Sayfaları Listele", prompt: "Yeni bir 'İndeks' sayfası oluştur ve bu kitaptaki tüm diğer sayfaların isimlerini linkli (hyperlink) şekilde listele." },
  { label: "Mükerrer Kayıtları Boya", prompt: "A sütunundaki tekrar eden verileri bul ve arka plan rengini kırmızı, yazı rengini beyaz yap." }
];

const CodeGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [refinementMode, setRefinementMode] = useState<boolean>(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('macro_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to objects
        setHistory(parsed.map((i: any) => ({ ...i, date: new Date(i.date) })));
      } catch (e) { console.error("History parse error", e); }
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('macro_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async (isRefinement = false) => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // If refinement, pass existing code
      const result = await generateExcelMacro(prompt, isRefinement ? code : undefined);
      setCode(result);

      if (!isRefinement) {
        // Add to history only if it's a new generation
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          prompt: prompt,
          code: result,
          date: new Date()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20
      } else {
        setRefinementMode(false); // Exit refinement mode after success
        setPrompt(""); // Clear prompt
      }
    } catch (error) {
      console.error(error);
      setCode("' Bir hata oluştu. Lütfen tekrar deneyin.\n' " + error);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setCode(item.code);
    setRefinementMode(false);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(i => i.id !== id));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBasFile = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI_Makro.bas';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-140px)] gap-6">
      
      {/* LEFT SIDEBAR: History & Templates */}
      <div className="lg:w-80 w-full flex flex-col gap-4 shrink-0">
        
        {/* Templates Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Hızlı Şablonlar
          </h3>
          <div className="space-y-2">
            {TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(t.prompt);
                }}
                className="w-full text-left text-xs p-2.5 rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 border border-slate-100 transition-colors truncate"
                title={t.label}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col h-64 lg:h-auto lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-500" />
            Geçmiş
          </h3>
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-2">
            {history.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-4">Henüz geçmiş yok.</div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="group relative p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <div className="text-xs font-medium text-slate-700 line-clamp-2 mb-1">
                    {item.prompt}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {item.date.toLocaleDateString()} {item.date.toLocaleTimeString().slice(0,5)}
                  </div>
                  <button 
                    onClick={(e) => deleteHistoryItem(e, item.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT MAIN AREA: Generator */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col lg:overflow-hidden lg:h-full min-h-[600px]">
        
        {/* Editor / Output Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">VBA Editörü</span>
              {code && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Oluşturuldu</span>}
            </div>
            {code && (
              <div className="flex gap-2">
                <button 
                    onClick={copyToClipboard}
                    className="text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-medium shadow-sm"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Kopyalandı' : 'Kopyala'}
                </button>
                <button 
                    onClick={downloadBasFile}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
                >
                    <Download className="w-3.5 h-3.5" />
                    .bas İndir
                </button>
              </div>
            )}
          </div>

          {/* Code Display */}
          <div className="relative flex-1 bg-[#1e1e1e] overflow-hidden">
             {!code ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                 <Sparkles className="w-12 h-12 mb-4 opacity-20 text-white" />
                 <p className="text-slate-400 text-sm max-w-md">
                   Sol taraftan bir şablon seçin veya aşağıya isteğinizi yazarak yapay zekanın kodunuzu oluşturmasını izleyin.
                 </p>
               </div>
             ) : (
               <textarea 
                 value={code}
                 readOnly
                 className="w-full h-full p-4 bg-transparent text-blue-300 font-mono text-sm resize-none focus:outline-none custom-scrollbar leading-relaxed"
                 spellCheck={false}
               />
             )}
          </div>
        </div>

        {/* Prompt Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex flex-col gap-3">
             {code && !refinementMode ? (
                <div className="flex justify-between items-center">
                   <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      İşlem tamamlandı.
                   </div>
                   <button 
                     onClick={() => { setRefinementMode(true); setPrompt(""); }}
                     className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                   >
                     <Edit3 className="w-3.5 h-3.5" />
                     Kodu Düzenle / Revize Et
                   </button>
                </div>
             ) : (
               <>
                  <label className="block text-sm font-medium text-slate-700 flex justify-between">
                    {refinementMode ? "Kodu nasıl değiştirmek istersiniz?" : "Ne yapmak istiyorsunuz?"}
                    {refinementMode && (
                      <button onClick={() => setRefinementMode(false)} className="text-xs text-red-500 hover:underline">
                        İptal
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if(prompt.trim()) handleGenerate(refinementMode);
                          }
                        }}
                        className={`block w-full rounded-xl border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-3 pr-14 border resize-none bg-slate-50 focus:bg-white transition-colors ${refinementMode ? 'border-blue-300 ring-2 ring-blue-50' : ''}`}
                        placeholder={refinementMode ? "Örn: Mesaj kutusundaki metni değiştir, döngüyü tersten kur..." : "Örn: A sütunundaki boşlukları sil..."}
                        rows={3}
                    />
                    <button
                        onClick={() => handleGenerate(refinementMode)}
                        disabled={loading || !prompt.trim()}
                        className={`absolute right-2 bottom-2 p-2 rounded-lg text-white shadow-sm transition-all ${
                          loading || !prompt.trim() 
                          ? 'bg-slate-300 cursor-not-allowed' 
                          : refinementMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                    >
                        {loading ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 flex justify-end">
                    {refinementMode ? "Mevcut kod üzerinde değişiklik yapılır." : "Enter tuşu ile gönder"}
                  </div>
               </>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CodeGenerator;