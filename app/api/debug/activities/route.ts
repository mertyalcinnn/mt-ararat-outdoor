import { NextRequest, NextResponse } from 'next/server';
import { getAllActivitiesFromDB } from '@/lib/api-mongodb';
import { getAllActivities } from '@/lib/activities';
import { revalidatePath } from 'next/cache';

// Aktivite türü
interface Activity {
  slug: string;
  title: string;
  description: string;
  [key: string]: any; // Diğer özellikler için esnek yapı
}

// Bu endpoint, aktiviteleri farklı kaynaklardan döndürür ve sorun giderme için kullanılır
export async function GET(request: NextRequest) {
  try {
    // URL parametrelerini al
    const source = request.nextUrl.searchParams.get('source');
    const revalidate = request.nextUrl.searchParams.get('revalidate') === 'true';
    
    let activitiesFromMongo: Activity[] = [];
    let activitiesFromFiles: Activity[] = [];
    
    // MongoDB'den veri al
    try {
      activitiesFromMongo = await getAllActivitiesFromDB();
      console.log(`MongoDB'den gelen aktivite sayısı: ${activitiesFromMongo.length}`);
    } catch (mongoError) {
      console.error('MongoDB veri alma hatası:', mongoError);
    }
    
    // Dosyalardan veri al
    try {
      activitiesFromFiles = getAllActivities() as Activity[];
      console.log(`Dosyalardan gelen aktivite sayısı: ${activitiesFromFiles.length}`);
    } catch (fileError) {
      console.error('Dosya veri alma hatası:', fileError);
    }
    
    // Eğer revalidate parametresi varsa sayfaları yenile
    if (revalidate) {
      console.log('Sayfalar yenileniyor...');
      try {
        revalidatePath('/', 'layout');
        revalidatePath('/tr/activities', 'page');
        revalidatePath('/en/activities', 'page');
        revalidatePath('/ru/activities', 'page');
        console.log('Sayfalar yenilendi!');
      } catch (revalidateError) {
        console.error('Sayfa yenileme hatası:', revalidateError);
      }
    }
    
    // İstenilen kaynaktan veri döndür
    if (source === 'mongo') {
      return NextResponse.json({
        source: 'mongodb',
        count: activitiesFromMongo.length,
        data: activitiesFromMongo
      });
    } else if (source === 'files') {
      return NextResponse.json({
        source: 'files',
        count: activitiesFromFiles.length,
        data: activitiesFromFiles
      });
    } else {
      // Varsayılan olarak her iki kaynaktan gelen verileri karşılaştırmalı olarak göster
      return NextResponse.json({
        mongo: {
          count: activitiesFromMongo.length,
          data: activitiesFromMongo
        },
        files: {
          count: activitiesFromFiles.length,
          data: activitiesFromFiles
        },
        revalidated: revalidate
      });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Debug aktivite verisi alınamadı',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}