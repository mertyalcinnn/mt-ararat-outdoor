'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-blue-800 text-white shadow">
            <div className="container mx-auto py-4 px-6 flex justify-between items-center">
              <h1 className="text-xl font-bold">Mt.Ararat Admin</h1>
              <nav>
                <ul className="flex space-x-4">
                  <li>
                    <Link href="/admin" className="hover:underline">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <a href="/" className="hover:underline" target="_blank">
                      Siteyi Görüntüle
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </header>
          
          <main className="flex-grow">
            {children}
          </main>
          
          <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto px-6 text-center">
              <p>&copy; {new Date().getFullYear()} Mt.Ararat Outdoor Admin Panel</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}