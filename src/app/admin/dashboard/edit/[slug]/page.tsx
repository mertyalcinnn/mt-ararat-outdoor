'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    // Oturum kontrolü
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }

    // Aktiviteyi yükle
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
        setError('Aktivite yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setIsLoading(false);
      });
  }, [router, slug]);

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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bilinmeyen bir hata oluştu');
      }
      
      alert('Aktivite başarıyla kaydedildi!');
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Yükleniyor...</p>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Hata</p>
          <p>{error}</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded mr-2"
            >
              Yeniden Dene
            </button>
            <button 
              onClick={() => router.push('/admin/dashboard')} 
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
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>Aktivite bulunamadı</p>
          <button 
            onClick={() => router.push('/admin/dashboard')} 
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Aktivite Düzenle: {activity.title}</h1>
        <button
          onClick={handleCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
        >
          Geri Dön
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Hata</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol Kolon */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Başlık</label>
              <input
                type="text"
                value={activity.title}
                onChange={e => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Slug</label>
              <input
                type="text"
                value={activity.slug}
                onChange={e => handleInputChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">URL için benzersiz tanımlayıcı</p>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Açıklama</label>
              <textarea
                value={activity.description}
                onChange={e => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Kapak Görseli</label>
              <input
                type="text"
                value={activity.coverImage}
                onChange={e => handleInputChange('coverImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Süre</label>
              <input
                type="text"
                value={activity.duration}
                onChange={e => handleInputChange('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Zorluk Seviyesi</label>
              <select
                value={activity.difficultyLevel}
                onChange={e => handleInputChange('difficultyLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Kolay">Kolay</option>
                <option value="Orta">Orta</option>
                <option value="Zor">Zor</option>
                <option value="Çok Zor">Çok Zor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">WhatsApp İletişim</label>
              <input
                type="text"
                value={activity.contactWhatsapp || ''}
                onChange={e => handleInputChange('contactWhatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+905001234567"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={activity.featured}
                onChange={e => handleInputChange('featured', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-gray-700">Öne Çıkan Aktivite</label>
            </div>
          </div>
          
          {/* Sağ Kolon */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">İçerik (Markdown)</label>
              <textarea
                value={activity.content}
                onChange={e => handleInputChange('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                rows={10}
                required
              />
            </div>
            
            {/* Dahil Olan Hizmetler */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 font-medium">Dahil Olan Hizmetler</label>
                <button 
                  type="button"
                  onClick={() => addArrayItem('includedServices')}
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  + Ekle
                </button>
              </div>
              {activity.includedServices.map((service, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={service}
                    onChange={e => handleArrayChange('includedServices', index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="button"
                    onClick={() => removeArrayItem('includedServices', index)}
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
            
            {/* Galeri Görselleri */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 font-medium">Galeri Görselleri</label>
                <button 
                  type="button"
                  onClick={() => addArrayItem('gallery', '/images/')}
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  + Ekle
                </button>
              </div>
              {activity.gallery.map((image, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={image}
                    onChange={e => handleArrayChange('gallery', index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="button"
                    onClick={() => removeArrayItem('gallery', index)}
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded mr-2 hover:bg-gray-400"
            disabled={isSaving}
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Kaydediliyor...
              </>
            ) : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
