import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, Copy, Check, Download, 
  History, Trash2, RefreshCw, Wand2,
  AlertTriangle, Sigma,
  Lightbulb, Info, MousePointerClick,
  FunctionSquare, Home, Zap, Sparkles,
  LayoutTemplate, ChevronDown, ChevronRight,
  Eraser, FileJson,
  BarChart, PaintBucket,
  HelpCircle, Keyboard, Play
} from 'lucide-react';
import { generateExcelMacro, generateSmartExcelSolution, SmartSolution } from '../services/geminiService';

interface HistoryItem {
  id: string;
  prompt: string;
  code: string;
  date: Date;
  type: 'VBA' | 'FORMULA' | 'SUGGESTION';
}

interface CodeGeneratorProps {
  initialPrompt?: string;
}

// Template Data
const TEMPLATE_CATEGORIES = [
  {
    id: 'clean',
    title: "Veri Temizleme",
    icon: Eraser,
    items: [
      { label: "Boş Satırları Sil", prompt: "Aktif sayfadaki A sütunu boş olan tüm satırları bul ve tamamen sil." },
      { label: "Mükerrerleri Kaldır", prompt: "A sütunundaki tekrar eden verileri bul ve satırları tamamen kaldır, sadece benzersizler kalsın." },
      { label: "Boşlukları Kırp", prompt: "Seçili alandaki tüm hücrelerin başında ve sonundaki gereksiz boşlukları temizle." },
      { label: "Birleştirilmişleri Çöz", prompt: "Sayfadaki tüm birleştirilmiş (merged) hücreleri çöz ve değerleri doldur." },
    ]
  },
  {
    id: 'file',
    title: "Dosya Yönetimi",
    icon: FileJson,
    items: [
      { label: "PDF Olarak Kaydet", prompt: "Aktif sayfayı masaüstüne bugünün tarihiyle isimlendirilmiş bir PDF dosyası olarak kaydet." },
      { label: "Sayfaları Listele", prompt: "Yeni bir 'Index' sayfası oluştur ve kitaptaki tüm sayfaların isimlerini linkli (hyperlink) olarak listele." },
      { label: "Tüm Sayfaları Koru", prompt: "Kitaptaki tüm sayfaları '1234' şifresi ile korumaya al (Protect)." },
    ]
  },
  {
    id: 'analysis',
    title: "Analiz & Rapor",
    icon: BarChart,
    items: [
      { label: "Pivot Tablo Oluştur", prompt: "A1'den başlayan verileri kullanarak yeni bir sayfada özet bir Pivot Tablo oluştur." },
      { label: "Otomatik Filtrele", prompt: "Tablo başlıklarına otomatik filtre ekle ve ilk sütuna göre A'dan Z'ye sırala." },
      { label: "Düşeyara ile Birleştir", prompt: "Sayfa2'den verileri DÜŞEYARA (VLOOKUP) kullanarak Sayfa1'e eşleştir ve getir." },
    ]
  },
  {
    id: 'visual',
    title: "Görünüm",
    icon: PaintBucket,
    items: [
      { label: "Zebra Boyama", prompt: "Tablodaki satırları okunabilirliği artırmak için birer atlayarak açık gri renge boya." },
      { label: "Otomatik Sığdır", prompt: "Tüm sayfadaki sütun genişliklerini içeriklerine göre otomatik ayarla (AutoFit)." },
      { label: "Başlıkları Dondur", prompt: "İlk satırı (başlıkları) dondur (Freeze Panes) böylece kaydırınca sabit kalsın." },
    ]
  }
];

// Local Suggestion Pool
const SUGGESTION_POOL = [
  "A sütunundaki boş satırları sil",
  "Tüm formülleri değere çevir",
  "Sayfayı PDF olarak kaydet",
  "Mükerrer kayıtları kaldır",
  "Sayfa isimlerini listele",
  "Hücre rengi kırmızı olanları topla",
  "Gizli sayfaları göster",
  "İki tarih arasındaki iş günlerini hesapla"
];

// --- COMPONENTS ---

