'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HomepageData {
  title: string;
  description: string;
  heroImage: string;
  content: string;
}

export default function HomepagePage() {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Ana sayfa verilerini yükle
    fetch('/api/admin/homepage')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setHomepageData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching homepage data:', err);
        setError('Ana sayfa verileri yüklenirken bir hata oluştu');
        setIsLoading(false);
      });
  }, []);

  const handleInputChange = (field: keyof HomepageData, value: string) => {
    if (!homepageData) return;
    
    setHomepageData({
      ...homepageData,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!homepageData) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(homepageData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bilinmeyen bir hata oluştu');
      }
      
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3">Ana sayfa verileri yükleniyor...</p>
      </div>
    );
  }

  if (error && !homepageData) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
        <p className="font-bold">Hata</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  if (!homepageData) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
        <p>Ana sayfa verisi bulunamadı</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ana Sayfa İçeriği</h1>
          <p className="text-sm text-gray-600">Site ana sayfası içeriğini düzenle</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <a
            href="/"
            target="_blank"
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            <i className="fas fa-eye mr-1"></i> Ana Sayfayı Görüntüle
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Hata</p>
          <p>{error}</p>
        </div>
      )}

      {lastSaved && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <i className="fas fa-check-circle mr-1"></i> Son kaydetme: {lastSaved}
        </div>
      )}

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Sayfa Başlığı
                </label>
                <input
                  type="text"
                  id="title"
                  value={homepageData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Sayfa Açıklaması (Meta Description)
                </label>
                <textarea
                  id="description"
                  value={homepageData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Bu açıklama, arama motorlarında sitenizin açıklaması olarak görünecektir.
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Ana Sayfa İçeriği
                </label>
                <textarea
                  id="content"
                  value={homepageData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Ana Görsel URL
                </label>
                <input
                  type="text"
                  id="heroImage"
                  value={homepageData.heroImage}
                  onChange={(e) => handleInputChange('heroImage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Ana sayfada gösterilecek büyük görsel (örn: /images/hero-image.jpg)
                </p>
              </div>
              
              {homepageData.heroImage && (
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={homepageData.heroImage} 
                    alt="Hero Image Preview" 
                    className="w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Görsel+Yüklenemedi';
                    }}
                  />
                  <div className="p-3 bg-gray-50 text-sm text-gray-500">
                    Hero Görsel Önizleme
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 text-white rounded transition-colors ${
              isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-1"></i> Kaydediliyor...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-1"></i> Değişiklikleri Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}