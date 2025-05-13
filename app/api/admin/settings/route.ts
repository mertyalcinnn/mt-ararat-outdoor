import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Site ayarlarını al
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data/settings.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Ayarlar bulunamadı' }, { status: 404 });
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error('Ayarlar yüklenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'Ayarlar yüklenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// Site ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data/settings.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Ayarlar bulunamadı' }, { status: 404 });
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
    
    // Temel validasyon
    if (!data.site || !data.site.title) {
      return NextResponse.json(
        { error: 'Site başlığı gereklidir' }, 
        { status: 400 }
      );
    }
    
    // Dosyaya yaz
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ 
      success: true,
      message: 'Ayarlar başarıyla güncellendi',
      data
    });
  } catch (error) {
    console.error('Ayarlar güncellenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'Ayarlar güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}