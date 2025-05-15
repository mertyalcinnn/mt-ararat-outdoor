// REMOVED "use client" - this must be a Server Component to export metadata

// REMOVED "use client" - this must be a Server Component to export metadata

// REMOVED "use client" - this must be a Server Component to export metadata

// REMOVED "use client" - this must be a Server Component to export metadata 

import { Poppins } from 'next/font/google';
import Script from 'next/script';
import { Metadata } from 'next';
import '../globals.css';

// Poppins fontunu kullan (Inter yerine) - daha modern görünüm için
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Admin Panel | Mt. Ararat Outdoor',
  description: 'Mt. Ararat Outdoor Adventures yönetim paneli',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js" 
        strategy="afterInteractive"
      />
      <div className={`${poppins.className} bg-slate-50 min-h-screen text-slate-800`}>
        {children}
      </div>
    </>
  );
}