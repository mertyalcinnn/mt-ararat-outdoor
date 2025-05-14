import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Bu endpoint gelişmiş revalidation işlemlerini yapacak
export async function GET(request: NextRequest) {
  try {
    // Öncelikle Next.js'in tüm önbelleğini temizleyelim
    try {
      revalidateTag('activities'); // Eğer tag önbelleği oluşturduysanız
    } catch (tagError) {
      console.error('Tag revalidation hatası:', tagError);
    }
    
    // Eğer sitede sayfalar doğru yüklenmediyse, özel revalidate işlemleri
    const paths = [
      '/',
      '/tr', 
      '/en', 
      '/ru',
      '/tr/activities',
      '/en/activities',
      '/ru/activities',
    ];
    
    // Tüm önemli yolları yenileyelim
    for (const path of paths) {
      try {
        console.log(`${path} yolu yenileniyor...`);
        revalidatePath(path);
      } catch (pathError) {
        console.error(`${path} yenilenemedi:`, pathError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      revalidated: true,
      message: 'Tüm sayfalar manuel olarak yenilendi.',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}