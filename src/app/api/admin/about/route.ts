import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Hakkımızda verilerini al
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data/about.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Hakkımızda verisi bulunamadı' }, { status: 404 });
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error('Hakkımızda verisi yüklenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'Hakkımızda verisi yüklenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// Hakkımızda verilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data/about.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Hakkımızda verisi bulunamadı' }, { status: 404 });
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
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' }, 
        { status: 400 }
      );
    }
    
    // Ekip üyeleri kontrolü
    if (data.teamMembers && !Array.isArray(data.teamMembers)) {
      return NextResponse.json(
        { error: 'teamMembers bir dizi olmalıdır' }, 
        { status: 400 }
      );
    }
    
    // Dosyaya yaz
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true,
      message: 'Hakkımızda verisi başarıyla güncellendi',
      data
    });
  } catch (error) {
    console.error('Hakkımızda verisi güncellenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'Hakkımızda verisi güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}