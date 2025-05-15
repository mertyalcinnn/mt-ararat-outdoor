import { NextRequest, NextResponse } from 'next/server';
import { verifyCloudinaryConfig } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    // Cloudinary yapılandırmasını kontrol et
    const isValid = verifyCloudinaryConfig();
    
    // Ortam değişkenlerini raporla (güvenlik için sansürlenmiş)
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL === '1' ? 'Evet' : 'Hayır',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Ayarlanmış' : '✗ Eksik',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✓ Ayarlanmış' : '✗ Eksik',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✓ Ayarlanmış' : '✗ Eksik',
      MONGODB_URI: process.env.MONGODB_URI ? '✓ Ayarlanmış' : '✗ Eksik',
      MONGODB_DB: process.env.MONGODB_DB,
    };
    
    return NextResponse.json({
      success: true,
      cloudinaryConfigValid: isValid,
      env: envStatus,
      date: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Config API hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    }, { status: 500 });
  }
}