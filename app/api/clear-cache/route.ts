import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Bu endpoint, MongoDB ve JSON dosyalarındaki verilerin uyumunu sağlar
export async function GET(request: NextRequest) {
  try {
    // URL parametresi olarak path alıp sadece belirli bir sayfayı yenileyebiliriz
    const path = request.nextUrl.searchParams.get('path') || '/';
    
    // Revalidation işlemleri
    console.log(`${path} yolu için cache temizleniyor...`);
    
    try {
      if (path === '/') {
        // Tüm dil sayfalarını yenile
        revalidatePath('/', 'layout');
        
        ['tr', 'en', 'ru'].forEach(lang => {
          revalidatePath(`/${lang}`, 'page');
          revalidatePath(`/${lang}/activities`, 'page');
        });
        
        console.log('Tüm sayfalar yenilendi!');
      } else {
        // Sadece belirtilen sayfayı yenile
        revalidatePath(path);
        console.log(`${path} sayfası yenilendi!`);
      }
      
      return NextResponse.json({
        success: true,
        path,
        message: `Cache temizlendi: ${path}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        path,
        error: `Cache temizlenirken hata: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Beklenmedik hata: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}