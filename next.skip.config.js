// next.skip.config.js
/**
 * Bu dosya, statik oluşturma sırasında hangi sayfaların atlanacağını belirtir.
 * Admin paneli gibi sayfalar, statik oluşturulduğunda sorun yaratabilir.
 * Bu sayfalar, çalışma zamanında dinamik olarak oluşturulacak.
 */

module.exports = {
  // Bu yollar statik oluşturma sırasında atlanacak
  skipStaticGeneration: [
    '/admin/**', // Tüm admin sayfaları
    '/api/**',   // Tüm API yolları
    '/_not-found', // 404 sayfası
    '/contact',  // İletişim sayfası
    '/about'     // Hakkımızda sayfası
  ]
};
