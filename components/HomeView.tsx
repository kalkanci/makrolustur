import React from 'react';
import { 
  Plus, Clock, Star, ArrowRight, 
  FileSpreadsheet, Zap, LayoutTemplate 
} from 'lucide-react';
import WeatherDisplay from './WeatherDisplay';

interface HomeViewProps {
  onNavigate: (prompt: string) => void;
  onViewChange: (view: any) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onViewChange }) => {
  
  const recentFiles = [
    { name: "Yıllık_Bütçe_Makrosu.bas", date: "2 saat önce", type: "Makro" },
    { name: "Müşteri_Listesi_Temizleme.bas", date: "Dün", type: "Makro" },
    { name: "Satış_Analizi_Formülü.txt", date: "Geçen Hafta", type: "Formül" },
  ];

  const quickActions = [
    { 
      title: "Boş Makro Oluştur", 
      icon: <Plus className="w-6 h-6 text-[#107C41]" />, 
      bg: "bg-emerald-50", 
      prompt: " ", // Empty prompt resets the generator
      desc: "Sıfırdan yeni bir proje başlatın."
    },
    { 
      title: "Veri Temizle", 
      icon: <Zap className="w-6 h-6 text-blue-600" />, 
      bg: "bg-blue-50", 
      prompt: "Seçili alandaki boş satırları sil, mükerrer kayıtları kaldır ve baştaki/sondaki boşlukları (trim) temizle.",
      desc: "Hızlı veri temizleme otomasyonu."
    },
    { 
      title: "PDF Dönüştürücü", 
      icon: <FileSpreadsheet className="w-6 h-6 text-orange-600" />, 
      bg: "bg-orange-50", 
      prompt: "Aktif sayfayı masaüstüne PDF olarak kaydet, dosya adı bugünün tarihi olsun.",
      desc: "Sayfayı anında PDF yapın."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. WELCOME HERO */}
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <div>
           <h1 className="text-3xl font-light text-slate-800 mb-2">Günaydın, <span className="font-semibold text-[#107C41]">Geliştirici</span></h1>
           <p className="text-slate-500">Bugün Excel'de neyi otomatize etmek istiyorsunuz?</p>
        </div>
        <div className="hidden md:block">
           <p className="text-xs text-right text-slate-400 mb-1">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* 2. QUICK ACTIONS (TOP ROW) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {quickActions.map((action, idx) => (
           <button 
             key={idx}
             onClick={() => onNavigate(action.prompt)}
             className="flex flex-col items-start p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#107C41] hover:shadow-md transition-all group text-left"
           >
              <div className={`p-3 rounded-lg ${action.bg} mb-4 group-hover:scale-110 transition-transform`}>
                 {action.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">{action.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{action.desc}</p>
              <span className="mt-auto text-xs font-semibold text-[#107C41] flex items-center gap-1 group-hover:gap-2 transition-all">
                 Oluştur <ArrowRight className="w-3 h-3" />
              </span>
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. RECENT FILES (LEFT COLUMN) */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-slate-400" />
                 Son Kullanılanlar
              </h2>
              <button className="text-xs text-[#107C41] hover:underline">Tümünü Gör</button>
           </div>
           
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {recentFiles.map((file, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-[#107C41]/10 rounded flex items-center justify-center text-[#107C41]">
                          <FileSpreadsheet className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="font-medium text-slate-800 group-hover:text-[#107C41] transition-colors">{file.name}</h4>
                          <p className="text-xs text-slate-400">{file.type} • {file.date}</p>
                       </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-slate-600">
                       <Star className="w-4 h-4" />
                    </button>
                 </div>
              ))}
              <div 
                onClick={() => onViewChange('templates')}
                className="p-3 bg-slate-50 text-center text-xs text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors border-t border-slate-100 flex items-center justify-center gap-2"
              >
                 <LayoutTemplate className="w-3 h-3" />
                 Daha fazla şablon için galeriye git
              </div>
           </div>
        </div>

        {/* 4. WIDGETS (RIGHT COLUMN) */}
        <div className="space-y-6">
           {/* Weather Widget Integrated */}
           <WeatherDisplay />
           
           {/* Pro Tip Widget */}
           <div className="bg-gradient-to-br from-[#107C41] to-emerald-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">İpucu</h3>
              <p className="text-emerald-100 text-sm mb-4 relative z-10">
                 Makroları çalıştırmadan önce mutlaka dosyanızın yedeğini alın. AI kodları mükemmel olsa da, geri alınamayan işlemler (silme gibi) içerebilir.
              </p>
              <button onClick={() => onNavigate("Yedek alma makrosu yaz")} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors backdrop-blur-sm relative z-10 border border-white/10">
                 Yedekleme Makrosu Yaz
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default HomeView;