import React from 'react';
import { X, Check, Globe, Laptop2 } from 'lucide-react';
import { AppSettings } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const VERSIONS = ['365', '2021', '2019', '2016', '2013', '2010'];
const LANGUAGES = [
  { code: 'TR', label: 'Türkçe', desc: 'Örn: EĞER, DÜŞEYARA', colorClass: 'emerald' },
  { code: 'EN', label: 'İngilizce', desc: 'Ex: IF, VLOOKUP', colorClass: 'blue' }
] as const;

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  if (!isOpen) return null;

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onSave({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Ayarlar</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Version Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
               <Laptop2 className="w-4 h-4 text-blue-500" />
               Excel Versiyonu
            </label>
            <div className="grid grid-cols-2 gap-2">
               {VERSIONS.map((ver) => (
                  <button
                    key={ver}
                    onClick={() => updateSetting('excelVersion', ver)}
                    className={`
                      px-4 py-2.5 text-sm font-medium rounded-xl border transition-all flex items-center justify-between
                      ${settings.excelVersion === ver 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}
                    `}
                  >
                    <span>Excel {ver}</span>
                    {settings.excelVersion === ver && <Check className="w-3.5 h-3.5" />}
                  </button>
               ))}
            </div>
            <p className="text-[11px] text-slate-400 px-1">
              * Kodlar seçilen versiyonun özelliklerine göre (örn: XLOOKUP vs VLOOKUP) optimize edilir.
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Language Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
               <Globe className="w-4 h-4 text-emerald-500" />
               Formül Dili
            </label>
            <div className="flex gap-3">
               {LANGUAGES.map((lang) => {
                 const isSelected = settings.language === lang.code;
                 const baseColor = lang.colorClass; 
                 // Note: Dynamic template literals for Tailwind classes like `bg-${color}-50` are risky if not safelisted.
                 // We stick to manual class logic here for safety or use full strings.
                 const activeClasses = baseColor === 'emerald' 
                    ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500/20' 
                    : 'bg-blue-50 border-blue-200 ring-1 ring-blue-500/20';
                 const textActive = baseColor === 'emerald' ? 'text-emerald-700' : 'text-blue-700';
                 const checkColor = baseColor === 'emerald' ? 'text-emerald-600' : 'text-blue-600';

                 return (
                   <button
                      key={lang.code}
                      onClick={() => updateSetting('language', lang.code)}
                      className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                        isSelected ? activeClasses : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                   >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${isSelected ? textActive : 'text-slate-700'}`}>{lang.label}</span>
                        {isSelected && <Check className={`w-4 h-4 ${checkColor}`} />}
                      </div>
                      <div className="text-xs text-slate-500">{lang.desc}</div>
                   </button>
                 );
               })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;