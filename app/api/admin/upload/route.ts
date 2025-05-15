import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { uploadImage as uploadImageToFileSystem } from '@/lib/image-service';
import { uploadImage as uploadImageToR2 } from '@/lib/r2-service';
import { isVercelProduction } from '@/lib/environment';

// Benzersiz ID oluşturmak için yardımcı fonksiyon
function generateUniqueId() {
  // Zaman damgası ve rastgele sayı kullanarak benzersiz bir ID oluştur
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Dosya yükleme isteği alındı');
    
    // R2 depolama kullanıp kullanmayacağımızı kontrol et
    const useR2Storage = process.env.USE_R2_STORAGE === 'true' || isVercelProduction();
    
    // Ortam kontrolü artık R2 ile çalışabiliyor
    if (isVercelProduction() && !useR2Storage) {
      console.log('Vercel üretim ortamında dosya yükleme devre dışı');
      return NextResponse.json({
        error: 'Üretim ortamında görsel yükleme devre dışı bırakılmıştır.',
        details: 'Üretim ortamında dosya sistemi salt-okunurdur. Lütfen görselleri geliştirme ortamında yükleyin ve sonra projeyi deploy edin.',
        code: 'PRODUCTION_UPLOAD_DISABLED'
      }, { status: 403 });
    }
    
    // R2 depolama kullanılacaksa, API anahtarlarını kontrol et
    if (useR2Storage) {
      if (!process.env.R2_ACCESS_KEY || !process.env.R2_SECRET_KEY || !process.env.R2_BUCKET_NAME) {
        console.error('R2 yapılandırma bilgileri eksik');
        return NextResponse.json({
          error: 'Cloudflare R2 yapılandırması eksik',
          code: 'R2_CONFIG_MISSING'
        }, { status: 500 });
      }
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

    try {
      // Görsel yükleme işlemi - R2 veya dosya sistemi
      let imageUrl;
      
      if (useR2Storage) {
        console.log('R2 depolama kullanılıyor...');
        imageUrl = await uploadImageToR2(buffer, file.name);
      } else {
        console.log('Dosya sistemi depolaması kullanılıyor...');
        imageUrl = await uploadImageToFileSystem(buffer, file.name);
      }
      
      if (!imageUrl) {
        throw new Error('Görsel yükleme başarısız');
      }
      
      // URL oluştur
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      
      // R2 URL'leri zaten tam URL olduğu için kontrol et
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${protocol}://${host}${imageUrl}`;
      
      const response = {
        success: true,
        url: imageUrl,
        fullUrl: fullUrl,
        filename: imageUrl.split('/').pop(),
        provider: useR2Storage ? 'cloudflare-r2' : 'filesystem'
      };
      
      console.log('Başarılı yanıt:', response);
      return NextResponse.json(response);
    } catch (uploadError) {
      console.error('Görsel yükleme hatası:', uploadError);
      return NextResponse.json(
        { 
          error: 'Görsel yüklenemedi', 
          details: uploadError instanceof Error ? uploadError.message : 'Bilinmeyen hata',
          code: 'UPLOAD_ERROR'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Genel yükleme hatası:', error);
    return NextResponse.json({
      error: 'Dosya yüklenemedi',
      details: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}