import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Bu rotanın statik olarak oluşturulmasını engelle
export const dynamic = 'force-dynamic';

// Bu API endpoint'i, tüm sayfa önbelleklerini temizler
// Admin panelinden yapılan değişiklikler sonrası çağrılır
export async function GET(request: NextRequest) {
  try {
    console.log('Önbellek temizleme isteği alındı.');
    
    // URL'den temizlenecek yolları al
    const searchParams = request.nextUrl.searchParams;
    const paths = searchParams.getAll('path');
    const tags = searchParams.getAll('tag');
    
    console.log('Temizlenecek yollar:', paths.length ? paths : 'Tümü');
    console.log('Temizlenecek etiketler:', tags);
    
    // Belirli yollar varsa onları temizle
    if (paths.length > 0) {
      for (const path of paths) {
        try {
          console.log(`"${path}" yolu yeniden doğrulanıyor...`);
          revalidatePath(path);
        } catch (error) {
          console.error(`"${path}" yolu yeniden doğrulanırken hata:`, error);
        }
      }
    } else {
      // Belirli bir yol belirtilmemişse, tüm siteyi temizle
      console.log('Tüm site yeniden doğrulanıyor...');
      revalidatePath('/', 'layout'); // Tüm site layoutunu yeniden doğrula
    }
    
    // Belirli etiketler varsa onları temizle
    if (tags.length > 0) {
      for (const tag of tags) {
        try {
          console.log(`"${tag}" etiketi yeniden doğrulanıyor...`);
          revalidateTag(tag);
        } catch (error) {
          console.error(`"${tag}" etiketi yeniden doğrulanırken hata:`, error);
        }
      }
    }
    
    return NextResponse.json({
      revalidated: true,
      date: new Date().toISOString(),
      message: 'Önbellek başarıyla temizlendi.'
    });
  } catch (error) {
    console.error('Önbellek temizleme hatası:', error);
    return NextResponse.json({
      revalidated: false,
      date: new Date().toISOString(),
      message: 'Önbellek temizleme hatası.',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
