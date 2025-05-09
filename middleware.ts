import { NextRequest, NextResponse } from 'next/server';
import { locales } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  // Gelen isteğin URL bilgilerini alıyoruz
  const pathname = request.nextUrl.pathname;
  
  // Şu anki dilin kontrolü; URL'in başında bir dil kodu var mı?
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // Eğer URL'de zaten bir dil tanımı varsa herhangi bir şey yapmıyoruz
  if (pathnameHasLocale) return;
  
  // Kullanıcının tercih ettiği dili header'dan alalım (tarayıcı ayarları)
  const acceptLanguage = request.headers.get('accept-language');
  let locale: string = 'tr'; // Varsayılan olarak Türkçe
  
  // Kullanıcının tercih ettiği dili kontrol edelim
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0]
      .toLowerCase();
    
    // Eğer desteklediğimiz dillerden biriyse, o dili kullan
    if (locales.includes(preferredLocale as any)) {
      locale = preferredLocale;
    }
  }
  
  // Yeni URL oluşturup kullanıcıyı yönlendirelim
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

// İşlenecek URL'leri belirleyelim
export const config = {
  matcher: [
    // Şu URL'leri işleme: /api/* veya /_ ile başlayan veya
    // . içeren URL'leri (statik dosyalar) işlemeyelim
    '/((?!api|_next/static|_next/image|images|favicon.ico|.well-known).*)',
  ],
};