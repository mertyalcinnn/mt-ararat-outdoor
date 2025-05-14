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
    
    if (pathToRevalidate) {
      console.log(`Belirtilen path yenileniyor: ${pathToRevalidate}`);
      revalidatePath(pathToRevalidate);
    } else {
      // Tüm site sayfalarını yenilemek için anasayfayı ve layout'u yenile
      console.log('Tüm site yenileniyor...');
      revalidatePath('/', 'layout');
      
      // Ayrıca dil-spesifik sayfaları da yenile
      revalidatePath('/tr', 'page');
      revalidatePath('/en', 'page');
      revalidatePath('/ru', 'page');
      
      // Aktiviteler sayfasını yenile
      revalidatePath('/tr/activities', 'page');
      revalidatePath('/en/activities', 'page');
      revalidatePath('/ru/activities', 'page');
      
      // Tüm aktivite detay sayfalarını yenile
      // Not: Bu her aktivite için ayrı ayrı çağrılmalıydı, ancak toplu revalidatePath yeterli olacaktır
      revalidatePath('/tr/activities/[slug]', 'page');
      revalidatePath('/en/activities/[slug]', 'page');
      revalidatePath('/ru/activities/[slug]', 'page');
    }
    
    console.log('Revalidation tamamlandı!');
    
    return NextResponse.json({
      revalidated: true,
      message: 'Sayfalar yeniden oluşturulacak',
      path: pathToRevalidate || 'all',
      date: new Date().toISOString()
    });}
  } catch (err) {
    // Hata durumunda
    return NextResponse.json({
      revalidated: false,
      message: 'Yeniden oluşturma sırasında hata oluştu',
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}