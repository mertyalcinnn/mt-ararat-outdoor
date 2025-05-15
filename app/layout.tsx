// REMOVED "use client" - this must be a Server Component to export metadata

// REMOVED "use client" - this must be a Server Component to export metadata

// REMOVED "use client" - this must be a Server Component to export metadata

// REMOVED "use client" - this must be a Server Component to export metadata

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "../config/site";

// ÜST DÜZEY DYNAMIC EXPORT KALDIRILDI - KRİTİK API ROTALARINA TAŞINDI
// export const dynamic = 'force-dynamic';

// Font yükleme hata yönetimi ile
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',  // Font yüklenene kadar sistem fontu göster
  fallback: ['system-ui', 'Arial', 'sans-serif'],  // Fallback fontlar
  adjustFontFallback: true  // Otomatik en iyi fallback seç
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: siteConfig.favicon,
  },
};

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params?: { lang?: string };
}) {
  // Dil parametresini al veya varsayılan olarak 'tr' kullan
  const lang = params?.lang || 'tr';
  
  return (
    <html lang={lang}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}