import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    // Uploads dizininin varlığını kontrol et
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    let exists = false;
    let files: string[] = [];
    
    try {
      await fs.promises.access(uploadsDir);
      exists = true;
      const filesList = await fs.promises.readdir(uploadsDir);
      files = filesList;
    } catch (error) {
      console.error('Uploads dizini erişim hatası:', error);
    }
    
    // Tam URL'leri oluşturmak için istek bilgilerini kullan
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // Dönüş değeri
    return NextResponse.json({
      uploadsExists: exists,
      path: uploadsDir,
      files: files,
      imageUrls: files.map(file => `${protocol}://${host}/uploads/${file}`),
      requestHost: host,
      requestProtocol: protocol,
      publicUrl: `${protocol}://${host}`
    });
  } catch (error) {
    console.error('Dosya sistemi hatası:', error);
    return NextResponse.json({
      error: 'Dosya sistemi hatası',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}