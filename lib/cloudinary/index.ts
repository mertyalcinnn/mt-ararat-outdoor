// Cloudinary servisi için entegrasyon
// Bu dosya, yüklenen görselleri Cloudinary'ye yüklememizi sağlar

// Şu paketi kurmanız gerekir: npm install cloudinary next-cloudinary

// cloudinary modülünü yükle
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Cloudinary doğrulaması
export function verifyCloudinaryConfig() {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
  
  const isValid = config.cloud_name && config.api_key && config.api_secret;
  
  console.log('Cloudinary yapılandırması:', {
    cloud_name: config.cloud_name ? '✓ Ayarlanmış' : '✗ Eksik',
    api_key: config.api_key ? '✓ Ayarlanmış' : '✗ Eksik',
    api_secret: config.api_secret ? '✓ Ayarlanmış' : '✗ Eksik',
    isValid
  });
  
  return isValid;
}

// Base64 formatındaki görseli yükle
export async function uploadBase64Image(
  base64String: string,
  folderName: string = 'activities' // Varsayılan olarak activities klasörüne yükle
): Promise<string | null> {
  try {
    if (!base64String) return null;
    
    // base64 formatından veriyi ayıkla
    let imageData = base64String;
    if (base64String.includes('base64,')) {
      imageData = base64String.split('base64,')[1];
    }

    // Cloudinary'ye yükle
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:image/jpeg;base64,${imageData}`,
        {
          folder: folderName,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary yükleme hatası:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    return result.secure_url;
  } catch (error) {
    console.error('Görsel yükleme hatası:', error);
    return null;
  }
}

// Dosya yolu veya URL'den görsel yükle
export async function uploadImage(
  file: any,
  folderName: string = 'activities'
): Promise<string | null> {
  try {
    // Buffer olarak gönderilmiş dosya kontrolü
    if (file && file.buffer) {
      return await uploadBuffer(file.buffer, folderName);
    }
    
    // Base64 gönderilmiş görsel kontrolü
    if (typeof file === 'string' && (file.startsWith('data:') || file.startsWith('/9j/'))) {
      return await uploadBase64Image(file, folderName);
    }
    
    // URL ile gönderilmiş görsel kontrolü
    if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://'))) {
      // Eğer zaten Cloudinary URL'si ise tekrar yükleme
      if (file.includes('cloudinary.com')) {
        return file;
      }
      
      // Harici URL'den yükle
      const result = await cloudinary.uploader.upload(file, {
        folder: folderName,
      });
      return result.secure_url;
    }

    console.warn('Desteklenmeyen dosya formatı:', file);
    return null;
  } catch (error) {
    console.error('Görsel yükleme hatası:', error);
    return null;
  }
}

// Buffer'dan görsel yükle
export async function uploadBuffer(
  buffer: Buffer,
  folderName: string = 'activities'
): Promise<string | null> {
  if (!verifyCloudinaryConfig()) {
    console.error('Cloudinary yapılandırması eksik. Yükleme gerçekleştirilemiyor.');
    return null;
  }

  try {
    // Hata ayıklama için stream kullanımını kontrol et
    if (!buffer || !Buffer.isBuffer(buffer)) {
      console.error('Geçersiz buffer:', buffer);
      return null;
    }
    
    // Buffer boyutunu kontrol et
    console.log(`Buffer boyutu: ${buffer.length} bytes`);
    
    // Promise'ı daha iyi izlemek için
    console.log('Cloudinary yükleme başlatılıyor...');
    
    const uploadPromise = new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary yükleme callback hatası:', error);
            reject(error);
          } else {
            if (!result) {
              console.error('Cloudinary başarılı döndü ama sonuç yok!');
              reject(new Error('Cloudinary sonuç nesnesi boş'));
              return;
            }
            console.log('Cloudinary yükleme başarılı:', result.secure_url);
            resolve(result);
          }
        }
      );
      
      // Stream hata işleyicisi
      uploadStream.on('error', (err) => {
        console.error('Cloudinary upload stream hatası:', err);
        reject(err);
      });
      
      // Buffer'ı stream'e yaz
      try {
        uploadStream.end(buffer);
        console.log('Buffer stream\'e yazıldı');
      } catch (writeError) {
        console.error('Buffer stream\'e yazılırken hata:', writeError);
        reject(writeError);
      }
    });
    
    // Promise'ı çalıştır
    const result = await uploadPromise;
    
    if (!result || !result.secure_url) {
      console.error('Cloudinary geçersiz yanıt:', result);
      return null;
    }

    return result.secure_url;
  } catch (error) {
    console.error('Buffer yükleme hatası (detaylı):', error);
    // Hata stack'i de göster
    if (error instanceof Error && error.stack) {
      console.error('Hata stack:', error.stack);
    }
    return null;
  }
}

// Mevcut görsel URL'lerini güncelle
export async function migrateImageUrls(imageUrls: string[]): Promise<string[]> {
  if (!imageUrls || !Array.isArray(imageUrls)) return [];
  
  const updatedUrls = [];
  
  for (const url of imageUrls) {
    if (!url) continue;
    
    // Eğer zaten Cloudinary URL'si ise tekrar yükleme
    if (url.includes('cloudinary.com')) {
      updatedUrls.push(url);
      continue;
    }
    
    // Yerel dosya yolları Vercel'de çalışmaz, Cloudinary'ye yüklememiz gerekir
    try {
      const cloudinaryUrl = await uploadImage(url);
      if (cloudinaryUrl) {
        updatedUrls.push(cloudinaryUrl);
      }
    } catch (error) {
      console.error(`${url} yüklenirken hata oluştu:`, error);
      // Hata olsa bile orijinal URL'yi koru
      updatedUrls.push(url);
    }
  }
  
  return updatedUrls;
}

export default {
  uploadBase64Image,
  uploadImage,
  uploadBuffer,
  migrateImageUrls,
};
