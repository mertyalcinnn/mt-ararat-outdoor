'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UploadsDebugPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/debug/uploads');
        
        if (!response.ok) {
          throw new Error(`API yanıtı başarısız: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Debug API yanıtı:', data);
        setFiles(data.files || []);
      } catch (err) {
        console.error('Hata:', err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return 'Geçersiz tarih';
    }
  };

  // Url'yi farklı formatlarda deneyen fonksiyon
  const tryDifferentPaths = (filename: string) => {
    return [
      `/uploads/${filename}`,
      `/tr/uploads/${filename}`,
      `${window.location.origin}/uploads/${filename}`,
      `${window.location.origin}/tr/uploads/${filename}`
    ];
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Upload Debug Sayfası</h1>
        <p className="text-gray-600">Yüklenen görselleri ve erişim yollarını test edin</p>
      </div>
      
      <button 
        onClick={() => router.push('/admin/dashboard')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        Admin Paneline Dön
      </button>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Hata:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Bulunan Dosyalar ({files.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-3 px-4 text-left">Dosya Adı</th>
                  <th className="py-3 px-4 text-left">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {files.map((file, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{file}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-3">
                        {tryDifferentPaths(file).map((path, pathIndex) => (
                          <div key={pathIndex} className="flex items-center space-x-2">
                            <a 
                              href={path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              {path}
                            </a>
                            <img 
                              src={path} 
                              alt={`Önizleme ${pathIndex}`}
                              className="h-8 w-8 object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.border = '1px solid red';
                              }}
                              onLoad={(e) => {
                                const target = e.currentTarget;
                                target.style.border = '1px solid green';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {files.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 px-4 text-center text-gray-500">
                      Hiç dosya bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}