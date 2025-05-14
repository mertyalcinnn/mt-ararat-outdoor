import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Bu API endpoint'i, Next.js önbelleğini temizler
export async function GET(request: NextRequest) {
  try {
    console.log('Revalidate API çağrıldı', new Date().toISOString());
    
    // Optional olarak: API güvenliği için bir anahtar kontrolü
    const secret = request.nextUrl.searchParams.get('secret');
    const configuredSecret = process.env.REVALIDATION_SECRET;
    
    if (configuredSecret && secret !== configuredSecret) {
      console.log('Revalidation secret uyumsuz!');
      return NextResponse.json({ 
        revalidated: false,
        message: 'Invalid token'
      }, { status: 401 });
    }
    
    // Belirli bir path parametresi alabilir
    const pathToRevalidate = request.nextUrl.searchParams.get('path');
    
    console.log('REVALIDATE API ÇALIŞIYOR - ÖNBELLEKLER TEMİZLENİYOR!', new Date().toISOString());
    
    if (pathToRevalidate) {
      console.log(`Belirtilen path yenileniyor: ${pathToRevalidate}`);
      // "Error: dynamic route parameters not found" hatasını önlemek için try/catch içinde çağırıyoruz
      try {
        revalidatePath(pathToRevalidate);
        console.log(`Başarılı revalidatePath: ${pathToRevalidate}`);
      } catch (pathError) {
        console.error(`Path yenilenirken hata: ${pathToRevalidate}`, pathError);
      }
    } else {
      // Tüm site sayfalarını yenilemek için anasayfayı ve layout'u yenile
      console.log('Tüm site yenileniyor...');
      
      try {
        revalidatePath('/', 'layout');
        console.log('Ana layout yenilendi: /');
      } catch (layoutError) {
        console.error('Layout yenilenirken hata:', layoutError);
      }
      
      // Ayrıca dil-spesifik sayfaları da yenile
      const langs = ['tr', 'en', 'ru'];
      
      for (const lang of langs) {
        // Ana sayfaları yenile
        try {
          revalidatePath(`/${lang}`, 'page');
          console.log(`Dil sayfası yenilendi: /${lang}`);
        } catch (langError) {
          console.error(`Dil sayfası yenilenirken hata: /${lang}`, langError);
        }
        
        // Aktiviteler sayfasını yenile
        try {
          revalidatePath(`/${lang}/activities`, 'page');
          console.log(`Aktiviteler sayfası yenilendi: /${lang}/activities`);
        } catch (activitiesError) {
          console.error(`Aktiviteler sayfası yenilenirken hata: /${lang}/activities`, activitiesError);
        }
      }
      
      // Aktivite detay sayfaları için yenileme
      try {
        // Bu yenileme, tüm aktivite detay sayfalarını yeniden oluşturmaya yardımcı olacaktır
        revalidatePath('/tr/activities/[slug]', 'page');
        revalidatePath('/en/activities/[slug]', 'page');
        revalidatePath('/ru/activities/[slug]', 'page');
        console.log('Tüm aktivite detay sayfaları yenilendi');
      } catch (detailError) {
        console.error('Aktivite detay sayfaları yenilenirken hata:', detailError);
      }
    }
    
    console.log('Revalidation tamamlandı!', new Date().toISOString());
    
    return NextResponse.json({
      revalidated: true,
      message: 'Sayfalar yeniden oluşturulacak',
      path: pathToRevalidate || 'all',
      date: new Date().toISOString()
    });
  } catch (err) {
    // Hata durumunda
    console.error('Revalidation sırasında hata oluştu:', err);
    return NextResponse.json({
      revalidated: false,
      message: 'Yeniden oluşturma sırasında hata oluştu',
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}