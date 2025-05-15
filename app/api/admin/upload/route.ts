import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Benzersiz ID oluşturmak için yardımcı fonksiyon
function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Bu API rotası dinamik ve statik olarak oluşturulamaz
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// POST handler
export async function POST(request: NextRequest) {
  // CORS preflight için
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log('Dosya yükleme isteği alındı');
    
    // Cloudinary kimlik bilgilerini kontrol et
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary kimlik bilgileri eksik');
      return NextResponse.json(
        { error: 'Cloudinary yapılandırması eksik' },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // formData'yı kontrollü şekilde al
    let formData;
    try {
      formData = await request.formData();
      console.log('FormData alındı, içerik anahtarları:', Array.from(formData.keys()));
    } catch (formError) {
      console.error('FormData işlenirken hata:', formError);
      return NextResponse.json(
        { error: 'Dosya verisi işlenemedi', details: formError instanceof Error ? formError.message : 'FormData hatası' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const file = formData.get('file') as File;

    if (!file) {
      console.error('Dosya bulunamadı');
      return NextResponse.json(
        { error: 'Dosya yüklenemedi - dosya bulunamadı' },
        { status: 400, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    try {
      // Benzersiz bir dosya adı oluştur
      const filename = `${generateUniqueId()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Cloudinary'ye yükle
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'mt-ararat',
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
      }, { headers: corsHeaders });
      
    } catch (cloudinaryError) {
      console.error('Cloudinary yükleme hatası:', cloudinaryError);
      return NextResponse.json(
        { 
          error: 'Görsel Cloudinary\'ye yüklenemedi', 
          details: cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)
        },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Genel hata:', error);
    return NextResponse.json(
      { 
        error: 'Görsel yüklenemedi', 
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}