import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { locales, Locale } from "../lib/i18n";
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}