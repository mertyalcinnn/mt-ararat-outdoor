// Revalidate fonksiyonu - önbelleği temizler
export async function revalidatePages() {
  console.log('Sayfalar yeniden oluşturuluyor...');
  try {
    // Revalidasyon API'sini çağır
    const revalidateResponse = await fetch('/api/revalidate', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000) // 5 saniye timeout
    });
    
    if (revalidateResponse.ok) {
      const result = await revalidateResponse.json();
      console.log('Önbellek temizleme başarılı:', result);
      return result;
    } else {
      console.error('Önbellek temizleme başarısız:', revalidateResponse.status);
      
      // Alternatif olarak belirli yolları temizlemeyi dene
      const specificPaths = [
        '/api/revalidate?path=/',
        '/api/revalidate?path=/tr&path=/en&path=/ru',
        '/api/revalidate?path=/tr/activities&path=/en/activities&path=/ru/activities'
      ];
      
      for (const path of specificPaths) {
        try {
          console.log(`Alternatif önbellek temizleme deneniyor: ${path}`);
          const altResponse = await fetch(path, {
            cache: 'no-store',
            signal: AbortSignal.timeout(3000)
          });
          
          if (altResponse.ok) {
            console.log(`Alternatif önbellek temizleme başarılı: ${path}`);
            return await altResponse.json();
          }
        } catch (altError) {
          console.error(`Alternatif önbellek temizleme hatası (${path}):`, altError);
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error('Revalidate hatası:', error);
    return null;
  }
}