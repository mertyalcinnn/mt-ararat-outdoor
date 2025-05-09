import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Resim yükleme dizinleri
const UPLOAD_DIRS = [
  path.join(process.cwd(), 'public', 'uploads'),
  path.join(process.cwd(), 'public', 'images')
];

// Desteklenen resim formatları
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

// Dosya boyutunu formatla
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

// GET - Mevcut medya dosyalarını listele
export async function GET() {
  try {
    let allMedia = [];
    
    // Tüm dizinlerdeki medya dosyalarını topla
    for (const dir of UPLOAD_DIRS) {
      // Dizinin var olduğundan emin ol
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        continue;
      }
      
      const files = fs.readdirSync(dir);
      const relativeDirPath = dir.replace(path.join(process.cwd(), 'public'), '');
      
      const mediaFiles = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return SUPPORTED_FORMATS.includes(ext);
        })
        .map(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          const relativePath = path.join(relativeDirPath, file).replace(/\\/g, '/');
          
          return {
            name: file,
            path: relativePath,
            size: formatFileSize(stats.size),
            lastModified: stats.mtime.toISOString(),
            type: path.extname(file).substring(1)
          };
        });
      
      allMedia = [...allMedia, ...mediaFiles];
    }
    
    // Son değiştirilme tarihine göre sırala (en yeni önce)
    allMedia.sort((a, b) => {
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });
    
    return NextResponse.json(allMedia);
  } catch (error) {
    console.error('Medya dosyaları listelenirken hata:', error);
    return NextResponse.json({ 
      error: 'Medya dosyaları listelenirken hata oluştu' 
    }, { status: 500 });
  }
}