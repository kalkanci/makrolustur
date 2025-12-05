import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, Copy, Check, Download, Sparkles, 
  History, Zap, Trash2, RefreshCw, Wand2,
  Table, Sheet, FileJson, Mail, Calculator, 
  PaintBucket, Lock, Unlock, Eraser, FileText, 
  Search, Eye, EyeOff, BarChart, Save, Database,
  ArrowRight, Home, AlertTriangle
} from 'lucide-react';
import { generateExcelMacro } from '../services/geminiService';

interface HistoryItem {
  id: string;
  prompt: string;
  code: string;
  date: Date;
}

// Helper component for Icon not in lucide defaults used above
const TypeCaseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7V5h18v2"/><path d="M9 7v12"/><path d="M15 7v12"/></svg>
);

// 30+ Templates categorized for better UI
const TEMPLATE_CATEGORIES = [
  {
    title: "Veri Temizleme & Düzenleme",
    items: [
      { icon: <Eraser className="w-4 h-4 text-rose-500" />, label: "Boş Satırları Sil", prompt: "Aktif sayfadaki A sütunu boş olan tüm satırları bul ve tamamen sil." },
      { icon: <Search className="w-4 h-4 text-rose-500" />, label: "Mükerrerleri Kaldır", prompt: "A sütunundaki tekrar eden verileri bul ve satırları tamamen kaldır, sadece benzersizler kalsın." },
      { icon: <FileText className="w-4 h-4 text-rose-500" />, label: "Boşlukları Kırp (Trim)", prompt: "Seçili alandaki tüm hücrelerin başında ve sonundaki gereksiz boşlukları temizle." },
      { icon: <TypeCaseIcon className="w-4 h-4 text-rose-500" />, label: "Büyük Harfe Çevir", prompt: "Seçili alandaki tüm metinleri BÜYÜK HARFE çevir." },
      { icon: <TypeCaseIcon className="w-4 h-4 text-rose-500" />, label: "Yazım Düzeni (Proper)", prompt: "Seçili alandaki metinlerin İlk Harflerini Büyük yap." },
      { icon: <Eraser className="w-4 h-4 text-rose-500" />, label: "Birleştirilmişleri Çöz", prompt: "Sayfadaki tüm birleştirilmiş (merged) hücreleri çöz ve değerleri doldur." },
    ]
  },
  {
    title: "Dosya & Sayfa İşlemleri",
    items: [
      { icon: <FileJson className="w-4 h-4 text-blue-500" />, label: "PDF Olarak Kaydet", prompt: "Aktif sayfayı masaüstüne bugünün tarihiyle isimlendirilmiş bir PDF dosyası olarak kaydet." },
      { icon: <Sheet className="w-4 h-4 text-blue-500" />, label: "Sayfaları Listele (Index)", prompt: "Yeni bir 'Index' sayfası oluştur ve kitaptaki tüm sayfaların isimlerini linkli (hyperlink) olarak listele." },
      { icon: <Save className="w-4 h-4 text-blue-500" />, label: "Sayfaları Ayrı Kaydet", prompt: "Bu kitaptaki her bir çalışma sayfasını, kendi isminde ayrı birer Excel dosyası (.xlsx) olarak masaüstüne kaydet." },
      { icon: <Lock className="w-4 h-4 text-blue-500" />, label: "Tüm Sayfaları Koru", prompt: "Kitaptaki tüm sayfaları '1234' şifresi ile korumaya al (Protect)." },
      { icon: <Unlock className="w-4 h-4 text-blue-500" />, label: "Korumayı Kaldır", prompt: "Kitaptaki tüm sayfaların korumasını '1234' şifresini kullanarak kaldır." },
      { icon: <Eye className="w-4 h-4 text-blue-500" />, label: "Gizli Sayfaları Göster", prompt: "Kitaptaki gizlenmiş olan tüm sayfaları görünür hale getir." },
    ]
  },
  {
    title: "Görsel & Biçimlendirme",
    items: [
      { icon: <PaintBucket className="w-4 h-4 text-amber-500" />, label: "Zebra Satır Boyama", prompt: "Tablodaki satırları okunabilirliği artırmak için birer atlayarak açık gri renge boya." },
      { icon: <Table className="w-4 h-4 text-amber-500" />, label: "Tüm Kenarlıkları Ekle", prompt: "Dolu olan veri aralığının tamamına ince siyah kenarlıklar ekle." },
      { icon: <Calculator className="w-4 h-4 text-amber-500" />, label: "Sütunları Otomatik Sığdır", prompt: "Tüm sayfadaki sütun genişliklerini içeriklerine göre otomatik ayarla (AutoFit)." },
      { icon: <PaintBucket className="w-4 h-4 text-amber-500" />, label: "Hataları Kırmızı Yap", prompt: "Sayfada hata değeri içeren (#N/A, #VALUE! vb.) hücrelerin arka planını kırmızı yap." },
      { icon: <PaintBucket className="w-4 h-4 text-amber-500" />, label: "Negatifleri Kırmızı Yap", prompt: "Seçili alandaki 0'dan küçük sayıların yazı rengini kırmızı ve kalın yap." },
      { icon: <Table className="w-4 h-4 text-amber-500" />, label: "Başlıkları Dondur", prompt: "İlk satırı dondur (Freeze Panes) ve arka planını koyu mavi, yazı rengini beyaz yap." },
    ]
  },
  {
    title: "İleri Düzey & Entegrasyon",
    items: [
      { icon: <RefreshCw className="w-4 h-4 text-purple-500" />, label: "Döviz Kuru Çek (Web)", prompt: "Google Finance veya bir XML kaynağından güncel USD/TL kurunu çekip A1 hücresine yazan makro." },
      { icon: <Mail className="w-4 h-4 text-purple-500" />, label: "Seçimi Mail At", prompt: "Seçili alanı HTML formatında gövdeye ekleyerek Outlook üzerinden yeni bir e-posta oluştur." },
      { icon: <Database className="w-4 h-4 text-purple-500" />, label: "Formülleri Değere Çevir", prompt: "Tüm sayfadaki formülleri kaldır ve sadece hesaplanmış değerlerini (Values) bırak." },
      { icon: <BarChart className="w-4 h-4 text-purple-500" />, label: "Pivot Tablo Oluştur", prompt: "A1'den başlayan verileri kullanarak yeni bir sayfada özet bir Pivot Tablo oluştur." },
      { icon: <FileJson className="w-4 h-4 text-purple-500" />, label: "CSV Olarak Dışa Aktar", prompt: "Aktif sayfayı, noktalı virgül ile ayrılmış bir CSV dosyası olarak belgelerime kaydet." },
      { icon: <Save className="w-4 h-4 text-purple-500" />, label: "Yedek Al (Backup)", prompt: "Dosyanın bir kopyasını 'Yedek_Tarih_Saat.xlsm' adıyla aynı klasöre kaydet." },
      { icon: <Calculator className="w-4 h-4 text-purple-500" />, label: "Rastgele Sayı Üret", prompt: "A1:A100 arasına 1 ile 1000 arasında rastgele tamsayılar üret ve yaz." },
      { icon: <Table className="w-4 h-4 text-purple-500" />, label: "HTML Tablo Kodu Üret", prompt: "Seçili alanı bir HTML <table> kodu haline getirip panoya (clipboard) kopyala." },
      { icon: <Search className="w-4 h-4 text-purple-500" />, label: "Gelişmiş Filtreleme", prompt: "A sütununda 'Tamamlandı' yazan satırları filtrele ve sonuçları yeni bir sayfaya kopyala." },
      { icon: <EyeOff className="w-4 h-4 text-purple-500" />, label: "Boş Sütunları Gizle", prompt: "Başlık satırına (1. satır) bak, eğer başlık boşsa o sütunu tamamen gizle." },
      { icon: <Database className="w-4 h-4 text-purple-500" />, label: "Klasördeki Dosyaları Listele", prompt: "Kullanıcıdan bir klasör seçmesini iste ve o klasördeki tüm dosya isimlerini A sütununa listele." },
      { icon: <Calculator className="w-4 h-4 text-purple-500" />, label: "Seçili Sayıları Topla", prompt: "Seçili alandaki sayısal değerleri topla ve kullanıcıya bir Mesaj Kutusu ile göster." },
    ]
  }
];

