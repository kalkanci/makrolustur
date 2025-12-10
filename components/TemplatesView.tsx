import React from 'react';
import { ArrowRight, List } from 'lucide-react';
import { GALLERY_TEMPLATES } from '../services/constants';

interface TemplatesViewProps {
  onSelectTemplate: (prompt: string) => void;
}

const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
       {/* Header Section */}
       <div className="flex items-center gap-4 py-4 border-b border-slate-200">
          <div className="bg-emerald-100 p-2 rounded-lg">
             <List className="w-6 h-6 text-[#107C41]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hızlı Başlangıç Şablonları</h2>
            <p className="text-sm text-slate-500">Sık kullanılan işlemleri tek tıkla kodlayın.</p>
          </div>
       </div>

       {/* Templates Grid */}
       <div className="grid grid-cols-1 gap-12">
          {GALLERY_TEMPLATES.map((category, idx) => (
             <div key={idx}>
                <div className="flex items-center gap-3 mb-5">
                   <h3 className="text-lg font-bold text-slate-700">{category.title}</h3>
                   <span className="h-px flex-1 bg-slate-200"></span>
                   <span className="text-xs text-slate-400 font-medium">{category.desc}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   {category.items.map((item, i) => (
                      <button 
                         key={i}
                         onClick={() => onSelectTemplate(item.prompt)}
                         className="group bg-white p-4 rounded-lg border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-[#107C41]/50 transition-all text-left flex flex-col h-full relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-4 h-4 text-[#107C41]" />
                         </div>
                         
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#107C41] group-hover:text-white transition-colors">
                                <item.icon className="w-4 h-4" />
                            </div>
                            <h4 className="font-semibold text-slate-700 text-sm group-hover:text-[#107C41] transition-colors">{item.label}</h4>
                         </div>
                         
                         <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {item.prompt}
                         </p>
                      </button>
                   ))}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default TemplatesView;