// iOS Style Segmented Control
const SegmentedControl = ({ 
    options, 
    selected, 
    onChange,
    disabled = false
}: { 
    options: { id: string, label: string, icon?: React.ElementType }[], 
    selected: string, 
    onChange: (id: any) => void,
    disabled?: boolean
}) => {
    return (
        <div className={`p-1 bg-slate-200/70 rounded-lg flex relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
            {options.map((opt) => {
                const isSelected = selected === opt.id;
                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-md transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] relative z-10
                            ${isSelected ? 'text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        {opt.icon && <opt.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#007AFF]':''}`} />}
                        {opt.label}
                    </button>
                );
            })}
            {/* Sliding Background */}
            <div 
                className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                    left: '4px',
                    width: `calc((100% - 8px) / ${options.length})`,
                    transform: `translateX(${options.findIndex(o => o.id === selected) * 100}%)`
                }}
            />
        </div>
    );
};

// Simple VBA Syntax Highlighter
const VbaCodeViewer: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.split('\n');
  const keywords = ["Sub", "End Sub", "Dim", "As", "Set", "If", "Then", "Else", "End If", "For", "Next", "To", "MsgBox", "Call", "Function", "End Function", "On Error", "GoTo", "Resume", "True", "False", "Nothing", "With", "End With", "ActiveSheet", "Range", "Cells", "Application", "Worksheets", "Workbook", "Option Explicit", "Exit", "Do", "Loop", "While", "Private", "Public"];
  
  return (
    <div className="flex font-mono text-[13px] leading-6 bg-white min-h-[300px]">
      <div className="shrink-0 text-right pr-3 pl-3 py-4 text-slate-300 border-r border-slate-50 bg-slate-50/30 select-none">
        {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <pre className="whitespace-pre-wrap break-words p-4 text-slate-800">
          {lines.map((line, idx) => {
            const commentIndex = line.indexOf("'");
            if (commentIndex !== -1) {
              const codePart = line.substring(0, commentIndex);
              const commentPart = line.substring(commentIndex);
              return (
                <div key={idx}>
                  <span dangerouslySetInnerHTML={{ __html: highlightKeywords(codePart, keywords) }} />
                  <span className="text-emerald-600/90 italic">{commentPart}</span>
                </div>
              );
            }
            return (
              <div key={idx} dangerouslySetInnerHTML={{ __html: highlightKeywords(line, keywords) }} />
            );
          })}
        </pre>
      </div>
    </div>
  );
};

const highlightKeywords = (text: string, keywords: string[]) => {
  if(!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"([^"]*)"/g, '<span class="text-[#D93425]">$1</span>'); // String Red/Brown

  keywords.forEach(kw => {
     const regex = new RegExp(`\\b${kw}\\b`, 'gi');
     html = html.replace(regex, (match) => `<span class="text-[#0000FF] font-semibold">${match}</span>`); // VBA Blue
  });
  return html;
};

// Validate VBA Structure
const validateVbaCode = (code: string): string[] => {
  const issues: string[] = [];
  const lines = code.split('\n');
  let openSubs = 0, openFuncs = 0, openWiths = 0, openFors = 0;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("'")) continue;
    
    // Simplistic Check
    if (/^(Private\s+|Public\s+)?Sub\s+/i.test(trimmed) && !/^End\s+Sub/i.test(trimmed) && !/^Exit\s+Sub/i.test(trimmed)) openSubs++;
    if (/^End\s+Sub/i.test(trimmed)) openSubs--;
    if (/^(Private\s+|Public\s+)?Function\s+/i.test(trimmed) && !/^End\s+Function/i.test(trimmed) && !/^Exit\s+Function/i.test(trimmed)) openFuncs++;
    if (/^End\s+Function/i.test(trimmed)) openFuncs--;
    if (/^With\s+/i.test(trimmed)) openWiths++;
    if (/^End\s+With/i.test(trimmed)) openWiths--;
    if (/^For\s+/i.test(trimmed)) openFors++;
    if (/^Next/i.test(trimmed)) openFors--;
  }

  if (openSubs !== 0) issues.push(openSubs > 0 ? "Eksik 'End Sub'" : "Fazladan 'End Sub'");
  if (openFuncs !== 0) issues.push(openFuncs > 0 ? "Eksik 'End Function'" : "Fazladan 'End Function'");
  if (openWiths !== 0) issues.push(openWiths > 0 ? "Eksik 'End With'" : "Fazladan 'End With'");
  if (openFors !== 0) issues.push(openFors > 0 ? "Eksik 'Next'" : "Fazladan 'Next'");

  return issues;
};

