import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, Play, FileJson, Sparkles, Info, ArrowRight } from 'lucide-react';
import { generateExcelMacro } from '../services/geminiService';

const CodeGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const generatedCode = await generateExcelMacro(prompt);
      setCode(generatedCode);
    } catch (error) {
      console.error(error);
      setCode("' Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Makro Sihirbazı
        </h2>
        <p className="text-slate-500">
          Excel'de yapmak istediğiniz işlemi detaylıca anlatın, yapay zeka kodunu yazsın.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Input Section */}
        <div className="flex flex-col h-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Ne yapmak istiyorsunuz?
            </label>
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 w-full rounded-lg border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-4 border resize-none bg-slate-50 min-h-[200px]"
                placeholder="Örnekler:&#10;- A sütunundaki tüm boş satırları sil.&#10;- B sütunundaki sayıları büyükten küçüğe sırala ve ilk 10'u yeşile boya.&#10;- F5 hücresine güncel Dolar/TL kurunu çeken bir buton yap."
            />
            <div className="mt-4 flex flex-col gap-3">
              <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                  {loading ? (
                      <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Kod Yazılıyor...
                      </>
                  ) : (
                      <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Makroyu Oluştur
                      </>
                  )}
              </button>
              
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="text-xs text-slate-500 flex items-center justify-center gap-1 hover:text-purple-600 transition-colors"
              >
                <Info className="w-3 h-3" />
                Neden doğrudan .xlsm indiremiyorum?
              </button>
              
              {showInfo && (
                <div className="text-xs bg-slate-100 p-3 rounded text-slate-600 leading-relaxed border border-slate-200">
                  <strong>Güvenlik ve Teknik Kısıtlama:</strong> Tarayıcılar, virüs riski nedeniyle içinde çalıştırılabilir kod (makro) bulunan Excel dosyalarını (.xlsm) doğrudan oluşturamaz. Bu yüzden kodu metin olarak alıp Excel'e yapıştırmanız en güvenli ve tek yoldur.
                </div>
              )}
            </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden shadow-inner border border-slate-700">
            {code ? (
                <>
                    <div className="flex justify-between items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
                            <FileCode className="w-4 h-4" />
                            VBA Kodu
                        </span>
                        <div className="flex gap-2">
                             <button 
                                onClick={copyToClipboard}
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors font-semibold shadow-sm"
                            >
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Kopyalandı!' : 'Kodu Kopyala'}
                            </button>
                            <button 
                                onClick={downloadBasFile}
                                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                .bas İndir
                            </button>
                        </div>
                    </div>
                    <pre className="p-4 text-sm font-mono text-blue-300 overflow-auto flex-1 leading-relaxed custom-scrollbar selection:bg-blue-900 selection:text-white">
                        <code>{code}</code>
                    </pre>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8">
                    <FileCode className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-center text-sm">Kodunuz burada görünecek.</p>
                </div>
            )}
        </div>
      </div>
      
      {code && (
          <div className="mt-6 p-5 bg-emerald-50 text-emerald-900 rounded-xl text-sm border border-emerald-100 flex flex-col md:flex-row items-start gap-4 shadow-sm">
              <div className="bg-emerald-100 p-2 rounded-full hidden md:block">
                 <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <strong className="block mb-2 text-base font-bold text-emerald-800">En Hızlı Yöntem (Kopyala-Yapıştır):</strong>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                    <span className="block text-xs font-bold text-emerald-600 uppercase mb-1">Adım 1</span>
                    Yukarıdaki <strong className="text-emerald-800">Kodu Kopyala</strong> butonuna basın.
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-emerald-100/50 flex items-center gap-2">
                     <div>
                        <span className="block text-xs font-bold text-emerald-600 uppercase mb-1">Adım 2</span>
                        Excel'de <code className="bg-slate-800 text-white px-1.5 py-0.5 rounded text-xs">Alt</code> + <code className="bg-slate-800 text-white px-1.5 py-0.5 rounded text-xs">F11</code> tuşlarına basın.
                     </div>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                     <span className="block text-xs font-bold text-emerald-600 uppercase mb-1">Adım 3</span>
                     Menüden <strong>Insert {'>'} Module</strong> deyin ve yapıştırın. <code className="text-xs bg-slate-200 px-1 rounded">F5</code> ile çalıştırın.
                  </div>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CodeGenerator;