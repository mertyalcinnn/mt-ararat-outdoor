'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Activity {
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  gallery: string[];
  duration: string;
  difficultyLevel: string;
  includedServices: string[];
  contactWhatsapp: string;
  featured: boolean;
}

export default function EditActivityPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Admin girişini kontrol et
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }

    // Aktiviteyi yükle
    setIsLoading(true);
    fetch(`/api/admin/activities/${slug}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setActivity(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching activity:', err);
        setError('Aktivite yüklenirken bir hata oluştu');
        setIsLoading(false);
      });
  }, [slug, router]);

  const handleInputChange = (field: keyof Activity, value: any) => {
    if (!activity) return;
    
    setActivity({
      ...activity,
      [field]: value
    });
  };

  const handleArrayChange = (
    field: 'includedServices' | 'gallery', 
    idx: number, 
    value: string
  ) => {
    if (!activity) return;
    const newArray = [...activity[field]];
    newArray[idx] = value;
    setActivity({
      ...activity,
      [field]: newArray
    });
  };
  
  const addArrayItem = (field: 'includedServices' | 'gallery', defaultValue = '') => {
    if (!activity) return;
    setActivity({
      ...activity,
      [field]: [...activity[field], defaultValue]
    });
  };
  
  const removeArrayItem = (field: 'includedServices' | 'gallery', idx: number) => {
    if (!activity) return;
    const newArray = [...activity[field]];
    newArray.splice(idx, 1);
    setActivity({
      ...activity,
      [field]: newArray
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activity) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/activities/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });
      
      if (response.ok) {
        alert('Aktivite başarıyla güncellendi!');
        router.push('/admin/dashboard/activities');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bilinmeyen bir hata oluştu');
      }
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
        <p className="ml-3 text-gray-600">Aktivite yükleniyor...</p>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="font-bold">Hata</p>
          <p>{error}</p>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded"
            >
              Yeniden Dene
            </button>
            <button 
              onClick={() => router.push('/admin/dashboard/activities')} 
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-4 rounded"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>Aktivite bulunamadı</p>
          <button 
            onClick={() => router.push('/admin/dashboard/activities')} 
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
          >
            Aktiviteler Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{activity.title} - Düzenle</h1>
        <div className="flex space-x-3">
          <Link 
            href={`/tr/activities/${activity.slug}`}
            target="_blank" 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            Önizleme
          </Link>
          
          <button 
            onClick={() => router.push('/admin/dashboard/activities')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            İptal
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="font-bold">Hata</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Başlık:</label>
                <input
                  type="text"
                  value={activity.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Slug:</label>
                <input
                  type="text"
                  value={activity.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">URL için benzersiz tanımlayıcı</p>
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Açıklama:</label>
                <textarea
                  value={activity.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Kapak Görseli:</label>
                <input
                  type="text"
                  value={activity.coverImage}
                  onChange={(e) => handleInputChange('coverImage', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  placeholder="/images/your-image.jpg"
                />
                {activity.coverImage && (
                  <div className="mt-2 border border-gray-200 p-2 rounded">
                    <img 
                      src={activity.coverImage}
                      alt="Kapak görseli önizleme"
                      className="h-32 w-auto object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/150?text=Görsel+Yok";
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Süre:</label>
                <input
                  type="text"
                  value={activity.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  placeholder="Örn: 2 gün 1 gece"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Zorluk Seviyesi:</label>
                <select
                  value={activity.difficultyLevel}
                  onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                >
                  <option value="Kolay">Kolay</option>
                  <option value="Orta">Orta</option>
                  <option value="Zor">Zor</option>
                  <option value="Çok Zor">Çok Zor</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 font-medium">WhatsApp İletişim:</label>
                <input
                  type="text"
                  value={activity.contactWhatsapp}
                  onChange={(e) => handleInputChange('contactWhatsapp', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                  placeholder="+905001234567"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={activity.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="h-5 w-5 text-blue-600"
                />
                <label htmlFor="featured" className="font-medium">Öne Çıkan Aktivite</label>
              </div>
            </div>
            
            {/* İçerik */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">İçerik (Markdown):</label>
                <textarea
                  value={activity.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded font-mono"
                  rows={20}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Markdown formatında içerik</p>
              </div>
            </div>
          </div>
          
          {/* Dahil Olan Hizmetler */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">Dahil Olan Hizmetler:</label>
              <button 
                type="button"
                onClick={() => addArrayItem('includedServices')}
                className="bg-green-500 hover:bg-green-700 text-white text-sm px-2 py-1 rounded"
              >
                + Hizmet Ekle
              </button>
            </div>
            
            {activity.includedServices.map((service, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={service}
                  onChange={(e) => handleArrayChange('includedServices', idx, e.target.value)}
                  className="flex-grow border border-gray-300 p-2 rounded"
                />
                <button 
                  type="button"
                  onClick={() => removeArrayItem('includedServices', idx)}
                  className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
          
          {/* Galeri Görselleri */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium">Galeri Görselleri:</label>
              <button 
                type="button"
                onClick={() => addArrayItem('gallery', '/images/')}
                className="bg-green-500 hover:bg-green-700 text-white text-sm px-2 py-1 rounded"
              >
                + Görsel Ekle
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activity.gallery.map((image, idx) => (
                <div key={idx} className="border border-gray-200 p-3 rounded">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => handleArrayChange('gallery', idx, e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded mb-2"
                    placeholder="/images/gallery-image.jpg"
                  />
                  {image && (
                    <div className="mb-2 border border-gray-200 p-2 rounded">
                      <img 
                        src={image}
                        alt={`Galeri görseli ${idx + 1}`}
                        className="h-24 w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/150?text=Görsel+Yok";
                        }}
                      />
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => removeArrayItem('gallery', idx)}
                    className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded w-full"
                  >
                    Bu Görseli Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Kaydet Butonları */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button 
              type="button" 
              onClick={() => router.push('/admin/dashboard/activities')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              disabled={isSaving}
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Kaydediliyor...
                </>
              ) : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}