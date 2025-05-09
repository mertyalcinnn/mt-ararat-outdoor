import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Aktivite dosyalarını okuyun
    const activitiesDir = path.join(process.cwd(), 'data/activities');
    
    // Dizin var mı kontrol et
    if (!fs.existsSync(activitiesDir)) {
      console.error(`Dizin bulunamadı: ${activitiesDir}`);
      return NextResponse.json({ error: 'Aktivite dizini bulunamadı' }, { status: 404 });
    }
    
    const fileNames = fs.readdirSync(activitiesDir);
    console.log('Bulunan dosyalar:', fileNames);
    
    const activities = [];
    
    for (const fileName of fileNames) {
      if (fileName.endsWith('.json')) {
        try {
          const filePath = path.join(activitiesDir, fileName);
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const activity = JSON.parse(fileContents);
          activities.push(activity);
        } catch (err) {
          console.error(`${fileName} dosyası işlenirken hata:`, err);
          // Hatalı dosyayı atla ama tüm işlemi durdurma
        }
      }
    }
    
    console.log(`${activities.length} aktivite yüklendi`);
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Aktiviteleri yüklerken hata:', error);
    return NextResponse.json({ 
      error: 'Aktiviteler yüklenirken hata oluştu', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}