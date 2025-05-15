// Cloudinary servisi için entegrasyon
// Bu dosya, yüklenen görselleri Cloudinary'ye yüklememizi sağlar

// Şu paketi kurmanız gerekir: npm install cloudinary next-cloudinary

// cloudinary modülünü yükle
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary buffer yükleme hatası:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Buffer yükleme hatası:', error);
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
