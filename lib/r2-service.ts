/**
 * Cloudflare R2 depolama servisi
 * Bu dosya, dosyaları Cloudflare R2'ye yüklemek ve yönetmek için kullanılır
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Cloudflare R2 konfigürasyonu
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY || '';
const R2_SECRET_KEY = process.env.R2_SECRET_KEY || '';
const R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://dca1d77346db58b70426de41aea91f46.r2.cloudflarestorage.com';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'test';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://test.dca1d77346db58b70426de41aea91f46.r2.cloudflarestorage.com';

// S3 istemcisi oluştur
const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

/**
 * Benzersiz dosya adı oluştur
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  
  // Dosya uzantısını al
  const fileExtension = originalFilename.split('.').pop() || '';
  
  // Benzersiz dosya adı oluştur
  return `${timestamp}-${randomStr}.${fileExtension}`;
}

/**
 * Dosya adını URL için güvenli hale getir
 */
export function sanitizeFilename(filename: string): string {
  // Türkçe karakterleri ve özel karakterleri değiştir
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ğ]/g, 'g')
    .replace(/[Ğ]/g, 'G')
    .replace(/[ç]/g, 'c')
    .replace(/[Ç]/g, 'C')
    .replace(/[ş]/g, 's')
    .replace(/[Ş]/g, 'S')
    .replace(/[ı]/g, 'i')
    .replace(/[İ]/g, 'I')
    .replace(/[ö]/g, 'o')
    .replace(/[Ö]/g, 'O')
    .replace(/[ü]/g, 'u')
    .replace(/[Ü]/g, 'U')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/--+/g, '-');  // Birden fazla '-' karakterini tek '-' ile değiştir
}

/**
 * Dosyayı R2'ye yükle
 * @param buffer Dosya içeriği
 * @param filename Dosya adı
 * @param contentType Dosya MIME tipi
 * @returns Yüklenen dosyanın URL'i
 */
export async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    // Dosya adını güvenli hale getir
    const safeFilename = sanitizeFilename(filename);
    
    // Benzersiz dosya adı oluştur
    const uniqueFilename = generateUniqueFilename(safeFilename);
    
    // Yükleme komutu oluştur
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read', // Dosyayı herkese açık yap
    });
    
    // Dosyayı yükle
    await s3Client.send(command);
    
    // Erişilebilir URL oluştur
    const fileUrl = `${R2_PUBLIC_URL}/${uniqueFilename}`;
    
    console.log(`Dosya R2'ye başarıyla yüklendi: ${fileUrl}`);
    
    return fileUrl;
  } catch (error) {
    console.error('R2 yükleme hatası:', error);
    throw new Error(`Dosya R2'ye yüklenirken hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Görsel yükleme fonksiyonu (image-service ile uyumlu)
 * @param buffer Görsel içeriği
 * @param originalFilename Orijinal dosya adı
 * @returns Görsel URL'i
 */
export async function uploadImage(buffer: Buffer, originalFilename: string): Promise<string> {
  // MIME tipini belirleyelim
  let contentType = 'image/jpeg'; // Varsayılan
  
  // Dosya uzantısına göre content type belirle
  const extension = originalFilename.split('.').pop()?.toLowerCase();
  if (extension) {
    const mimeTypes: {[key: string]: string} = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    
    contentType = mimeTypes[extension] || contentType;
  }
  
  // R2'ye yükle
  return await uploadToR2(buffer, originalFilename, contentType);
}

// Servis için dışa aktarılan fonksiyonlar
export default {
  uploadImage,
  uploadToR2,
  generateUniqueFilename,
  sanitizeFilename
}; 