'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApiDebugPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [debug, setDebug] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Admin girişini kontrol et
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }

    // API isteği yap
    const checkApi = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Aktivite dosyalarını kontrol et
        const response = await fetch('/api/admin/debug', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 0 } // Next.js 14+ için cache kontrolü
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        setDebug(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Debug API çağrısı sırasında hata:', err);
        setError(err instanceof Error ? err.message : 'API isteği sırasında bir hata oluştu');
        setIsLoading(false);
      }
    };

    checkApi();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">API ve Dosya Sistemi Debug</h1>
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Dashboard'a Dön
        </button>
      </div>

      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Hata</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded"
          >
            Yeniden Dene
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dosya Sistemi Bilgileri */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-blue-600 text-white font-bold">
              Dosya Sistemi
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3">Aktivite Dizinleri</h2>
              <div className="space-y-4">
                {debug?.directories?.map((dir: any, index: number) => (
                  <div key={index} className="border p-3 rounded">
                    <p className="font-medium text-gray-800">{dir.path}</p>
                    <div className="mt-2 flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${dir.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {dir.exists ? 'Mevcut' : 'Bulunamadı'}
                      </span>
                      {dir.canWrite !== undefined && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${dir.canWrite ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {dir.canWrite ? 'Yazılabilir' : 'Yazılamaz'}
                        </span>
                      )}
                    </div>
                    {dir.files && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Dosyalar ({dir.files.length}):</p>
                        <ul className="text-xs text-gray-500 ml-5 list-disc">
                          {dir.files.slice(0, 5).map((file: string, fileIndex: number) => (
                            <li key={fileIndex}>{file}</li>
                          ))}
                          {dir.files.length > 5 && <li>...ve {dir.files.length - 5} dosya daha</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* API Bilgileri */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-green-600 text-white font-bold">
              API Endpoints
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3">Erişilebilir API'ler</h2>
              <div className="space-y-4">
                {debug?.endpoints?.map((endpoint: any, index: number) => (
                  <div key={index} className="border p-3 rounded">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-800">{endpoint.path}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${endpoint.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {endpoint.exists ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Metot:</span> {endpoint.method}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Önbellek Temizleme */}
          <div className="bg-white rounded-lg shadow overflow-hidden col-span-1 md:col-span-2">
            <div className="p-4 bg-purple-600 text-white font-bold">
              Önbellek Temizleme
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3">Sitenin Önbelleğini Temizle</h2>
              <p className="text-gray-600 mb-4">
                Admin panelinden yaptığınız değişikliklerin siteye yansıması için önbelleği temizlemeniz gerekebilir.
                Bu işlem, tüm önbelleği sıfırlar ve sayfaları yeniden oluşturur.
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/revalidate?path=/');
                      if (response.ok) {
                        const data = await response.json();
                        alert('Önbellek temizlendi! ' + JSON.stringify(data));
                      } else {
                        alert('Önbellek temizleme hatası: ' + response.status);
                      }
                    } catch (error) {
                      alert('Hata: ' + (error instanceof Error ? error.message : String(error)));
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                >
                  Tüm Siteyi Temizle
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/revalidate?path=/tr/activities&path=/en/activities&path=/ru/activities');
                      if (response.ok) {
                        const data = await response.json();
                        alert('Aktiviteler temizlendi! ' + JSON.stringify(data));
                      } else {
                        alert('Temizleme hatası: ' + response.status);
                      }
                    } catch (error) {
                      alert('Hata: ' + (error instanceof Error ? error.message : String(error)));
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Sadece Aktiviteleri Temizle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}