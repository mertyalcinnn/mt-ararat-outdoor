import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { locales, Locale } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mt.Ararat Outdoor Adventures',
  description: 'Ağrı Dağı ve çevresinde outdoor aktiviteleri: kayak turu, tırmanış, deniz kaynağı, SUP ve doğa yürüyüşleri.',
};

export function generateStaticParams() {
  return locales.map(locale => ({ lang: locale }));
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={params.lang}>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header lang={params.lang} />
          <main className="flex-grow">
            {children}
          </main>
          <Footer lang={params.lang} />
        </div>
      </body>
    </html>
  );
}