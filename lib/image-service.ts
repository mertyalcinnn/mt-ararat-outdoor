/**
 * Görsel yükleme ve yönetim servisi
 * Bu dosya, yüklenen görselleri işleyip doğru konumlara kaydetmekten sorumludur.
 * Vercel ortamında, görseller doğrudan Vercel CDN üzerinden sunulur.
 */

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// Benzersiz ID oluşturma
export function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Dosya yolu sabitleyici
export function sanitizeFilename(filename: string): string {
  // Özel karakterleri, boşlukları ve Türkçe karakterleri düzelt
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '-') // Güvenli olmayan karakterleri kaldır
    .replace(/\s+/g, '-')            // Boşlukları tire ile değiştir
    .toLowerCase();                   // Küçük harfe çevir
}

/**
 * Görsel yükleme fonksiyonu
 * @param buffer Görsel içeriği
 * @param originalFilename Orijinal dosya adı
 * @returns Görsel URL'i
 */
export async function uploadImage(buffer: Buffer, originalFilename: string): Promise<string> {
  try {
    // Dizin kontrolü ve doğrulama
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Dizin yoksa oluştur
    try {
      await fs.promises.access(uploadDir);
    } catch (err) {
      console.log('Uploads dizini oluşturuluyor...');
      await mkdir(uploadDir, { recursive: true });
    }

    // Dosya adını güvenli hale getir ve benzersiz olmasını sağla
    const safeFilename = sanitizeFilename(originalFilename);
    const fileExtension = path.extname(safeFilename);
    const uniqueFilename = `${generateUniqueId()}${fileExtension}`;
    
    // Dosya yolu
    const filePath = path.join(uploadDir, uniqueFilename);
    
    console.log(`Görsel kaydediliyor: ${filePath}`);
    
    // Dosyayı yaz
    await writeFile(filePath, buffer);
    
    // Görsel URL'ini döndür (kök dizinden itibaren göreceli yol)
    const imageUrl = `/uploads/${uniqueFilename}`;
    
    console.log(`Görsel başarıyla kaydedildi, URL: ${imageUrl}`);
    
    return imageUrl;
  } catch (error) {
    console.error('Görsel yükleme hatası:', error);
    throw new Error(`Görsel yüklenirken hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * URL görseli döndürme
 * @param url Orijinal URL
 * @returns Optimize edilmiş görsel URL'i
 */
export function getOptimizedImageUrl(url: string): string {
  if (!url) return '';
  
  // URL zaten tam ise (http:// veya https:// ile başlıyorsa) aynen kullan
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // URL göreli ise (/ ile başlıyorsa) doğru formatla
  if (url.startsWith('/')) {
    // Dil kodlarını kaldır (örn. /tr/uploads/ -> /uploads/)
    if (url.match(/^\/[a-z]{2}\/uploads\//i)) {
      return url.replace(/^\/[a-z]{2}(\/uploads\/.*)$/i, '$1');
    }
    return url;
  }
  
  // URL belirsiz formatta ise, /uploads/ öneki ekle
  return `/uploads/${url}`;
}

/**
 * Görsel URL'lerini al ve optimize et
 * @param images URL dizisi
 * @returns Optimize edilmiş URL dizisi
 */
export function getOptimizedImages(images: string[]): string[] {
  if (!images || !Array.isArray(images)) return [];
  
  return images.map(url => getOptimizedImageUrl(url)).filter(url => !!url);
}

export default {
  uploadImage,
  getOptimizedImageUrl,
  getOptimizedImages,
  generateUniqueId,
  sanitizeFilename
};