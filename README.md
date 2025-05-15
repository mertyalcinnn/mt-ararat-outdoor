# Mt. Ararat Outdoor Adventures

Bu proje, Mt. Ararat (Ağrı Dağı) bölgesinde outdoor aktiviteler düzenleyen bir şirket için Next.js kullanılarak geliştirilen bir web sitesidir.

## Özellikler

- Next.js 14 App Router yapısı
- Çoklu dil desteği (Türkçe, İngilizce, Rusça)
- MongoDB veritabanı entegrasyonu
- Cloudinary ve Cloudflare R2 görsel depolama desteği
- Responsive tasarım (Tailwind CSS)
- Admin paneli
- Markdown içerik desteği
- SEO optimizasyonu

## Kurulum

### Gereksinimler

- Node.js 18+
- MongoDB veritabanı (veya MongoDB Atlas)
- Cloudinary hesabı (ücretsiz plan yeterli) veya Cloudflare R2 hesabı

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
   - `NEXT_PUBLIC_SITE_URL`: Deploy edilmiş sitenizin tam URL'si

   Cloudinary kullanımı için:

   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud adı
   - `CLOUDINARY_API_KEY`: Cloudinary API anahtarı
   - `CLOUDINARY_API_SECRET`: Cloudinary API gizli anahtarı

   Cloudflare R2 kullanımı için:

   - `USE_R2_STORAGE`: `true` olarak ayarlayın
   - `R2_ACCESS_KEY`: Cloudflare R2 erişim anahtarı
   - `R2_SECRET_KEY`: Cloudflare R2 gizli anahtarı
   - `R2_ENDPOINT`: Cloudflare R2 endpoint URL'si
   - `R2_BUCKET_NAME`: Cloudflare R2 bucket adı
   - `R2_PUBLIC_URL`: Cloudflare R2 bucket'ın public URL'si

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

## Görsel Depolama Entegrasyonu

Görsel yükleme ve depolama için iki farklı seçenek sunulmaktadır:

### Cloudinary Entegrasyonu

Görsel yükleme işlemleri için Cloudinary entegre edilmiştir. Vercel'de çalışırken dosya sistemi erişimi sınırlı olduğundan, tüm görsel yükleme ve yönetim işlemleri Cloudinary üzerinden gerçekleştirilebilir.

### Cloudflare R2 Entegrasyonu

Cloudinary'ye alternatif olarak, Cloudflare R2 desteği eklenmiştir. R2, S3 uyumlu API'leri destekleyen, maliyet etkin bir depolama çözümüdür. Vercel'in salt okunur dosya sistemi kısıtlaması nedeniyle, üretim ortamında görsel yükleme işlemleri R2 üzerinden gerçekleştirilebilir.

Cloudflare R2 kullanmak için:

1. Cloudflare hesabında bir R2 bucket oluşturun
2. Access Key ve Secret Key oluşturun
3. `.env.local` veya Vercel ortam değişkenlerinde gerekli bilgileri ayarlayın
4. `USE_R2_STORAGE` değişkenini `true` olarak ayarlayın

Yerel geliştirme ortamında, depolama kimlik bilgileri ayarlanmamışsa, dosya sistemi kullanılmaya devam eder.

## Admin Paneli

Admin paneline `/admin` adresinden erişilebilir. Giriş bilgileri `.env.local` dosyasında ayarlanabilir.

Admin paneli özellikleri:

- Aktivite ekleme/düzenleme/silme
- Görsel yükleme ve yönetim
- Site içeriklerini düzenleme

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
