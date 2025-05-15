import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// Benzersiz ID oluşturmak için yardımcı fonksiyon
function generateUniqueId() {
  // Zaman damgası ve rastgele sayı kullanarak benzersiz bir ID oluştur
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Dosya yükleme isteği alındı');
    
    // multipart form verilerini işleyelim
    const formData = await request.formData();
    console.log('FormData alındı, içerik anahtarları:', [...formData.keys()]);
    
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

    // Dosya uzantısını alalım
    const originalFilename = file.name;
    const fileExtension = path.extname(originalFilename).toLowerCase();
    
    // Yeni benzersiz bir dosya adı oluşturalım
    const uniqueFilename = `${generateUniqueId()}${fileExtension}`;
    
    // Görsel türünü kontrol edelim (sadece jpeg, jpg, png, webp, gif)
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    if (!allowedExtensions.includes(fileExtension)) {
      console.error('Geçersiz dosya formatı:', fileExtension);
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı. Sadece jpg, jpeg, png, webp, gif ve svg desteklenmektedir.' },
        { status: 400 }
      );
    }

    // Dosyayı public/uploads klasörüne kaydedelim
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Uploads klasörü var mı kontrol edelim, yoksa oluşturalım
    try {
      // Dizin varlığını kontrol et
      console.log('Uploads dizini kontrol ediliyor:', uploadDir);
      
      try {
        await fs.promises.access(uploadDir);
        console.log('Uploads dizini mevcut');
      } catch (accessError) {
        console.log('Uploads dizini mevcut değil, oluşturuluyor...');
        // Dizini oluştur (recursive: true ile üst dizinler de oluşturulur)
        await mkdir(uploadDir, { recursive: true, mode: 0o755 });
        console.log('Uploads dizini oluşturuldu');
      }
      
      // Test dosyası yazarak yetkileri kontrol et
      const testFile = path.join(uploadDir, 'test_permissions.txt');
      await writeFile(testFile, 'test');
      await fs.promises.unlink(testFile);
      console.log('Yazma yetkileri OK');
    } catch (mkdirError) {
      console.error('Dizin oluşturma veya yazma hatası:', mkdirError);
      return NextResponse.json(
        { error: 'Uploads dizini oluşturulamadı veya yazılabilir değil', details: mkdirError instanceof Error ? mkdirError.message : 'Bilinmeyen hata' },
        { status: 500 }
      );
    }
    
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Debug bilgisi
    console.log('Görsel kaydediliyor:', filePath);
    
    try {
      await writeFile(filePath, buffer);
      console.log('Görsel başarıyla kaydedildi');
    } catch (fileError) {
      console.error('Görsel yazma hatası:', fileError);
      return NextResponse.json(
        { error: `Dosya kaydedilemedi: ${fileError instanceof Error ? fileError.message : 'Bilinmeyen hata'}` },
        { status: 500 }
      );
    }
    
    // Dosyanın var olduğundan emin olalım
    try {
      await fs.promises.access(filePath);
      console.log('Kaydedilen dosyaya erişim OK');
    } catch (accessError) {
      console.error('Kaydedilen dosya bulunamadı:', accessError);
      return NextResponse.json(
        { error: 'Dosya kaydedildi fakat erişilemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }
    
    // Frontend'e dosya URL'sini dönelim (hostname ile tam URL oluştur)
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const uploadPath = `/uploads/${uniqueFilename}`;
    
    // NOT: URL'de asla dil kodu olmamalı (örn. /tr/uploads/... yerine /uploads/...)
    const response = {
      success: true,
      url: uploadPath, // Daima /uploads/filename formatında olmalı
      fullUrl: `${protocol}://${host}${uploadPath}`,
      filename: uniqueFilename
    };
    
    console.log('Başarılı yanıt:', response);
    return NextResponse.json(response);
    
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