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
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya formatı. Sadece jpg, jpeg, png, webp ve gif desteklenmektedir.' },
        { status: 400 }
      );
    }

    // Dosyayı public/uploads klasörüne kaydedelim
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Uploads klasörü var mı kontrol edelim, yoksa oluşturalım
    try {
      await fs.promises.access(uploadDir);
    } catch (error) {
      console.log('Uploads directory does not exist, creating...', uploadDir);
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Debug bilgisi
    console.log('Saving file to:', filePath);
    
    try {
      await writeFile(filePath, buffer);
      console.log('File saved successfully');
    } catch (fileError) {
      console.error('Error writing file:', fileError);
      return NextResponse.json(
        { error: `Dosya kaydedilemedi: ${fileError instanceof Error ? fileError.message : 'Bilinmeyen hata'}` },
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