// Simple VBA Syntax Highlighter Component
const VbaCodeViewer: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.split('\n');
  const keywords = ["Sub", "End Sub", "Dim", "As", "Set", "If", "Then", "Else", "End If", "For", "Next", "To", "MsgBox", "Call", "Function", "End Function", "On Error", "GoTo", "Resume", "True", "False", "Nothing", "With", "End With", "ActiveSheet", "Range", "Cells", "Application", "Worksheets", "Workbook", "Option Explicit"];
  
  return (
    <pre className="font-mono text-sm leading-6 whitespace-pre-wrap break-words text-slate-800">
      {lines.map((line, idx) => {
        // Handle Comments (Green)
        const commentIndex = line.indexOf("'");
        if (commentIndex !== -1) {
          const codePart = line.substring(0, commentIndex);
          const commentPart = line.substring(commentIndex);
          return (
            <div key={idx}>
              <span dangerouslySetInnerHTML={{ __html: highlightKeywords(codePart, keywords) }} />
              <span className="text-green-600 italic">{commentPart}</span>
            </div>
          );
        }
        return (
          <div key={idx} dangerouslySetInnerHTML={{ __html: highlightKeywords(line, keywords) }} />
        );
      })}
    </pre>
  );
};

// Helper to highlight keywords in a string (returns HTML string)
const highlightKeywords = (text: string, keywords: string[]) => {
  if(!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"([^"]*)"/g, '<span class="text-orange-600">"$1"</span>'); // Strings in Orange

  keywords.forEach(kw => {
     // Case insensitive whole word match
     const regex = new RegExp(`\\b${kw}\\b`, 'gi');
     // Replace with same case but wrapped
     html = html.replace(regex, (match) => `<span class="text-blue-700 font-bold">${match}</span>`);
  });
  return html;
};

