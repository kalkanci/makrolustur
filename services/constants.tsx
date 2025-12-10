import { 
    Eraser, FileJson, BarChart, PaintBucket, 
    Search, Sheet, Save, Lock, Eye, List, 
    Filter, Calculator, Mail, Database, ArrowRight, 
    Zap, Type, Layers, Scissors, Calendar, PieChart, 
    Table, Image, Trash2
} from 'lucide-react';
import { AppSettings } from './geminiService';

export const DEFAULT_SETTINGS: AppSettings = {
    excelVersion: '365',
    language: 'TR'
};

export const SUGGESTION_POOL = [
    "A sütunundaki boş satırları sil",
    "Tüm formülleri değere çevir",
    "Sayfayı PDF olarak kaydet",
    "Mükerrer kayıtları kaldır",
    "Sayfa isimlerini listele",
    "Hücre rengi kırmızı olanları topla",
    "Gizli sayfaları göster",
    "İki tarih arasındaki iş günlerini hesapla"
];

// Data for CodeGenerator Sidebar
export const SIDEBAR_TEMPLATES = [
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

// Data for TemplatesView Gallery
export const GALLERY_TEMPLATES = [
    {
        title: "Veri Temizleme & Düzenleme",
        desc: "Karmaşık verileri saniyeler içinde düzenleyin.",
        items: [
            { icon: Eraser, label: "Boş Satırları Sil", prompt: "Aktif sayfadaki A sütunu boş olan tüm satırları bul ve tamamen sil." },
            { icon: Search, label: "Mükerrerleri Kaldır", prompt: "A sütunundaki tekrar eden verileri bul ve satırları tamamen kaldır, sadece benzersizler kalsın." },
            { icon: Scissors, label: "Boşlukları Kırp", prompt: "Seçili alandaki tüm hücrelerin başında ve sonundaki gereksiz boşlukları temizle." },
            { icon: Layers, label: "Birleştirilmişleri Çöz", prompt: "Sayfadaki tüm birleştirilmiş (merged) hücreleri çöz ve değerleri doldur." },
            { icon: Type, label: "Büyük Harfe Çevir", prompt: "Seçili alandaki tüm metinleri BÜYÜK HARF formatına dönüştür." },
            { icon: Eraser, label: "Sayı Olmayanları Sil", prompt: "Seçili sütundaki sayısal olmayan (metin vb.) değerleri temizle." },
            { icon: Zap, label: "Özel Karakter Temizle", prompt: "Hücrelerdeki @, #, $ gibi özel karakterleri ve sembolleri kaldır." },
            { icon: Calendar, label: "Tarih Formatı Düzelt", prompt: "Metin olarak saklanan tarihleri gerçek tarih formatına dönüştür." },
            { icon: Eraser, label: "Biçimlendirmeyi Temizle", prompt: "Seçili alandaki renk, font ve kenarlık gibi tüm biçimlendirmeleri kaldır, saf veri kalsın." },
        ]
    },
    {
        title: "Dosya & Sayfa Yönetimi",
        desc: "Excel dosyalarını ve sayfalarını yönetin.",
        items: [
            { icon: FileJson, label: "PDF Olarak Kaydet", prompt: "Aktif sayfayı masaüstüne bugünün tarihiyle isimlendirilmiş bir PDF dosyası olarak kaydet." },
            { icon: List, label: "Sayfaları Listele", prompt: "Yeni bir 'Index' sayfası oluştur ve kitaptaki tüm sayfaların isimlerini linkli (hyperlink) olarak listele." },
            { icon: Save, label: "Sayfaları Ayrı Kaydet", prompt: "Bu kitaptaki her bir çalışma sayfasını, kendi isminde ayrı birer Excel dosyası (.xlsx) olarak masaüstüne kaydet." },
            { icon: Lock, label: "Tüm Sayfaları Koru", prompt: "Kitaptaki tüm sayfaları '1234' şifresi ile korumaya al (Protect)." },
            { icon: Eye, label: "Gizli Sayfaları Göster", prompt: "Kitaptaki gizli olan tüm sayfaları görünür hale getir." },
            { icon: Sheet, label: "Alfabetik Sırala", prompt: "Çalışma kitabındaki sayfaları isimlerine göre alfabetik olarak sırala." },
            { icon: Save, label: "Yedek Al (Backup)", prompt: "Aktif dosyanın bir yedeğini 'Yedek_Tarih' ismiyle aynı klasöre kaydet." },
            { icon: Trash2, label: "Boş Sayfaları Sil", prompt: "İçinde hiç veri olmayan tamamen boş sayfaları bul ve sil." },
        ]
    },
    {
        title: "Analiz & Raporlama",
        desc: "Veri analizi ve raporlama araçları.",
        items: [
            { icon: BarChart, label: "Pivot Tablo Oluştur", prompt: "A1'den başlayan verileri kullanarak yeni bir sayfada özet bir Pivot Tablo oluştur." },
            { icon: Filter, label: "Otomatik Filtrele", prompt: "Tablo başlıklarına otomatik filtre ekle ve ilk sütuna göre A'dan Z'ye sırala." },
            { icon: Calculator, label: "Alt Toplam Al", prompt: "Seçili sayısal sütunun altına otomatik olarak toplam formülü ekle." },
            { icon: Search, label: "Düşeyara ile Birleştir", prompt: "Sayfa2'den verileri DÜŞEYARA (VLOOKUP) kullanarak Sayfa1'e eşleştir ve getir." },
            { icon: Zap, label: "Benzersizleri Say", prompt: "A sütunundaki benzersiz (unique) değerlerin sayısını hesapla ve B1'e yaz." },
            { icon: Mail, label: "Raporu Mail At", prompt: "Seçili alanı HTML formatında gövdeye ekleyerek Outlook üzerinden yeni bir e-posta oluştur." },
            { icon: Database, label: "Formülü Değere Çevir", prompt: "Tüm sayfadaki formülleri kaldır ve sadece hesaplanmış değerlerini (Values) bırak." },
            { icon: ArrowRight, label: "Veri Karşılaştır", prompt: "A ve B sütunlarını karşılaştır, farklı olan değerleri kırmızı ile boya." },
        ]
    },
    {
        title: "Görselleştirme & Sistem",
        desc: "Görünüm ayarları ve sistem makroları.",
        items: [
            { icon: PaintBucket, label: "Zebra Boyama", prompt: "Tablodaki satırları okunabilirliği artırmak için birer atlayarak açık gri renge boya." },
            { icon: Table, label: "Kenarlık Ekle", prompt: "Dolu olan veri aralığının tamamına ince siyah kenarlıklar ekle." },
            { icon: Calculator, label: "Otomatik Sığdır", prompt: "Tüm sayfadaki sütun genişliklerini içeriklerine göre otomatik ayarla (AutoFit)." },
            { icon: PaintBucket, label: "Hataları İşaretle", prompt: "Sayfada hata değeri içeren (#N/A, #VALUE! vb.) hücrelerin arka planını kırmızı yap." },
            { icon: PieChart, label: "Grafik Oluştur", prompt: "Seçili verilerden otomatik bir Sütun Grafiği oluştur ve yanına yerleştir." },
            { icon: Lock, label: "Başlıkları Dondur", prompt: "İlk satırı (başlıkları) dondur (Freeze Panes) böylece kaydırınca sabit kalsın." },
            { icon: Zap, label: "Hesaplama Modu", prompt: "Excel hesaplama modunu Manüel yap (Hız için) veya Otomatik yap." },
            { icon: Image, label: "Resim Olarak Kopyala", prompt: "Seçili alanı resim olarak panoya kopyala." },
        ]
    }
];