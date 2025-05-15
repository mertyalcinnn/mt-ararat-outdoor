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

// Vercel için runtime ve dynamic ayarları
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    // Cloudinary kimlik bilgilerini kontrol et
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary yapılandırması eksik');
    }
    
    // formData'yı al
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya yüklenemedi - dosya bulunamadı' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Görsel türünü kontrol et
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı. Sadece jpg, jpeg, png, webp, gif ve svg desteklenmektedir.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Dosya içeriğini buffer'a dönüştür
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Benzersiz dosya adı oluştur
    const filename = `${generateUniqueId()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Cloudinary'ye yükle
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'mt-ararat',
          public_id: filename.split('.')[0],
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    if (!result || typeof result !== 'object' || !('secure_url' in result)) {
      throw new Error('Cloudinary yükleme başarısız');
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      fullUrl: result.secure_url,
      filename: result.public_id
    }, { headers: corsHeaders });
      
  } catch (error) {
    console.error('Hata:', error);
    return NextResponse.json(
      { 
        error: 'Görsel yüklenemedi', 
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}