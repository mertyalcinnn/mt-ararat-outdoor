import { NextRequest, NextResponse } from 'next/server';
import { find } from '@/lib/mongodb';
import { getAllActivities } from '@/lib/activities';

// GET - Tüm aktiviteleri getir
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/admin/activities isteği alındı.');
    
    // MongoDB'den aktiviteleri al
    const activities = await find('activities');
    
    // MongoDB'den veri gelemediyse dosya sisteminden oku
    if (!activities || activities.length === 0) {
      console.log('MongoDB\'den aktivite bulunamadı, dosya sisteminden okunuyor...');
      const fileActivities = getAllActivities();
      
      return NextResponse.json(fileActivities);
    }
    
    // MongoDB'den gelen aktiviteleri döndür
    return NextResponse.json(activities);
    
  } catch (error) {
    console.error('Aktiviteler alınırken hata:', error);
    
    // Hata durumunda dosya sisteminden okumayı dene
    try {
      console.log('Hata nedeniyle dosya sisteminden aktiviteler okunuyor...');
      const fileActivities = getAllActivities();
      
      return NextResponse.json(fileActivities);
    } catch (fileError) {
      console.error('Dosya sisteminden okuma hatası:', fileError);
      
      return NextResponse.json(
        { 
          error: 'Aktiviteler alınamadı', 
          details: error instanceof Error ? error.message : String(error),
          fileError: fileError instanceof Error ? fileError.message : String(fileError)
        },
        { status: 500 }
      );
    }
  }
}
