# Mt. Ararat Outdoor Adventures

Bu proje, Mt. Ararat (Ağrı Dağı) bölgesinde outdoor aktiviteler düzenleyen bir şirket için Next.js kullanılarak geliştirilen bir web sitesidir.

## Özellikler

- Next.js 14 App Router yapısı
- Çoklu dil desteği (Türkçe, İngilizce, Rusça)
- MongoDB veritabanı entegrasyonu
- Cloudinary görsel yükleme ve yönetimi
- Responsive tasarım (Tailwind CSS)
- Admin paneli
- Markdown içerik desteği
- SEO optimizasyonu

## Kurulum

### Gereksinimler

- Node.js 18+
- MongoDB veritabanı (veya MongoDB Atlas)
- Cloudinary hesabı (ücretsiz plan yeterli)

### Kurulum Adımları

1. Repo'yu klonlayın
   ```
   git clone https://github.com/yourusername/mt-ararat-outdoor.git
   cd mt-ararat-outdoor
   ```

2. Bağımlılıkları yükleyin
   ```
   npm install
   ```

3. `.env.example` dosyasını `.env.local` olarak kopyalayın ve gerekli bilgileri doldurun
   ```
   cp .env.example .env.local
   ```

4. Yerel geliştirme sunucusunu başlatın
   ```
   npm run dev
   ```

## Vercel Dağıtımı

Bu proje Vercel'e dağıtım için optimize edilmiştir. Vercel'de başarıyla çalışması için aşağıdaki adımları izleyin:

1. Vercel'e bir proje olarak deploy edin
2. Aşağıdaki ortam değişkenlerini Vercel'de ayarlayın:
   - `MONGODB_URI`: MongoDB bağlantı adresi
   - `MONGODB_DB`: Veritabanı adı 
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud adı
   - `CLOUDINARY_API_KEY`: Cloudinary API anahtarı
   - `CLOUDINARY_API_SECRET`: Cloudinary API gizli anahtarı
   - `NEXT_PUBLIC_SITE_URL`: Deploy edilmiş sitenizin tam URL'si

## Yapı

- `/app`: Next.js 14 App router yapısı ile sayfa bileşenleri
- `/app/[lang]`: Dil bazlı route yapısı
- `/app/api`: API endpoint'leri
- `/app/admin`: Admin paneli
- `/components`: Yeniden kullanılabilir React bileşenleri
- `/lib`: Yardımcı fonksiyonlar ve veri işleme mantığı
- `/public`: Statik dosyalar
- `/activities`: Aktivite içerikleri (JSON)
- `/dictionaries`: Dil çevirileri

## Cloudinary Entegrasyonu

Görsel yükleme işlemleri için Cloudinary entegre edilmiştir. Vercel'de çalışırken dosya sistemi erişimi sınırlı olduğundan, tüm görsel yükleme ve yönetim işlemleri Cloudinary üzerinden gerçekleştirilir.

Yerel geliştirme ortamında, Cloudinary kimlik bilgileri ayarlanmamışsa, dosya sistemi kullanılmaya devam eder.

## Admin Paneli

Admin paneline `/admin` adresinden erişilebilir. Giriş bilgileri `.env.local` dosyasında ayarlanabilir.

Admin paneli özellikleri:
- Aktivite ekleme/düzenleme/silme
- Görsel yükleme ve yönetim
- Site içeriklerini düzenleme

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
