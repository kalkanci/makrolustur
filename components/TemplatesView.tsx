import React from 'react';
import { 
  Eraser, Search, FileText, FileJson, Sheet, Save, 
  Lock, PaintBucket, Table, Calculator, 
  RefreshCw, Mail, Database, BarChart,
  ArrowRight, Filter, Eye, Zap, Type, Layers,
  Scissors, Calendar, PieChart, Image, Link, List
} from 'lucide-react';

interface TemplatesViewProps {
  onSelectTemplate: (prompt: string) => void;
}

const TEMPLATE_CATEGORIES = [
  {
    title: "Veri Temizleme & Düzenleme",
    desc: "Karmaşık verileri saniyeler içinde düzenleyin.",
    items: [
      { icon: <Eraser />, label: "Boş Satırları Sil", prompt: "Aktif sayfadaki A sütunu boş olan tüm satırları bul ve tamamen sil." },
      { icon: <Search />, label: "Mükerrerleri Kaldır", prompt: "A sütunundaki tekrar eden verileri bul ve satırları tamamen kaldır, sadece benzersizler kalsın." },
      { icon: <Scissors />, label: "Boşlukları Kırp", prompt: "Seçili alandaki tüm hücrelerin başında ve sonundaki gereksiz boşlukları temizle." },
      { icon: <Layers />, label: "Birleştirilmişleri Çöz", prompt: "Sayfadaki tüm birleştirilmiş (merged) hücreleri çöz ve değerleri doldur." },
      { icon: <Type />, label: "Büyük Harfe Çevir", prompt: "Seçili alandaki tüm metinleri BÜYÜK HARF formatına dönüştür." },
      { icon: <Eraser />, label: "Sayı Olmayanları Sil", prompt: "Seçili sütundaki sayısal olmayan (metin vb.) değerleri temizle." },
      { icon: <Zap />, label: "Özel Karakter Temizle", prompt: "Hücrelerdeki @, #, $ gibi özel karakterleri ve sembolleri kaldır." },
      { icon: <Calendar />, label: "Tarih Formatı Düzelt", prompt: "Metin olarak saklanan tarihleri gerçek tarih formatına dönüştür." },
      { icon: <Eraser />, label: "Biçimlendirmeyi Temizle", prompt: "Seçili alandaki renk, font ve kenarlık gibi tüm biçimlendirmeleri kaldır, saf veri kalsın." },
    ]
  },
  {
    title: "Dosya & Sayfa Yönetimi",
    desc: "Excel dosyalarını ve sayfalarını yönetin.",
    items: [
      { icon: <FileJson />, label: "PDF Olarak Kaydet", prompt: "Aktif sayfayı masaüstüne bugünün tarihiyle isimlendirilmiş bir PDF dosyası olarak kaydet." },
      { icon: <List />, label: "Sayfaları Listele", prompt: "Yeni bir 'Index' sayfası oluştur ve kitaptaki tüm sayfaların isimlerini linkli (hyperlink) olarak listele." },
      { icon: <Save />, label: "Sayfaları Ayrı Kaydet", prompt: "Bu kitaptaki her bir çalışma sayfasını, kendi isminde ayrı birer Excel dosyası (.xlsx) olarak masaüstüne kaydet." },
      { icon: <Lock />, label: "Tüm Sayfaları Koru", prompt: "Kitaptaki tüm sayfaları '1234' şifresi ile korumaya al (Protect)." },
      { icon: <Eye />, label: "Gizli Sayfaları Göster", prompt: "Kitaptaki gizli olan tüm sayfaları görünür hale getir." },
      { icon: <Sheet />, label: "Alfabetik Sırala", prompt: "Çalışma kitabındaki sayfaları isimlerine göre alfabetik olarak sırala." },
      { icon: <Save />, label: "Yedek Al (Backup)", prompt: "Aktif dosyanın bir yedeğini 'Yedek_Tarih' ismiyle aynı klasöre kaydet." },
      { icon: <Trash2Icon />, label: "Boş Sayfaları Sil", prompt: "İçinde hiç veri olmayan tamamen boş sayfaları bul ve sil." },
    ]
  },
  {
    title: "Analiz & Raporlama",
    desc: "Veri analizi ve raporlama araçları.",
    items: [
      { icon: <BarChart />, label: "Pivot Tablo Oluştur", prompt: "A1'den başlayan verileri kullanarak yeni bir sayfada özet bir Pivot Tablo oluştur." },
      { icon: <Filter />, label: "Otomatik Filtrele", prompt: "Tablo başlıklarına otomatik filtre ekle ve ilk sütuna göre A'dan Z'ye sırala." },
      { icon: <Calculator />, label: "Alt Toplam Al", prompt: "Seçili sayısal sütunun altına otomatik olarak toplam formülü ekle." },
      { icon: <Search />, label: "Düşeyara ile Birleştir", prompt: "Sayfa2'den verileri DÜŞEYARA (VLOOKUP) kullanarak Sayfa1'e eşleştir ve getir." },
      { icon: <Zap />, label: "Benzersizleri Say", prompt: "A sütunundaki benzersiz (unique) değerlerin sayısını hesapla ve B1'e yaz." },
      { icon: <Mail />, label: "Raporu Mail At", prompt: "Seçili alanı HTML formatında gövdeye ekleyerek Outlook üzerinden yeni bir e-posta oluştur." },
      { icon: <Database />, label: "Formülü Değere Çevir", prompt: "Tüm sayfadaki formülleri kaldır ve sadece hesaplanmış değerlerini (Values) bırak." },
      { icon: <ArrowRight />, label: "Veri Karşılaştır", prompt: "A ve B sütunlarını karşılaştır, farklı olan değerleri kırmızı ile boya." },
    ]
  },
  {
    title: "Görselleştirme & Sistem",
    desc: "Görünüm ayarları ve sistem makroları.",
    items: [
      { icon: <PaintBucket />, label: "Zebra Boyama", prompt: "Tablodaki satırları okunabilirliği artırmak için birer atlayarak açık gri renge boya." },
      { icon: <Table />, label: "Kenarlık Ekle", prompt: "Dolu olan veri aralığının tamamına ince siyah kenarlıklar ekle." },
      { icon: <Calculator />, label: "Otomatik Sığdır", prompt: "Tüm sayfadaki sütun genişliklerini içeriklerine göre otomatik ayarla (AutoFit)." },
      { icon: <PaintBucket />, label: "Hataları İşaretle", prompt: "Sayfada hata değeri içeren (#N/A, #VALUE! vb.) hücrelerin arka planını kırmızı yap." },
      { icon: <PieChart />, label: "Grafik Oluştur", prompt: "Seçili verilerden otomatik bir Sütun Grafiği oluştur ve yanına yerleştir." },
      { icon: <Lock />, label: "Başlıkları Dondur", prompt: "İlk satırı (başlıkları) dondur (Freeze Panes) böylece kaydırınca sabit kalsın." },
      { icon: <Zap />, label: "Hesaplama Modu", prompt: "Excel hesaplama modunu Manüel yap (Hız için) veya Otomatik yap." },
      { icon: <Image />, label: "Resim Olarak Kopyala", prompt: "Seçili alanı resim olarak panoya kopyala." },
    ]
  }
];

// Helper icon
function Trash2Icon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
}

const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
       <div className="flex items-center gap-4 py-4 border-b border-slate-200">
          <div className="bg-emerald-100 p-2 rounded-lg">
             <List className="w-6 h-6 text-[#107C41]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Hızlı Başlangıç Şablonları</h2>
            <p className="text-sm text-slate-500">Sık kullanılan işlemleri tek tıkla kodlayın.</p>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-12">
          {TEMPLATE_CATEGORIES.map((category, idx) => (
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
                                {React.cloneElement(item.icon as React.ReactElement, { className: "w-4 h-4" })}
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