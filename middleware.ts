import { NextRequest, NextResponse } from 'next/server';
import { locales } from './lib/i18n';

// Tarayıcı dil tercihini almak için yardımcı fonksiyon
function getLocaleFromHeaders(req: NextRequest) {
  // Accept-Language başlığını al ve dilleri ayır
  const acceptLanguage = req.headers.get('accept-language') || '';
  const preferredLocales = acceptLanguage
    .split(',')
    .map(locale => locale.split(';')[0].trim());

  // Desteklediğimiz dillerle eşleşen ilk dili bul
  for (const preferredLocale of preferredLocales) {
    const locale = preferredLocale.split('-')[0]; // "en-US" gibi bir dil kodundan sadece "en" kısmını al
    
    if (locales.includes(locale as any)) {
      return locale;
    }
  }
  
  // Eşleşme yoksa varsayılan dil olarak "tr" döndür
  return 'tr';
}

// Next.js middleware fonksiyonu
export function middleware(req: NextRequest) {
  // Geçerli URL'yi al
  const pathname = req.nextUrl.pathname;
  
  // Eğer admin sayfalarına erişiliyorsa, yönlendirme yapma
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Root URL'ye erişiliyorsa, tarayıcı diline göre yönlendirme yap
  if (pathname === '/') {
    const locale = getLocaleFromHeaders(req);
    const url = new URL(`/${locale}`, req.url);
    return NextResponse.redirect(url);
  }
  
  // Zaten dil prefix'i varsa, bir şey yapma
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return NextResponse.next();
    }
  }
  
  // Hiçbir dil prefix'i yoksa ve root URL değilse, varsayılan dile yönlendir
  const locale = getLocaleFromHeaders(req);
  const url = new URL(`/${locale}${pathname}`, req.url);
  return NextResponse.redirect(url);
}

// Middleware config
export const config = {
  matcher: [
    // Statik dosyaları, API'leri ve next.js dahili dosyaları hariç tut
    // uploads dizini için de bir istisna ekleyelim
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts|uploads|.*\\.svg$).*)',
  ],
};