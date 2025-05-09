import { NextRequest, NextResponse } from 'next/server';
import { locales } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  // Gelen isteğin URL bilgilerini alıyoruz
  const pathname = request.nextUrl.pathname;
  
  // Admin sayfası ve API kontrolü - dil kodlarına gerek yok
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Basic Auth için credentials kontrolü
    const basicAuth = request.headers.get('authorization');
    
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      
      // Kullanıcı adı ve şifre kontrolü
      if (user === 'admin' && pwd === 'mtararat2025') {
        return NextResponse.next();
      }
    }
    
    // Yetkilendirme başarısızsa, Basic Auth popup'ı tetikleyin
    return new NextResponse('Yetkilendirme gerekiyor', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Mt.Ararat Admin"',
      },
    });
  }
  
  // Admin veya API istekleri değilse, dil yönlendirmesi yap
  
  // Çok dilli yapı için yönlendirme kontrolü
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // Eğer URL'de zaten bir dil tanımı varsa herhangi bir şey yapmıyoruz
  if (pathnameHasLocale) return;
  
  // Statik dosyalar ve API'ler için dil yönlendirmesi yok
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Kullanıcının tercih ettiği dili al
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
    // Admin ve API endpointlerini korumak için
    '/admin/:path*',
    '/api/admin/:path*',
    // Diğer tüm sayfalar için dil kontrolü
    '/:path*',
  ],
};