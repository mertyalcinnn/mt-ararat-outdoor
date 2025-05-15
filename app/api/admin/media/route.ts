import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Medya dosyası türü
interface MediaFile {
  name: string;
  url: string;
  path: string;
  size: string;
  sizeBytes: number;
  lastModified: string;
  type: string;
}

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
    let allMedia: MediaFile[] = [];
    
    // Tüm dizinlerdeki medya dosyalarını topla
    for (const dir of UPLOAD_DIRS) {
      // Dizinin var olduğundan emin ol
      try {
        if (!fs.existsSync(dir)) {
          console.log(`Dizin bulunamadı, oluşturuluyor: ${dir}`);
          fs.mkdirSync(dir, { recursive: true });
          console.log(`Dizin oluşturuldu: ${dir}`);
          continue;
        }
        
        const files = fs.readdirSync(dir);
        const relativeDirPath = dir.replace(path.join(process.cwd(), 'public'), '');
        
        const mediaFiles: MediaFile[] = files
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return SUPPORTED_FORMATS.includes(ext);
          })
          .map(file => {
            try {
              const filePath = path.join(dir, file);
              const stats = fs.statSync(filePath);
              const relativePath = path.join(relativeDirPath, file).replace(/\\/g, '/');
              
              return {
                name: file,
                url: relativePath,  // Frontende görüntülemek için url dönüşümü
                path: relativePath,
                size: formatFileSize(stats.size),
                sizeBytes: stats.size,
                lastModified: stats.mtime.toISOString(),
                type: path.extname(file).substring(1)
              } as MediaFile;
            } catch (fileError) {
              console.error(`Dosya işlenirken hata: ${file}`, fileError);
              return null;
            }
          })
          .filter((item): item is MediaFile => item !== null); // Null olanları filtrele
        
        allMedia = [...allMedia, ...mediaFiles];
      } catch (dirError) {
        console.error(`Dizin okunurken hata: ${dir}`, dirError);
      }
    }
    
    // Son değiştirilme tarihine göre sırala (en yeni önce)
    allMedia.sort((a, b) => {
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });
    
    return NextResponse.json(allMedia);
  } catch (error) {
    console.error('Medya dosyaları listelenirken hata (detaylı):', error);
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}` 
      : String(error);
      
    return NextResponse.json({
      error: 'Medya dosyaları listelenirken hata oluştu',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}