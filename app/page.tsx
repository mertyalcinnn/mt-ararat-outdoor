"use client";

import Link from 'next/link';

// Bu sayfa dynamic olarak işaretleniyor
export const dynamic = 'force-dynamic';

// Bu sayfa, kök dizin (/) için bir yönlendirme sayfası sağlar
export default function RootPage() {
  // Next.js 13 ile redirect komponenı direkt olarak render edilemiyor
  // Bu nedenle bir yönlendirme sayfası gösteriyoruz
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <main className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Mt. Ararat Outdoor Adventures</h1>
        
        <p className="mb-8 text-lg">Lütfen bir dil seçin / Please select a language / Пожалуйста, выберите язык</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/tr" 
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Türkçe
          </Link>
          
          <Link 
            href="/en" 
            className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            English
          </Link>
          
          <Link 
            href="/ru" 
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Русский
          </Link>
        </div>
      </main>
    </div>
  );
}