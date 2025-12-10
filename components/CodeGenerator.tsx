import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, Copy, Check, Download, Sparkles, 
  History, Trash2, RefreshCw, Wand2,
  AlertTriangle, Sigma, BookOpen,
  Lightbulb, Info, MousePointerClick,
  FunctionSquare, Home
} from 'lucide-react';
import { generateExcelMacro, generateSmartExcelSolution, SmartSolution } from '../services/geminiService';

interface HistoryItem {
  id: string;
  prompt: string;
  code: string;
  date: Date;
  type: 'VBA' | 'FORMULA';
}

interface CodeGeneratorProps {
  initialPrompt?: string;
}

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
              <span className="text-emerald-600 italic">{commentPart}</span>
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
    .replace(/"([^"]*)"/g, '<span class="text-amber-600">"$1"</span>'); // Strings in Amber/Brown

  keywords.forEach(kw => {
     // Case insensitive whole word match
     const regex = new RegExp(`\\b${kw}\\b`, 'gi');
     // Replace with same case but wrapped - standard VBA Blue
     html = html.replace(regex, (match) => `<span class="text-blue-800 font-bold">${match}</span>`);
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

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ initialPrompt }) => {
  const [prompt, setPrompt] = useState<string>("");
  const [code, setCode] = useState<string>(""); // Acts as Content for Formula or VBA
  
  // State for Smart Solution
  const [solutionType, setSolutionType] = useState<'VBA' | 'FORMULA' | null>(null);
  const [solutionTitle, setSolutionTitle] = useState<string>("");
  const [solutionExplanation, setSolutionExplanation] = useState<string>("");
  const [vbaFallbackPrompt, setVbaFallbackPrompt] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const codeSectionRef = useRef<HTMLDivElement>(null);
  const hasRunInitial = useRef(false);

  // Handle Initial Prompt (Navigated from other page)
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== "" && !hasRunInitial.current) {
      setPrompt(initialPrompt);
      // Auto-trigger generation
      handleSmartGenerate(initialPrompt);
      hasRunInitial.current = true;
    } else if (!initialPrompt) {
        // Reset if we navigated here empty
        setPrompt("");
        setCode("");
        setSolutionType(null);
        hasRunInitial.current = false;
    }
  }, [initialPrompt]);

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

  const handleSmartGenerate = async (templatePrompt?: string) => {
    const promptToUse = templatePrompt || prompt;
    if (!promptToUse.trim()) return;
    
    if(templatePrompt) setPrompt(templatePrompt);

    // If we already have VBA code and user is refining it, stick to VBA refinement
    const isVbaRefinement = solutionType === 'VBA' && !!code && !templatePrompt;

    setLoading(true);
    setValidationErrors([]);
    
    try {
        if (isVbaRefinement) {
            // Refinement path (only for VBA)
            const result = await generateExcelMacro(promptToUse, code);
            setCode(result);
            setValidationErrors(validateVbaCode(result));
        } else {
            // Smart New Generation Path
            const solution: SmartSolution = await generateSmartExcelSolution(promptToUse);
            setSolutionType(solution.type);
            setCode(solution.content);
            setSolutionTitle(solution.title);
            setSolutionExplanation(solution.explanation);
            setVbaFallbackPrompt(solution.vbaFallbackPrompt || promptToUse);

            if (solution.type === 'VBA') {
                setValidationErrors(validateVbaCode(solution.content));
            }
            
            // Add to history
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
        setCode("' Bir hata oluştu. Lütfen tekrar deneyin.\n' " + error);
        setSolutionType('VBA'); // Fallback error display
    } finally {
        setLoading(false);
    }
  };

  const handleForceVBA = async () => {
      // User saw Formula but wants VBA
      setLoading(true);
      try {
          const vbaCode = await generateExcelMacro(vbaFallbackPrompt || prompt);
          setSolutionType('VBA');
          setCode(vbaCode);
          setValidationErrors(validateVbaCode(vbaCode));
          setSolutionTitle("Özel Makro (VBA)");
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setCode(item.code);
    setSolutionType(item.type || 'VBA');
    
    if (item.type === 'VBA' || !item.type) {
        const errors = validateVbaCode(item.code);
        setValidationErrors(errors);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(i => i.id !== id));
  };

  const handleReset = () => {
    setCode("");
    setPrompt("");
    setSolutionType(null);
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* LEFT SIDEBAR: History */}
      <div className="lg:w-72 w-full flex flex-col gap-6 shrink-0 order-2 lg:order-1">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-0 flex flex-col max-h-[600px] lg:sticky lg:top-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
             <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-[#107C41]" />
                Son İşlemler
             </h3>
             <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded border border-slate-100">{history.length}</span>
          </div>
          <div className="overflow-y-auto flex-1 p-3 pr-1 custom-scrollbar space-y-2 max-h-[500px]">
            {history.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8 flex flex-col items-center gap-2">
                 <div className="p-3 bg-slate-50 rounded-full">
                    <History className="w-6 h-6 text-slate-300" />
                 </div>
                 Henüz geçmiş yok.
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="group relative p-3 rounded-md border border-slate-100 bg-white hover:border-[#107C41]/30 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                      <div className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ml-auto shrink-0 uppercase tracking-tight ${
                          item.type === 'FORMULA' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                          {item.type === 'FORMULA' ? 'Formül' : 'Makro'}
                      </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                    <span>{item.date.toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={(e) => deleteHistoryItem(e, item.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
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
        
        {/* 1. INPUT AREA */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 transition-all duration-300">
           {/* Excel-like Input Header */}
           <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 rounded-t-lg">
             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#107C41]" />
                {code ? (solutionType === 'FORMULA' ? "Yeni Sorgu" : "Revize Et") : "Otomasyon Asistanı"}
             </label>
             {code && (
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#107C41] hover:bg-emerald-50 px-2 py-1 rounded transition-colors font-medium"
                >
                  <Home className="w-3 h-3" />
                  Temizle
                </button>
             )}
           </div>
           
           <div className="p-4">
              <div className="relative">
                 {/* Input resembling Excel Grid/Cell */}
                 <textarea 
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     onKeyDown={(e) => {
                       if(e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         if(prompt.trim()) handleSmartGenerate();
                       }
                     }}
                     className="block w-full rounded border-slate-300 shadow-inner focus:border-[#107C41] focus:ring-[#107C41] text-base p-3 min-h-[80px] resize-y bg-white font-sans text-slate-800 placeholder:text-slate-400"
                     placeholder={code ? "Mevcut kod üzerinde değişiklik yapmak için isteğinizi yazın..." : "Excel'de ne yapmak istiyorsunuz? (Örn: A sütunundaki boşları sil)"}
                 />
                 
                 <div className="mt-3 flex justify-between items-center">
                    <div className="flex gap-2">
                       {/* Mock Format Buttons */}
                       <div className="hidden sm:flex items-center gap-0.5 p-1 bg-slate-100 rounded text-slate-500">
                          <span className="p-1 hover:bg-white rounded cursor-pointer"><FunctionSquare className="w-3.5 h-3.5" /></span>
                          <span className="w-px h-3 bg-slate-300 mx-1"></span>
                          <span className="p-1 hover:bg-white rounded cursor-pointer font-bold text-xs">B</span>
                          <span className="p-1 hover:bg-white rounded cursor-pointer italic text-xs">I</span>
                       </div>
                    </div>

                    <button
                       onClick={() => handleSmartGenerate()}
                       disabled={loading || !prompt.trim()}
                       className={`ml-auto flex items-center gap-2 px-5 py-2 rounded shadow-sm text-sm font-medium text-white transition-all hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed ${
                         code ? 'bg-[#107C41] hover:bg-[#0E6A37]' : 'bg-[#107C41] hover:bg-[#0E6A37]'
                       }`}
                   >
                       {loading ? (
                           <>
                              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                              {code ? "İşleniyor..." : "Çalıştır"}
                           </>
                       ) : (
                           <>
                              {code ? <RefreshCw className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                              {code ? "Güncelle" : "Oluştur"}
                           </>
                       )}
                   </button>
                 </div>
              </div>
           </div>
        </div>

        {/* 2. INITIAL STATE (If no code is generated yet) */}
        {!code && !loading && (
          <div className="flex flex-col items-center justify-center py-10 text-center opacity-70">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-slate-600 font-semibold text-lg">Otomasyon Merkezi</h3>
             <p className="text-slate-400 text-sm max-w-md mt-2">
                Yukarıdaki kutuya isteğinizi yazın veya şablonlar sekmesinden hazır bir senaryo seçin.
             </p>
          </div>
        )}

        {/* 3. OUTPUT AREA */}
        {(code || loading) && (
            <div 
                ref={codeSectionRef}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                {/* FORMULA VIEW - MIMIC EXCEL FORMULA BAR */}
                {!loading && solutionType === 'FORMULA' && (
                    <div className="bg-white rounded-lg shadow-md border border-slate-300 overflow-hidden">
                        {/* Title Bar */}
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="font-serif italic font-bold text-slate-400 text-lg">fx</div>
                                <h2 className="text-sm font-bold text-slate-700">{solutionTitle || "Fonksiyon"}</h2>
                             </div>
                             <button 
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors text-xs font-medium shadow-sm"
                             >
                                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Kopyalandı' : 'Kopyala'}
                             </button>
                        </div>
                        
                        <div className="p-6 bg-white">
                             {/* Instruction Box */}
                             <div className="mb-6 flex items-start gap-3 text-slate-600 text-sm">
                                <div className="mt-0.5"><Info className="w-4 h-4 text-blue-500" /></div>
                                <p>Hücreye yapıştırın ve <kbd className="font-mono bg-slate-100 border border-slate-300 px-1 rounded text-xs text-slate-500">Enter</kbd> tuşuna basın.</p>
                             </div>

                             {/* Formula Bar Lookalike */}
                             <div className="relative group">
                                <div className="flex items-center border border-slate-300 rounded shadow-sm overflow-hidden">
                                   <div className="bg-slate-50 px-3 py-3 border-r border-slate-200 text-slate-400">
                                      <Sigma className="w-4 h-4" />
                                   </div>
                                   <pre className="flex-1 bg-white text-slate-800 p-3 font-mono text-base overflow-x-auto whitespace-pre-wrap selection:bg-emerald-200">
                                       {code}
                                   </pre>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 text-xs px-2 py-1">
                                    Tıkla & Kopyala
                                </div>
                             </div>

                             <div className="mt-6 p-4 bg-emerald-50 rounded border border-emerald-100 flex gap-3">
                                <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-emerald-800 text-sm mb-1">Açıklama</h4>
                                    <p className="text-xs text-emerald-700 leading-relaxed">
                                        {solutionExplanation}
                                    </p>
                                </div>
                             </div>

                             <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
                                 <button 
                                    onClick={handleForceVBA}
                                    className="text-xs text-slate-400 hover:text-slate-600 underline flex items-center gap-1 transition-colors"
                                 >
                                     <FileCode className="w-3 h-3" />
                                     Bunu Makro (VBA) olarak ver
                                 </button>
                             </div>
                        </div>
                    </div>
                )}

                {/* VBA VIEW - MIMIC VBA EDITOR */}
                {(loading || solutionType === 'VBA') && (
                    <div className="bg-white rounded shadow-md border border-slate-300 flex flex-col overflow-hidden">
                        {/* Toolbar - VBE Style */}
                        <div className="flex flex-wrap justify-between items-center px-2 py-1 bg-slate-100 border-b border-slate-300 gap-2 min-h-[40px]">
                            <div className="flex items-center gap-2 px-2">
                               <FileCode className="w-4 h-4 text-blue-700" />
                               <span className="text-xs font-semibold text-slate-600">Module1 (Code)</span>
                            </div>
                            <div className="flex gap-1">
                            <button 
                                onClick={copyToClipboard}
                                disabled={loading}
                                className="text-xs bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-700 px-3 py-1 rounded-sm flex items-center gap-1.5 transition-colors"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                            <button 
                                onClick={downloadBasFile}
                                disabled={loading}
                                className="text-xs bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-700 px-3 py-1 rounded-sm flex items-center gap-1.5 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                .bas İndir
                            </button>
                            </div>
                        </div>

                        {/* Validation Warnings */}
                        {validationErrors.length > 0 && (
                        <div className="bg-amber-50 border-b border-amber-200 p-3 animate-in slide-in-from-top-2">
                            <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-amber-800 mb-1">Uyarılar</h4>
                                <ul className="list-disc list-inside text-xs text-amber-700 space-y-0.5">
                                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                            </div>
                        </div>
                        )}
                        
                        {/* INSTRUCTION BOX FOR VBA */}
                        {!loading && (
                            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-start gap-3">
                                <MousePointerClick className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-slate-600 space-y-0.5">
                                    <span className="font-bold text-slate-700">Kurulum: </span>
                                    <span>Excel'de <kbd className="font-mono bg-white border border-slate-300 px-1 rounded">Alt + F11</kbd> ile editörü açın, <span className="font-semibold">Insert &gt; Module</span> diyerek yapıştırın ve <kbd className="font-mono bg-white border border-slate-300 px-1 rounded">F5</kbd> ile çalıştırın.</span>
                                </div>
                            </div>
                        )}

                        {/* Code Viewer Display */}
                        <div className="relative bg-white min-h-[300px] max-h-[800px] overflow-auto custom-scrollbar group border-t border-slate-200">
                            {loading ? (
                            <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
                                <div className="w-10 h-10 border-4 border-[#107C41]/30 border-t-[#107C41] rounded-full animate-spin"></div>
                                <p className="text-[#107C41] font-sans text-sm animate-pulse font-medium">Kod oluşturuluyor...</p>
                            </div>
                            ) : (
                            <>
                                <div className="p-4">
                                    <VbaCodeViewer code={code} />
                                </div>
                            </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default CodeGenerator;