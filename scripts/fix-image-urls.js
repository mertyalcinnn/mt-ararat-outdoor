/**
 * Bu script, tüm aktivite dosyalarındaki localhost referanslarını temizler
 * Bu sayede canlı ortamda localhost referanslarından kaynaklanan sorunlar çözülür
 */

const fs = require('fs');
const path = require('path');

// Fonksiyon: Bir URL'yi düzeltir ve localhost referanslarını çıkarır
function fixImageUrl(url) {
  if (!url) return url;
  
  // localhost referanslarını temizle
  if (url.includes('localhost')) {
    return url.replace(/^https?:\/\/localhost:[0-9]+/, '');
  }
  
  return url;
}

console.log('Aktivite dosyalarındaki görsel URL\'leri düzeltiliyor...');

// 1. Ana aktivite dosyalarını düzelt (kök dizindeki)
try {
  const activityFiles = fs.readdirSync(path.join(process.cwd(), 'activities'));
  let fixedCount = 0;
  
  activityFiles.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(process.cwd(), 'activities', file);
      const content = fs.readFileSync(filePath, 'utf8');
      let data;
      
      try {
        data = JSON.parse(content);
      } catch (err) {
        console.error(`${file} JSON olarak ayrıştırılamadı:`, err.message);
        return;
      }
      
      let hasChanges = false;
      
      // coverImage'yi düzelt
      if (data.coverImage && data.coverImage.includes('localhost')) {
        data.coverImage = fixImageUrl(data.coverImage);
        hasChanges = true;
      }
      
      // gallery görsellerini düzelt
      if (data.gallery && Array.isArray(data.gallery)) {
        const originalGallery = [...data.gallery];
        data.gallery = data.gallery.map(url => fixImageUrl(url));
        
        // Değişiklik olup olmadığını kontrol et
        if (JSON.stringify(originalGallery) !== JSON.stringify(data.gallery)) {
          hasChanges = true;
        }
      }
      
      // Değişiklikler varsa dosyayı kaydet
      if (hasChanges) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        fixedCount++;
        console.log(`- ${file} dosyası düzeltildi`);
      }
    }
  });
  
  console.log(`Toplam ${fixedCount} aktivite dosyası düzeltildi.`);
} catch (err) {
  console.error('Ana aktivite dizini işlenirken hata:', err);
}

// 2. data/activities dizinindeki yedek dosyaları düzelt
try {
  const dataActivityDir = path.join(process.cwd(), 'data', 'activities');
  
  if (fs.existsSync(dataActivityDir)) {
    const dataActivityFiles = fs.readdirSync(dataActivityDir);
    let fixedDataCount = 0;
    
    dataActivityFiles.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataActivityDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        let data;
        
        try {
          data = JSON.parse(content);
        } catch (err) {
          console.error(`${file} JSON olarak ayrıştırılamadı:`, err.message);
          return;
        }
        
        let hasChanges = false;
        
        // coverImage'yi düzelt
        if (data.coverImage && data.coverImage.includes('localhost')) {
          data.coverImage = fixImageUrl(data.coverImage);
          hasChanges = true;
        }
        
        // gallery görsellerini düzelt
        if (data.gallery && Array.isArray(data.gallery)) {
          const originalGallery = [...data.gallery];
          data.gallery = data.gallery.map(url => fixImageUrl(url));
          
          // Değişiklik olup olmadığını kontrol et
          if (JSON.stringify(originalGallery) !== JSON.stringify(data.gallery)) {
            hasChanges = true;
          }
        }
        
        // Değişiklikler varsa dosyayı kaydet
        if (hasChanges) {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
          fixedDataCount++;
          console.log(`- data/activities/${file} dosyası düzeltildi`);
        }
      }
    });
    
    console.log(`Toplam ${fixedDataCount} data/activities/ dosyası düzeltildi.`);
  } else {
    console.log('data/activities dizini bulunamadı, atlanıyor.');
  }
} catch (err) {
  console.error('data/activities dizini işlenirken hata:', err);
}

console.log('URL temizleme işlemi tamamlandı!');
