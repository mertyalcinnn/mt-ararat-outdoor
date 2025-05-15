/**
 * generateStaticParams fonksiyonu, Next.js'e statik oluşturma için
 * hangi parametrelerin kullanılacağını bildirir.
 * 
 * API rotaları için buna genellikle gerek yoktur, ancak output: 'export' yapılandırmasıyla
 * kullanıldığında Next.js bunu gerektirir.
 */
"use server";

export async function generateStaticParams() {
  try {
    // Boş bir dizi dönüyoruz, çünkü API rotaları dinamik olarak çalışacak
    // Vercel'de statik derleme aşamasında yalnızca bir kontrol görevi görür
    return [];
  } catch (error) {
    console.error('API statik parametre oluşturma hatası:', error);
    return [];
  }
}
