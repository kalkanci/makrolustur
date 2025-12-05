import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, Copy, Check, Download, Sparkles, 
  History, Zap, Trash2, ChevronRight, RefreshCw, Wand2
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
  
  const codeSectionRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('macro_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((i: any) => ({ ...i, date: new Date(i.date) })));
      } catch (e) { console.error("History parse error", e); }
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('macro_history', JSON.stringify(history));
  }, [history]);

  // Scroll to code section when it appears
  useEffect(() => {
    if ((code || loading) && codeSectionRef.current) {
        // Small delay to ensure DOM is rendered before scrolling
        setTimeout(() => {
            codeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  }, [code, loading]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Determine if this is a refinement (updating existing code) or new generation
    const isRefinement = !!code; 
    
    setLoading(true);
    try {
      const result = await generateExcelMacro(prompt, isRefinement ? code : undefined);
      setCode(result);

      if (!isRefinement) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          prompt: prompt,
          code: result,
          date: new Date()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 20));
      }
      
      // Clear prompt only if it was a refinement
      if(isRefinement) setPrompt("");

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
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-100px)]">
      
      {/* LEFT SIDEBAR: History & Templates */}
      <div className="lg:w-80 w-full flex flex-col gap-6 shrink-0 order-2 lg:order-1">
        
        {/* Templates Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Hazır Fikirler
          </h3>
          <div className="space-y-2">
            {TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(t.prompt)}
                className="w-full text-left text-xs p-3 rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-600 border border-slate-100 transition-all hover:shadow-sm"
              >
                <div className="font-semibold mb-0.5">{t.label}</div>
                <div className="text-[10px] text-slate-400 opacity-70 truncate">{t.prompt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col max-h-[500px]">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-500" />
            Geçmiş İşlemler
          </h3>
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-2">
            {history.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-4 italic">Henüz geçmiş yok.</div>
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

      {/* RIGHT MAIN AREA */}
      <div className="flex-1 flex flex-col gap-6 order-1 lg:order-2">
        
        {/* 1. INPUT AREA (Always Visible) */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 transition-all duration-300">
           <label className="block text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {code ? "Kodu Revize Et / Değiştir" : "Excel'de ne yapmak istiyorsunuz?"}
           </label>
           
           <div className="relative">
              <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if(prompt.trim()) handleGenerate();
                    }
                  }}
                  className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base p-4 min-h-[120px] resize-y bg-slate-50 focus:bg-white transition-colors"
                  placeholder={code ? "Örn: Mesaj kutusundaki metni değiştir, döngüyü tersten kur..." : "Örn: A sütunundaki boş satırları sil, F5 hücresine dolar kurunu yaz..."}
              />
              
              <div className="mt-3 flex justify-between items-center">
                 <span className="text-xs text-slate-400">
                    {code ? "Mevcut kod üzerinde değişiklik yapmak için isteğinizi yazın." : "Detaylı açıklama daha iyi sonuç verir."}
                 </span>
                 <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${
                      code ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                >
                    {loading ? (
                        <>
                           <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                           {code ? "Revize Ediliyor..." : "Kod Yazılıyor..."}
                        </>
                    ) : (
                        <>
                           {code ? <RefreshCw className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                           {code ? "Kodu Güncelle" : "Oluştur"}
                        </>
                    )}
                </button>
              </div>
           </div>
        </div>

        {/* 2. OUTPUT AREA (Animated Reveal) */}
        {/* We use standard Tailwind transition opacity/transform logic instead of non-standard 'animate-in' classes */}
        <div 
            ref={codeSectionRef}
            className={`flex-1 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden transition-all duration-700 ease-out origin-top min-h-[500px] ${
                (code || loading) 
                ? 'opacity-100 translate-y-0 max-h-[2000px]' 
                : 'opacity-0 -translate-y-4 max-h-0 overflow-hidden hidden'
            }`}
        >
              {/* Toolbar */}
              <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-slate-600" />
                  <span className="font-semibold text-slate-700">VBA Kod Sonucu</span>
                  {!loading && <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full tracking-wide">Hazır</span>}
                </div>
                <div className="flex gap-2">
                  <button 
                      onClick={copyToClipboard}
                      disabled={loading}
                      className="text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-medium shadow-sm"
                  >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                  <button 
                      onClick={downloadBasFile}
                      disabled={loading}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                      <Download className="w-3.5 h-3.5" />
                      .bas İndir
                  </button>
                </div>
              </div>

              {/* Code Editor Display */}
              <div className="relative flex-1 bg-[#1e1e1e] overflow-hidden group">
                {loading ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-blue-300 font-mono text-sm animate-pulse">Kodunuz hazırlanıyor...</p>
                   </div>
                ) : (
                  <>
                    <textarea 
                      value={code}
                      readOnly
                      className="w-full h-full p-6 bg-transparent text-blue-300 font-mono text-sm resize-none focus:outline-none custom-scrollbar leading-relaxed"
                      spellCheck={false}
                    />
                    {/* Floating Instruction */}
                    <div className="absolute bottom-4 right-4 bg-blue-900/80 backdrop-blur text-blue-100 text-xs px-3 py-2 rounded-lg border border-blue-700/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       Excel'de: Alt + F11 &gt; Insert Module &gt; Yapıştır
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