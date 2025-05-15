// Bu dosya, upload route'u için Cloudinary'ye yükleme işlemlerini gerçekleştirir
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { uploadBuffer, uploadBase64Image } from '@/lib/cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Benzersiz ID oluşturmak için yardımcı fonksiyon
function generateUniqueId() {
  // Zaman damgası ve rastgele sayı kullanarak benzersiz bir ID oluştur
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Cloudinary dosya yükleme isteği alındı');
    
    // Cloudinary kimlik bilgilerini kontrol et
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary kimlik bilgileri eksik');
      return NextResponse.json(
        { error: 'Cloudinary yapılandırması eksik' },
        { status: 500 }
      );
    }
    
    // multipart form verilerini işleyelim
    const formData = await request.formData();
    console.log('FormData alındı, içerik anahtarları:', Array.from(formData.keys()));
    
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

    // Görsel türünü kontrol edelim
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.type)) {
      console.error('Geçersiz dosya formatı:', file.type);
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı. Sadece jpg, jpeg, png, webp, gif ve svg desteklenmektedir.' },
        { status: 400 }
      );
    }

    // Dosyayı Cloudinary'ye yükle
    try {
      console.log('Görsel Cloudinary\'ye yükleniyor...');
      
      // Benzersiz bir dosya adı oluştur
      const filename = `${generateUniqueId()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Cloudinary'ye yükle
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'activities',
            public_id: filename.split('.')[0], // Uzantıyı kaldır
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
        ).end(buffer);
      });
      
      // Sonucu döndür
      console.log('Görsel Cloudinary\'ye başarıyla yüklendi', result);
      
      // @ts-ignore - result tipini any olarak kabul et
      return NextResponse.json({
        success: true,
        // @ts-ignore - result tipini any olarak kabul et
        url: result.secure_url,
        // @ts-ignore - result tipini any olarak kabul et
        fullUrl: result.secure_url,
        // @ts-ignore - result tipini any olarak kabul et
        filename: result.public_id
      });
      
    } catch (cloudinaryError) {
      console.error('Cloudinary yükleme hatası:', cloudinaryError);
      return NextResponse.json(
        { 
          error: 'Görsel Cloudinary\'ye yüklenemedi', 
          details: cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Detaylı hata:', error);
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}` 
      : String(error);
      
    return NextResponse.json({
      error: 'Dosya yüklenemedi',
      details: errorMessage,
      // Stack bilgisi geliştirme ortamında yardımcı olabilir
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}