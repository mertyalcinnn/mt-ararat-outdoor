import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { uploadBuffer } from '@/lib/cloudinary';

// Benzersiz ID oluşturmak için yardımcı fonksiyon
function generateUniqueId() {
  // Zaman damgası ve rastgele sayı kullanarak benzersiz bir ID oluştur
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Dosya yükleme isteği alındı');
    
    // Çalışma ortamı bilgisini logla
    console.log('Çalışma ortamı:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL === '1' ? 'Evet' : 'Hayır',
      CLOUDINARY_CONFIG: {
        CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Mevcut' : '✗ Eksik',
        API_KEY: process.env.CLOUDINARY_API_KEY ? '✓ Mevcut' : '✗ Eksik',
        API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✓ Mevcut' : '✗ Eksik',
      }
    });
    
    // formData'yı kontrollü şekilde al
    let formData;
    try {
      formData = await request.formData();
      console.log('FormData alındı, içerik anahtarları:', Array.from(formData.keys()));
    } catch (formError) {
      console.error('FormData işlenirken hata:', formError);
      return NextResponse.json(
        { error: 'Dosya verisi işlenemedi', details: formError instanceof Error ? formError.message : 'FormData hatası' },
        { status: 400 }
      );
    }
    
    const file = formData.get('file') as File;

    if (!file) {
      console.error('Dosya bulunamadı');
      return NextResponse.json(
        { error: 'Dosya yüklenemedi - dosya bulunamadı' },
        { status: 400 }
      );
    }

    console.log('Dosya bilgileri:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`
    });

    // Dosya içeriğini bir buffer'a dönüştürelim
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Görsel türünü kontrol et
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.type)) {
      console.error('Geçersiz dosya formatı:', file.type);
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı. Sadece jpg, jpeg, png, webp, gif ve svg desteklenmektedir.' },
        { status: 400 }
      );
    }

    // Vercel ortamında veya Cloudinary yapılandırılmışsa Cloudinary kullan
    const useCloudinary = process.env.VERCEL === '1' || (
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    );
    
    console.log('Yükleme stratejisi:', useCloudinary ? 'Cloudinary' : 'Dosya Sistemi');
    
    if (useCloudinary) {
      try {
        // Cloudinary modülünü dinamik olarak yükle
        const cloudinaryModule = await import('@/lib/cloudinary');
        
        // Cloudinary yapılandırmasını kontrol et
        const isConfigValid = cloudinaryModule.verifyCloudinaryConfig();
        if (!isConfigValid) {
          throw new Error('Cloudinary yapılandırması eksik veya hatalı');
        }
        
        // Dosyayı Cloudinary'ye yükle
        console.log('Dosya Cloudinary\'ye yükleniyor...');
        const uploadResult = await cloudinaryModule.uploadBuffer(buffer, 'activities');
        
        if (!uploadResult) {
          throw new Error('Cloudinary yükleme sonucu boş, yükleme başarısız');
        }
        
        console.log('Cloudinary yükleme başarılı:', uploadResult);
        
        return NextResponse.json({
          success: true,
          url: uploadResult,
          fullUrl: uploadResult,
          filename: uploadResult.split('/').pop(),
          provider: 'cloudinary'
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary yükleme hatası (detaylı):', cloudinaryError);
        
        // Vercel'de çalışıyorsak hata fırlat, lokalde dosya sistemine düşebiliriz
        if (process.env.VERCEL === '1') {
          return NextResponse.json(
            { 
              error: 'Görsel yüklenirken hata oluştu',
              details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Bilinmeyen hata',
              code: 'CLOUDINARY_ERROR'
            },
            { status: 500 }
          );
        }
        
        // Lokalde çalışıyorsak, dosya sistemine düşelim
        console.log('Cloudinary hatası nedeniyle dosya sistemine düşülüyor...');
      }
    }
    
    // Buraya gelirsek, dosya sistemine yazıyoruz demektir
    // Dosya uzantısını al
    const originalFilename = file.name;
    const fileExtension = path.extname(originalFilename).toLowerCase();
    
    // Yeni benzersiz bir dosya adı oluşturalım
    const uniqueFilename = `${generateUniqueId()}${fileExtension}`;
    
    // Uploads dizinini kontrol et
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.promises.access(uploadDir);
    } catch (err) {
      console.log('Uploads dizini oluşturuluyor...');
      await mkdir(uploadDir, { recursive: true, mode: 0o755 });
    }
    
    // Dosyayı kaydet
    const filePath = path.join(uploadDir, uniqueFilename);
    console.log('Dosya kaydediliyor:', filePath);
    
    try {
      await writeFile(filePath, buffer);
      console.log('Dosya başarıyla kaydedildi');
    } catch (fileError) {
      console.error('Dosya yazma hatası:', fileError);
      return NextResponse.json(
        { error: 'Dosya kaydedilemedi', details: fileError instanceof Error ? fileError.message : 'Bilinmeyen hata' },
        { status: 500 }
      );
    }
    
    // URL oluştur
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const uploadPath = `/uploads/${uniqueFilename}`;
    
    const response = {
      success: true,
      url: uploadPath,
      fullUrl: `${protocol}://${host}${uploadPath}`,
      filename: uniqueFilename,
      provider: 'filesystem'
    };
    
    console.log('Başarılı yanıt:', response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Genel yükleme hatası:', error);
    return NextResponse.json({
      error: 'Dosya yüklenemedi',
      details: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}