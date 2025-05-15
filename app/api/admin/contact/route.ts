"use server";

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// İletişim verilerini al
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data/contact.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'İletişim verisi bulunamadı' }, { status: 404 });
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error('İletişim verisi yüklenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'İletişim verisi yüklenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// İletişim verilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data/contact.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'İletişim verisi bulunamadı' }, { status: 404 });
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
    
    // Gerekli alanları kontrol et
    if (!data.title || !data.address || !data.email || !data.phone) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' }, 
        { status: 400 }
      );
    }
    
    // Dosyaya yaz
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true,
      message: 'İletişim verisi başarıyla güncellendi',
      data
    });
  } catch (error) {
    console.error('İletişim verisi güncellenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'İletişim verisi güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}