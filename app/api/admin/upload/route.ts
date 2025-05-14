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
    // multipart form verilerini işleyelim
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya yüklenemedi - dosya bulunamadı' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı. Sadece jpg, jpeg, png, webp, gif ve svg desteklenmektedir.' },
        { status: 400 }
      );
    }

    // Dosyayı public/uploads klasörüne kaydedelim
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Uploads klasörü var mı kontrol edelim, yoksa oluşturalım
    try {
      await fs.promises.access(uploadDir);
    } catch (error) {
      console.log('Uploads dizini bulunamadı, oluşturuluyor...', uploadDir);
      try {
        await mkdir(uploadDir, { recursive: true });
        console.log('Uploads dizini başarıyla oluşturuldu');
      } catch (mkdirError) {
        console.error('Uploads dizini oluşturulurken hata:', mkdirError);
        return NextResponse.json(
          { error: `Uploads dizini oluşturulamadı: ${mkdirError instanceof Error ? mkdirError.message : 'Bilinmeyen hata'}` },
          { status: 500 }
        );
      }
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
    } catch (accessError) {
      console.error('Kaydedilen dosya bulunamadı:', accessError);
      return NextResponse.json(
        { error: 'Dosya kaydedildi fakat erişilemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }
    
    // Frontend'e dosya URL'sini dönelim
    return NextResponse.json({ 
      success: true,
      url: `/uploads/${uniqueFilename}`,
      filename: uniqueFilename
    });
    
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Dosya yüklenirken bir hata oluştu', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}