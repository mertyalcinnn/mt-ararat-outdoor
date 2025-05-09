import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mt.Ararat Outdoor Adventures',
  description: 'Ağrı Dağı ve çevresinde outdoor aktiviteleri: kayak turu, tırmanış, deniz kaynağı, SUP ve doğa yürüyüşleri.',
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