// --- BEGINNER INSTRUCTION COMPONENTS ---

const InstructionStep = ({ num, text, icon }: { num: number, text: React.ReactNode, icon?: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mt-0.5">
            {num}
        </div>
        <div className="flex-1 text-sm text-slate-700 leading-snug pt-0.5">
           {text}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
    </div>
);

const FormulaInstructions = () => (
    <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-5 mb-6">
        <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-4">
            <Info className="w-4 h-4" />
            Nasıl Kullanılır? (Formül)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InstructionStep num={1} text={<span>Sağdaki <b>Kopyala</b> butonuna basarak formülü alın.</span>} icon={<Copy className="w-4 h-4" />} />
            <InstructionStep num={2} text="Excel'de işlem yapmak istediğiniz hücreye çift tıklayın." icon={<MousePointerClick className="w-4 h-4" />} />
            <InstructionStep num={3} text={<span>Formülü yapıştırın (CTRL+V) ve <b>Enter</b> tuşuna basın.</span>} icon={<Keyboard className="w-4 h-4" />} />
        </div>
    </div>
);

const VbaInstructions = () => (
    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-5 mb-6">
        <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-4">
            <HelpCircle className="w-4 h-4" />
            Nasıl Kullanılır? (Makro)
        </h4>
        <div className="grid grid-cols-1 gap-3">
            <InstructionStep num={1} text={<span>Excel'de klavyenizden <b>ALT</b> ve <b>F11</b> tuşlarına aynı anda basın.</span>} icon={<Keyboard className="w-4 h-4" />} />
            <InstructionStep num={2} text={<span>Açılan pencerenin üst menüsünden <b>Insert</b> &gt; <b>Module</b> seçeneğine tıklayın.</span>} />
            <InstructionStep num={3} text="Aşağıdaki kodu açılan beyaz sayfaya yapıştırın." icon={<Copy className="w-4 h-4" />} />
            <InstructionStep num={4} text={<span>Çalıştırmak için klavyeden <b>F5</b> tuşuna basın.</span>} icon={<Play className="w-4 h-4" />} />
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ initialPrompt }) => {
  // --- STATES ---
  const [prompt, setPrompt] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [code, setCode] = useState<string>(""); 
  
  const [solutionType, setSolutionType] = useState<'VBA' | 'FORMULA' | 'SUGGESTION' | null>(null);
  const [solutionTitle, setSolutionTitle] = useState<string>("");
  const [solutionExplanation, setSolutionExplanation] = useState<string>("");
  const [vbaFallbackPrompt, setVbaFallbackPrompt] = useState<string>("");
  
  // Caching
  const [cachedFormula, setCachedFormula] = useState<string | null>(null);
  const [cachedVBA, setCachedVBA] = useState<string | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [sidebarTab, setSidebarTab] = useState<'templates' | 'history'>('templates');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('clean');
  
  const codeSectionRef = useRef<HTMLDivElement>(null);
  const hasRunInitial = useRef(false);

  // --- EFFECTS ---

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== "" && !hasRunInitial.current) {
      setPrompt(initialPrompt);
      handleSmartGenerate(initialPrompt);
      hasRunInitial.current = true;
    } else if (!initialPrompt) {
        setPrompt("");
        handleReset();
        hasRunInitial.current = false;
    }
  }, [initialPrompt]);

  useEffect(() => {
    const saved = localStorage.getItem('macro_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((i: any) => ({ ...i, date: new Date(i.date) })));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('macro_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if ((code || loading) && codeSectionRef.current) {
        // Smooth scroll with a slight delay to allow animation frame
        setTimeout(() => {
            codeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
    }
  }, [code, loading]);

  // --- HANDLERS ---

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPrompt(val);
    if (val.length > 2) {
      const lowerVal = val.toLowerCase();
      setSuggestions(SUGGESTION_POOL.filter(item => item.toLowerCase().includes(lowerVal)).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    setSuggestions([]);
  };

  const handleSmartGenerate = async (templatePrompt?: string) => {
    const promptToUse = templatePrompt || prompt;
    if (!promptToUse.trim()) return;
    
    if(templatePrompt) setPrompt(templatePrompt);
    setSuggestions([]); 

    const isVbaRefinement = solutionType === 'VBA' && !!code && !templatePrompt;

    setLoading(true);
    setValidationErrors([]);
    setCachedFormula(null);
    setCachedVBA(null);
    
    try {
        if (isVbaRefinement) {
            const result = await generateExcelMacro(promptToUse, code);
            setCode(result);
            setCachedVBA(result);
            setValidationErrors(validateVbaCode(result));
        } else {
            const solution: SmartSolution = await generateSmartExcelSolution(promptToUse);
            setSolutionType(solution.type);
            setCode(solution.content);
            setSolutionTitle(solution.title);
            setSolutionExplanation(solution.explanation);
            setVbaFallbackPrompt(solution.vbaFallbackPrompt || promptToUse);

            if (solution.type === 'FORMULA') {
                setCachedFormula(solution.content);
            } else if (solution.type === 'VBA') {
                setCachedVBA(solution.content);
                setValidationErrors(validateVbaCode(solution.content));
            } else {
                // SUGGESTION TYPE
                // Content comes as a CSV string or similar, no validation needed
            }
            
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                prompt: promptToUse,
                code: solution.content,
                date: new Date(),
                type: solution.type
            };
            setHistory(prev => [newItem, ...prev].slice(0, 20));
        }
    } catch (error) {
        console.error(error);
        setCode("' Bir hata oluştu.\n' " + error);
        setSolutionType('VBA'); 
    } finally {
        setLoading(false);
    }
  };

  const handleSwitchToVBA = async () => {
      setSolutionType('VBA');
      if (cachedVBA) {
          setCode(cachedVBA);
          setValidationErrors(validateVbaCode(cachedVBA));
          return;
      }
      setLoading(true);
      try {
          const vbaCode = await generateExcelMacro(vbaFallbackPrompt || prompt);
          setCode(vbaCode);
          setCachedVBA(vbaCode);
          setValidationErrors(validateVbaCode(vbaCode));
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSwitchToFormula = () => {
      if (cachedFormula) {
          setSolutionType('FORMULA');
          setCode(cachedFormula);
          setValidationErrors([]);
      }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setCode(item.code);
    setSolutionType(item.type || 'VBA');
    setSuggestions([]);
    if (item.type === 'FORMULA') {
        setCachedFormula(item.code);
        setCachedVBA(null);
    } else if (item.type === 'VBA') {
        setCachedVBA(item.code);
        setCachedFormula(null);
        setValidationErrors(validateVbaCode(item.code));
    }
  };

  const handleReset = () => {
    setCode("");
    setPrompt("");
    setSuggestions([]);
    setSolutionType(null);
    setCachedFormula(null);
    setCachedVBA(null);
    setCopied(false);
    setValidationErrors([]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBasFile = () => {
    if (!code || solutionType !== 'VBA') return;
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

  const toggleCategory = (catId: string) => setExpandedCategory(expandedCategory === catId ? null : catId);

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const showOutput = code || loading;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full items-start px-1">
      
      {/* --- SIDEBAR (iPad Split View Style) --- */}
      <div className="lg:w-80 w-full shrink-0 lg:order-1 h-auto lg:h-[calc(100vh-180px)] sticky top-20 flex flex-col">
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-full ring-1 ring-slate-900/5">
            
            {/* Sidebar Tabs */}
            <div className="p-3 border-b border-slate-100">
                <SegmentedControl 
                    options={[
                        { id: 'templates', label: 'Şablonlar', icon: LayoutTemplate },
                        { id: 'history', label: 'Geçmiş', icon: History }
                    ]}
                    selected={sidebarTab}
                    onChange={(id) => setSidebarTab(id)}
                />
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                
                {/* TEMPLATES TAB */}
                {sidebarTab === 'templates' && TEMPLATE_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="bg-white/60 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-900/5 transition-all">
                        <button 
                            onClick={() => toggleCategory(cat.id)}
                            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-white/80 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-[#007AFF]/10 rounded-lg text-[#007AFF]">
                                    {React.createElement(cat.icon, { className: "w-4 h-4" })}
                                </div>
                                <span className="text-sm font-semibold text-slate-800">{cat.title}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedCategory === cat.id ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {/* Accordion Content */}
                        <div className={`overflow-hidden transition-all duration-300 ease-out ${expandedCategory === cat.id ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-slate-50/50 pb-2">
                                {cat.items.map((item, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleSmartGenerate(item.prompt)}
                                        className="w-full text-left px-4 pl-12 py-2.5 text-[13px] text-slate-600 hover:text-[#007AFF] hover:bg-white border-l-2 border-transparent hover:border-[#007AFF] transition-all flex items-center gap-2"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* HISTORY TAB */}
                {sidebarTab === 'history' && (
                    history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                            <History className="w-8 h-8 opacity-20" />
                            <span className="text-xs">Geçmiş boş</span>
                        </div>
                    ) : (
                        history.map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => loadFromHistory(item)}
                                className="w-full text-left group p-3 rounded-xl bg-white border border-slate-100 hover:border-blue-300/50 hover:shadow-md transition-all relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <span className="text-[13px] font-medium text-slate-700 line-clamp-2 leading-snug">{item.prompt}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${item.type === 'FORMULA' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {item.type === 'FORMULA' ? 'F' : 'VBA'}
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-400">{item.date.toLocaleDateString()}</div>
                                <div 
                                    onClick={(e) => { e.stopPropagation(); deleteHistoryItem(e, item.id); }}
                                    className="absolute right-0 top-0 bottom-0 w-8 bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </div>
                            </button>
                        ))
                    )
                )}
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col gap-6 lg:order-2 min-w-0">
        
        {/* 1. INPUT CARD */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 p-1 relative z-20 ring-1 ring-slate-900/5 transition-all focus-within:ring-[#007AFF]/30 focus-within:shadow-[0_4px_25px_rgba(0,122,255,0.08)]">
           {/* Header */}
           <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100/80">
             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#007AFF]" />
                {code ? (solutionType === 'FORMULA' ? "Sorgu Düzenle" : "Makro Düzenle") : "Ne yapmak istersiniz?"}
             </label>
             {code && (
                <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-50 transition-colors font-medium">
                  <Home className="w-3.5 h-3.5" />
                  Sıfırla
                </button>
             )}
           </div>
           
           <div className="p-5 relative">
                 <textarea 
                     value={prompt}
                     onChange={handleInputChange}
                     onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if(prompt.trim()) handleSmartGenerate(); }}}
                     className="block w-full rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white shadow-inner text-[15px] p-4 min-h-[100px] resize-y font-sans text-slate-800 placeholder:text-slate-400 focus:border-[#007AFF] focus:ring-0 transition-all outline-none"
                     placeholder={code ? "Mevcut çözüm üzerinde değişiklik yap..." : "Örn: A sütunundaki boş satırları sil ve B sütununa göre sırala."}
                 />

                 {/* Suggestions Dropdown */}
                 {suggestions.length > 0 && (
                   <div className="absolute top-[85%] left-5 right-5 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => applySuggestion(suggestion)}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-[#007AFF] hover:text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                           <Zap className="w-3 h-3 opacity-50" />
                           {suggestion}
                        </button>
                      ))}
                   </div>
                 )}
                 
                 <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-2">
                       {/* Formatting Tools (Mock) */}
                       <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg text-slate-500">
                          <span className="w-7 h-7 flex items-center justify-center hover:bg-white rounded cursor-pointer transition-colors"><FunctionSquare className="w-4 h-4" /></span>
                          <span className="w-px h-3 bg-slate-300 mx-1"></span>
                          <span className="w-7 h-7 flex items-center justify-center hover:bg-white rounded cursor-pointer font-bold text-xs">B</span>
                       </div>
                    </div>

                    <button
                       onClick={() => handleSmartGenerate()}
                       disabled={loading || !prompt.trim()}
                       className={`
                         flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-[#007AFF]/20 text-sm font-semibold text-white transition-all active:scale-95
                         ${loading || !prompt.trim() ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-[#007AFF] hover:bg-[#0062CC] hover:shadow-[#007AFF]/30'}
                       `}
                   >
                       {loading ? (
                           <>
                              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                              <span>Düşünüyor...</span>
                           </>
                       ) : (
                           <>
                              {code ? <RefreshCw className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                              <span>{code ? "Güncelle" : "Oluştur"}</span>
                           </>
                       )}
                   </button>
                 </div>
           </div>
        </div>

        {/* 2. OUTPUT CARD (Animated Reveal) */}
        <div 
            className={`transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                showOutput ? 'max-h-[2500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-8'
            }`}
        >
            <div ref={codeSectionRef} className="pt-2 pb-10"> 
                
                {/* SUGGESTION / NONSENSE FALLBACK */}
                {!loading && solutionType === 'SUGGESTION' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lightbulb className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Tam anlayamadım 🤔</h3>
                        <p className="text-slate-600 mb-6">{solutionExplanation || "Excel ile ilgili bir işlem yapmanıza yardımcı olabilirim. Belki şunları denemek istersiniz:"}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                            {code.split(',').map((sug, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSmartGenerate(sug.trim())}
                                    className="p-4 bg-slate-50 hover:bg-[#007AFF] hover:text-white border border-slate-100 rounded-xl transition-all text-sm font-medium text-left flex items-center gap-2 group"
                                >
                                    <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-white"></div>
                                    {sug.trim()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* MAIN OUTPUT (Formula or VBA) */}
                {(solutionType === 'FORMULA' || solutionType === 'VBA' || loading) && (
                <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden flex flex-col ring-1 ring-slate-900/5">
                    
                    {/* Header & Tabs */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${solutionType === 'FORMULA' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {solutionType === 'FORMULA' ? <Sigma className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                            </div>
                            {solutionTitle || "Çözüm"}
                        </h2>

                        <div className="w-48">
                            <SegmentedControl 
                                options={[{ id: 'FORMULA', label: 'Formül' }, { id: 'VBA', label: 'Makro' }]}
                                selected={solutionType || 'VBA'}
                                onChange={(val) => val === 'FORMULA' ? handleSwitchToFormula() : handleSwitchToVBA()}
                                disabled={loading || (solutionType === 'VBA' && !cachedFormula)}
                            />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="bg-white p-0 min-h-[200px] relative">
                        
                        {/* FORMULA DISPLAY */}
                        {!loading && solutionType === 'FORMULA' && (
                            <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                
                                {/* New Beginner Instructions */}
                                <FormulaInstructions />
                                
                                <div className="group relative mb-8">
                                    <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 shadow-inner overflow-hidden">
                                        <div className="px-4 py-4 text-slate-400 border-r border-slate-200 font-serif italic">fx</div>
                                        <pre className="flex-1 p-4 font-mono text-[15px] text-slate-900 overflow-x-auto whitespace-pre-wrap">{code}</pre>
                                    </div>
                                    <button 
                                        onClick={copyToClipboard}
                                        className="absolute top-2 right-2 bg-white/90 shadow-sm border border-slate-200 text-slate-500 hover:text-emerald-600 p-2 rounded-lg transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-100">
                                    <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        Nasıl Çalışır?
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{solutionExplanation}</p>
                                </div>
                            </div>
                        )}

                        {/* VBA DISPLAY */}
                        {(loading || solutionType === 'VBA') && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
                                
                                {/* New Beginner Instructions (Only show when not loading) */}
                                {!loading && (
                                    <div className="px-6 pt-6">
                                        <VbaInstructions />
                                    </div>
                                )}

                                {/* Toolbar */}
                                <div className="flex justify-between items-center px-4 py-2 bg-[#f9fafb] border-b border-t border-slate-100 text-xs mt-2">
                                    <span className="font-mono text-slate-500 px-2">Module1.bas</span>
                                    <div className="flex gap-2">
                                        <button onClick={copyToClipboard} disabled={loading} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all flex items-center gap-1.5">
                                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? 'Kopyalandı' : 'Kopyala'}
                                        </button>
                                        <button onClick={downloadBasFile} disabled={loading} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all flex items-center gap-1.5">
                                            <Download className="w-3.5 h-3.5" />
                                            İndir
                                        </button>
                                    </div>
                                </div>

                                {/* Warnings */}
                                {validationErrors.length > 0 && (
                                    <div className="bg-amber-50/50 border-b border-amber-100 p-3 px-6 flex gap-3 text-xs text-amber-800">
                                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                                        <ul className="list-disc list-inside space-y-0.5 opacity-80">
                                            {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                                        </ul>
                                    </div>
                                )}
                                
                                <div className="relative min-h-[300px] max-h-[800px] overflow-auto">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-[300px] space-y-6">
                                            <div className="relative">
                                                <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
                                                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                            <p className="text-slate-400 font-medium text-sm animate-pulse">Yapay zeka çözümü kodluyor...</p>
                                        </div>
                                    ) : (
                                        <VbaCodeViewer code={code} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                )}

            </div>
        </div>

      </div>
    </div>
  );
};

export default CodeGenerator;