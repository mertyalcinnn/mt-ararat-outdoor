import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// API rotasını dinamik olarak işaretle
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('Debug API isteği alındı');
    
    // Dizin yapılarını kontrol et
    const directories = [
      {
        path: '/activities',
        fullPath: path.join(process.cwd(), 'activities'),
        description: 'Kök aktiviteler dizini'
      },
      {
        path: '/data/activities',
        fullPath: path.join(process.cwd(), 'data', 'activities'),
        description: 'Ana veri dizini'
      },
      {
        path: '/public/uploads',
        fullPath: path.join(process.cwd(), 'public', 'uploads'),
        description: 'Uploads dizini'
      }
    ];
    
    const directoryStatus = [];
    
    for (const dir of directories) {
      let exists = false;
      let canWrite = false;
      let files: string[] = [];
      
      try {
        exists = fs.existsSync(dir.fullPath);
        
        if (exists) {
          // Yazma yetkisi kontrolü
          try {
            const testFile = path.join(dir.fullPath, 'test_permission.txt');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            canWrite = true;
          } catch (writeError) {
            console.error(`${dir.path} dizinine yazma hatası:`, writeError);
            canWrite = false;
          }
          
          // Dosyaları listele
          try {
            files = fs.readdirSync(dir.fullPath);
          } catch (readError) {
            console.error(`${dir.path} dizini okunamadı:`, readError);
            files = [];
          }
        }
      } catch (error) {
        console.error(`${dir.path} dizini kontrolünde hata:`, error);
      }
      
      directoryStatus.push({
        path: dir.path,
        description: dir.description,
        exists,
        canWrite,
        files
      });
    }
    
    // API endpoint'leri kontrol et
    const endpoints = [
      { path: '/api/admin/activities', method: 'GET', description: 'Tüm aktiviteleri getir' },
      { path: '/api/admin/activities/new', method: 'POST', description: 'Yeni aktivite ekle' },
      { path: '/api/admin/activities/edit', method: 'POST', description: 'Aktivite düzenle' },
      { path: '/api/admin/activities/delete', method: 'POST', description: 'Aktivite sil' },
      { path: '/api/revalidate', method: 'GET', description: 'Önbellek temizle' },
      { path: '/api/admin/upload', method: 'POST', description: 'Dosya yükle' },
      { path: '/api/admin/media', method: 'GET', description: 'Medya dosyalarını getir' }
    ];
    
    // Dosya yolları hakkında ek bilgiler
    const currentPaths = {
      cwd: process.cwd(),
      dataDir: path.join(process.cwd(), 'data', 'activities'),
      uploadsDir: path.join(process.cwd(), 'public', 'uploads')
    };
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      directories: directoryStatus,
      endpoints,
      paths: currentPaths
    });
    
  } catch (error) {
    console.error('Debug API hatası:', error);
    return NextResponse.json({
      error: 'Debug API hatası',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}