// VBA Code Validator
const validateVbaCode = (code: string): string[] => {
  const issues: string[] = [];
  const lines = code.split('\n');
  
  let openSubs = 0;
  let openFuncs = 0;
  let openWiths = 0;
  let openFors = 0;

  for (let line of lines) {
    const trimmed = line.trim();
    const commentIdx = trimmed.indexOf("'");
    const content = (commentIdx > -1 ? trimmed.substring(0, commentIdx) : trimmed).trim();
    
    if (!content) continue;

    // Sub / End Sub
    if (/^(Private\s+|Public\s+)?Sub\s+/i.test(content) && !/^End\s+Sub/i.test(content) && !/^Exit\s+Sub/i.test(content)) openSubs++;
    if (/^End\s+Sub$/i.test(content)) openSubs--;

    // Function / End Function
    if (/^(Private\s+|Public\s+)?Function\s+/i.test(content) && !/^End\s+Function/i.test(content) && !/^Exit\s+Function/i.test(content)) openFuncs++;
    if (/^End\s+Function$/i.test(content)) openFuncs--;

    // With / End With
    if (/^With\s+/i.test(content)) openWiths++;
    if (/^End\s+With$/i.test(content)) openWiths--;

    // For / Next
    if (/^For\s+/i.test(content)) openFors++;
    if (/^Next(\s+.*)?$/i.test(content)) openFors--;
  }

  if (openSubs !== 0) issues.push(openSubs > 0 ? "Eksik 'End Sub' ifadesi var." : "Fazladan 'End Sub' ifadesi var.");
  if (openFuncs !== 0) issues.push(openFuncs > 0 ? "Eksik 'End Function' ifadesi var." : "Fazladan 'End Function' ifadesi var.");
  if (openWiths !== 0) issues.push(openWiths > 0 ? "Eksik 'End With' ifadesi var." : "Fazladan 'End With' ifadesi var.");
  if (openFors !== 0) issues.push(openFors > 0 ? "Eksik 'Next' ifadesi var." : "Fazladan 'Next' ifadesi var.");

  return issues;
};

const CodeGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
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
        setTimeout(() => {
            codeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  }, [code, loading]);

  const handleGenerate = async (templatePrompt?: string) => {
    const promptToUse = templatePrompt || prompt;
    if (!promptToUse.trim()) return;
    
    if(templatePrompt) setPrompt(templatePrompt);

    const isRefinement = !!code && !templatePrompt; 
    
    setLoading(true);
    setValidationErrors([]);
    try {
      const result = await generateExcelMacro(promptToUse, isRefinement ? code : undefined);
      setCode(result);

      // Validate Generated Code
      const errors = validateVbaCode(result);
      setValidationErrors(errors);

      if (!isRefinement) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          prompt: promptToUse,
          code: result,
          date: new Date()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 20));
      }
      
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
    const errors = validateVbaCode(item.code);
    setValidationErrors(errors);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(i => i.id !== id));
  };

  const handleReset = () => {
    setCode("");
    setPrompt("");
    setCopied(false);
    setValidationErrors([]);
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
      
      {/* LEFT SIDEBAR: History */}
      <div className="lg:w-72 w-full flex flex-col gap-6 shrink-0 order-2 lg:order-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col max-h-[600px] lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-500" />
            Geçmiş İşlemler
          </h3>
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-2 max-h-[500px]">
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
      <div className="flex-1 flex flex-col gap-8 order-1 lg:order-2">
        
        {/* 1. INPUT AREA */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 transition-all duration-300">
           <div className="flex items-center justify-between mb-3">
             <label className="block text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                {code ? "Kodu Revize Et / Değiştir" : "Excel'de ne yapmak istiyorsunuz?"}
             </label>
             {code && (
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <Home className="w-4 h-4" />
                  Yeni İşlem
                </button>
             )}
           </div>
           
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
                  className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base p-4 min-h-[100px] resize-y bg-slate-50 focus:bg-white transition-colors"
                  placeholder={code ? "Örn: Mesaj kutusundaki metni değiştir, döngüyü tersten kur..." : "Örn: A sütunundaki boş satırları sil, F5 hücresine dolar kurunu yaz..."}
              />
              
              <div className="mt-3 flex justify-between items-center">
                 <span className="text-xs text-slate-400 hidden sm:inline-block">
                    {code ? "Mevcut kod üzerinde değişiklik yapmak için isteğinizi yazın." : "Detaylı açıklama daha iyi sonuç verir."}
                 </span>
                 <button
                    onClick={() => handleGenerate()}
                    disabled={loading || !prompt.trim()}
                    className={`ml-auto flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${
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

        {/* 2. TEMPLATES GRID */}
        {!code && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-800">Hazır Şablonlar</h2>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">30+ Fikir</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {TEMPLATE_CATEGORIES.map((category, catIdx) => (
                <div key={catIdx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {category.title}
                  </div>
                  <div className="p-2 grid gap-1">
                    {category.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        onClick={() => handleGenerate(item.prompt)}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50 hover:border-purple-100 border border-transparent transition-all group text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-purple-200 transition-colors">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700 group-hover:text-purple-700 truncate">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 group-hover:text-purple-400">
                            {item.prompt}
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. OUTPUT AREA */}
        {(code || loading) && (
            <div 
                ref={codeSectionRef}
                className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
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

                {/* Validation Warnings */}
                {validationErrors.length > 0 && (
                  <div className="bg-amber-50 border-b border-amber-200 p-4 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 mb-1">Kod Kontrolü Uyarıları</h4>
                        <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                          {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Code Viewer Display */}
                <div className="relative bg-white min-h-[300px] max-h-[800px] overflow-auto custom-scrollbar group">
                    {loading ? (
                    <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-blue-500 font-mono text-sm animate-pulse">Kodunuz hazırlanıyor...</p>
                    </div>
                    ) : (
                    <>
                        <div className="p-6">
                            <VbaCodeViewer code={code} />
                        </div>
                        {/* Floating Instruction */}
                        <div className="sticky bottom-4 left-0 w-full flex justify-end px-4 pointer-events-none">
                            <div className="bg-blue-600/90 backdrop-blur text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                Excel'de: Alt + F11 &gt; Insert Module &gt; Yapıştır
                            </div>
                        </div>
                    </>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default CodeGenerator;