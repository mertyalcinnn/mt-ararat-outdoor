import { NextRequest, NextResponse } from 'next/server';
import { find } from '@/lib/mongodb';
import { getAllActivities } from '@/lib/activities';

// API route'un dynamic olduğunu belirt
export const dynamic = 'force-dynamic';

// Vercel derleme hatalarını önlemek için revalidate süresini 0 olarak belirle
export const revalidate = 0;

// Dinamik API'ler için Next.js tarafından gereken yapılandırma
export const fetchCache = 'force-no-store';

// Bu dosya için statik parametre oluşturma fonksiyonu
export async function generateStaticParams() {
  // Vercel derleme aşamasında dinamik API rota parametreleri gerekli değil
  console.log('Aktiviteler API route için boş statik parametreler döndürülüyor');
  return [];
}

// GET - Tüm aktiviteleri getir
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/admin/activities isteği alındı.');
    
    // MongoDB'den aktiviteleri al
    const activities = await find('activities');
    
    // MongoDB'den veri gelemediyse dosya sisteminden oku
    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      console.log('MongoDB\'den aktivite bulunamadı veya geçerli bir dizi döndürülmedi, dosya sisteminden okunuyor...');
      const fileActivities = await getAllActivities();
      
      // getAllActivities sonucunu doğrula
      if (!Array.isArray(fileActivities)) {
        console.error('Dosya sisteminden alınan aktiviteler bir dizi değil:', fileActivities);
        return NextResponse.json({
          error: 'Aktivite verisi doğru formatta değil'
        }, { status: 500 });
      }
      
      return NextResponse.json(fileActivities);
    }
    
    // MongoDB'den gelen aktiviteleri döndür
    return NextResponse.json(activities);
    
  } catch (error) {
    console.error('Aktiviteler alınırken hata:', error);
    
    // Hata durumunda dosya sisteminden okumayı dene
    try {
      console.log('Hata nedeniyle dosya sisteminden aktiviteler okunuyor...');
      const fileActivities = await getAllActivities();
      
      // getAllActivities sonucunu doğrula
      if (!Array.isArray(fileActivities)) {
        console.error('Dosya sisteminden alınan aktiviteler bir dizi değil:', fileActivities);
        return NextResponse.json({
          error: 'Aktivite verisi doğru formatta değil'
        }, { status: 500 });
      }
      
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