'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hatayı loglama işlemi
    console.error('Sayfa hatası:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Bir Sorun Oluştu</h2>
        <p className="text-gray-700 mb-4">
          Özür dileriz, sayfa yüklenirken beklenmeyen bir sorunla karşılaştık.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
            <p className="font-mono text-sm text-gray-800">{error.message}</p>
            {error.digest && <p className="font-mono text-sm text-gray-600 mt-2">Digest: {error.digest}</p>}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Link 
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white text-center font-bold py-2 px-4 rounded"
          >
            Ana Sayfaya Dön
          </Link>
          <button
            onClick={
              // Sayfayı sıfırlamayı dene
              () => reset()
            }
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    </div>
  );
}