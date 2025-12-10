import React from 'react';
import { 
  Eraser, Search, FileText, FileJson, Sheet, Save, 
  Lock, Unlock, Eye, PaintBucket, Table, Calculator, 
  RefreshCw, Mail, Database, BarChart, EyeOff, BookOpen,
  ArrowRight
} from 'lucide-react';

interface TemplatesViewProps {
  onSelectTemplate: (prompt: string) => void;
}

// Reusing the data structure but formatted for a full page view
const TEMPLATE_CATEGORIES = [
  {
    title: "Veri Temizleme",
    desc: "Karmaşık verileri saniyeler içinde düzenleyin.",
    items: [
      { icon: <Eraser />, label: "Boş Satırları Sil", prompt: "Aktif sayfadaki A sütunu boş olan tüm satırları bul ve tamamen sil." },
      { icon: <Search />, label: "Mükerrerleri Kaldır", prompt: "A sütunundaki tekrar eden verileri bul ve satırları tamamen kaldır, sadece benzersizler kalsın." },
      { icon: <FileText />, label: "Boşlukları Kırp", prompt: "Seçili alandaki tüm hücrelerin başında ve sonundaki gereksiz boşlukları temizle." },
      { icon: <Eraser />, label: "Birleştirilmişleri Çöz", prompt: "Sayfadaki tüm birleştirilmiş (merged) hücreleri çöz ve değerleri doldur." },
    ]
  },
  {
    title: "Dosya Yönetimi",
    desc: "Excel dosyalarını ve sayfalarını yönetin.",
    items: [
      { icon: <FileJson />, label: "PDF Olarak Kaydet", prompt: "Aktif sayfayı masaüstüne bugünün tarihiyle isimlendirilmiş bir PDF dosyası olarak kaydet." },
      { icon: <Sheet />, label: "Sayfaları Listele", prompt: "Yeni bir 'Index' sayfası oluştur ve kitaptaki tüm sayfaların isimlerini linkli (hyperlink) olarak listele." },
      { icon: <Save />, label: "Sayfaları Ayrı Kaydet", prompt: "Bu kitaptaki her bir çalışma sayfasını, kendi isminde ayrı birer Excel dosyası (.xlsx) olarak masaüstüne kaydet." },
      { icon: <Lock />, label: "Tüm Sayfaları Koru", prompt: "Kitaptaki tüm sayfaları '1234' şifresi ile korumaya al (Protect)." },
    ]
  },
  {
    title: "Görselleştirme",
    desc: "Raporlarınızı daha okunabilir hale getirin.",
    items: [
      { icon: <PaintBucket />, label: "Zebra Boyama", prompt: "Tablodaki satırları okunabilirliği artırmak için birer atlayarak açık gri renge boya." },
      { icon: <Table />, label: "Kenarlık Ekle", prompt: "Dolu olan veri aralığının tamamına ince siyah kenarlıklar ekle." },
      { icon: <Calculator />, label: "Otomatik Sığdır", prompt: "Tüm sayfadaki sütun genişliklerini içeriklerine göre otomatik ayarla (AutoFit)." },
      { icon: <PaintBucket />, label: "Hataları İşaretle", prompt: "Sayfada hata değeri içeren (#N/A, #VALUE! vb.) hücrelerin arka planını kırmızı yap." },
    ]
  },
  {
    title: "İleri Düzey",
    desc: "Dış veri kaynakları ve karmaşık işlemler.",
    items: [
      { icon: <RefreshCw />, label: "Döviz Kuru Çek", prompt: "Google Finance veya bir XML kaynağından güncel USD/TL kurunu çekip A1 hücresine yazan makro." },
      { icon: <Mail />, label: "Raporu Mail At", prompt: "Seçili alanı HTML formatında gövdeye ekleyerek Outlook üzerinden yeni bir e-posta oluştur." },
      { icon: <Database />, label: "Formülü Değere Çevir", prompt: "Tüm sayfadaki formülleri kaldır ve sadece hesaplanmış değerlerini (Values) bırak." },
      { icon: <BarChart />, label: "Pivot Tablo", prompt: "A1'den başlayan verileri kullanarak yeni bir sayfada özet bir Pivot Tablo oluştur." },
    ]
  }
];

const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Şablon Galerisi</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
             İhtiyacınız olan senaryoyu seçin, yapay zeka sizin için kodunu veya formülünü anında oluştursun.
          </p>
       </div>

       <div className="grid grid-cols-1 gap-10">
          {TEMPLATE_CATEGORIES.map((category, idx) => (
             <div key={idx}>
                <div className="flex items-center gap-3 mb-4 px-2">
                   <div className="w-1 h-6 bg-[#107C41] rounded-full"></div>
                   <div>
                      <h2 className="text-xl font-bold text-slate-800">{category.title}</h2>
                      <p className="text-xs text-slate-400">{category.desc}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {category.items.map((item, i) => (
                      <button 
                         key={i}
                         onClick={() => onSelectTemplate(item.prompt)}
                         className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#107C41] transition-all text-left flex flex-col h-full"
                      >
                         <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#107C41] group-hover:text-white transition-colors mb-4">
                            {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5" })}
                         </div>
                         <h3 className="font-bold text-slate-800 mb-2 group-hover:text-[#107C41] transition-colors">{item.label}</h3>
                         <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">
                            {item.prompt}
                         </p>
                         <div className="pt-3 border-t border-slate-50 flex items-center text-xs font-semibold text-slate-400 group-hover:text-[#107C41] transition-colors mt-auto">
                            Kullan <ArrowRight className="w-3 h-3 ml-1" />
                         </div>
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