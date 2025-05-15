"use server";

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Tüm müşteri yorumlarını getir
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data/testimonials.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Müşteri yorumları bulunamadı' }, { status: 404 });
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error('Müşteri yorumları yüklenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'Müşteri yorumları yüklenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// Tüm müşteri yorumlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data/testimonials.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Müşteri yorumları bulunamadı' }, { status: 404 });
    }
    
    const requestText = await request.text();
    let data;
    
    try {
      data = JSON.parse(requestText);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Geçersiz JSON formatı', details: String(parseError) }, 
        { status: 400 }
      );
    }
    
    // Dizi kontrolü
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Veri bir dizi olmalıdır' }, 
        { status: 400 }
      );
    }
    
    // Her bir yorum için gerekli alanları kontrol et
    for (const testimonial of data) {
      if (!testimonial.name || !testimonial.quote) {
        return NextResponse.json(
          { error: 'Her yorumda isim ve alıntı alanları gereklidir' }, 
          { status: 400 }
        );
      }
    }
    
    // Dosyaya yaz
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true,
      message: 'Müşteri yorumları başarıyla güncellendi',
      data
    });
  } catch (error) {
    console.error('Müşteri yorumları güncellenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'Müşteri yorumları güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}