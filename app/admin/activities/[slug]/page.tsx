'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdvancedImageUploader from '@/components/AdvancedImageUploader';

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
  const router = useRouter();
  const { slug } = params;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Aktivite verilerini yükleyin
    fetch(`/api/admin/activities/${slug}`)
      .then(res => res.json())
      .then(data => {
        // Eğer aktivitenin gallery özelliği yoksa, boş bir dizi ile başlat
        if (!data.gallery) {
          data.gallery = [];
        }
        setActivity(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Aktivite yüklerken hata:", err);
        setIsLoading(false);
      });
  }, [slug]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;
    
    setIsSaving(true);
    
    try {
      // Değişiklikleri API'ye gönderin
      const response = await fetch(`/api/admin/activities/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.revalidated) {
          alert('Aktivite başarıyla güncellendi ve site önbelleği temizlendi!');
        } else {
          alert('Aktivite başarıyla güncellendi, ancak site önbelleği temizlenemedi. Değişiklikler birkaç dakika içinde sitede görünecektir.');
        }
        
        router.push('/admin/dashboard/activities');
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.error || 'Bilinmeyen bir hata oluştu'}`);
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Bir hata oluştu!');
    } finally {
      setIsSaving(false);
    }
  };
  
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
  
  if (isLoading) return (
    <div className="container mx-auto p-6 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-2">Yükleniyor...</p>
    </div>
  );
  
  if (!activity) return (
    <div className="container mx-auto p-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Aktivite bulunamadı</p>
        <button 
          onClick={() => router.push('/admin/dashboard/activities')}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Admin Panele Dön
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Aktivite Düzenle: {activity.title}</h1>
        <button 
          onClick={() => router.push('/admin/dashboard/activities')}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Geri Dön
        </button>
      </div>
      
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
                <AdvancedImageUploader
                  onImageSelect={(url) => handleInputChange('coverImage', url)}
                  currentImageUrl={activity.coverImage}
                  label="Kapak Görseli"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Süre:</label>
                <input
                  type="text"
                  value={activity.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
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
                  value={activity.contactWhatsapp || ''}
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
                onClick={() => addArrayItem('gallery', '')}
                className="bg-green-500 hover:bg-green-700 text-white text-sm px-2 py-1 rounded"
              >
                + Görsel Ekle
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activity.gallery.map((image, idx) => (
                <div key={idx} className="border border-gray-200 p-3 rounded">
                  <AdvancedImageUploader
                    onImageSelect={(url) => handleArrayChange('gallery', idx, url)}
                    currentImageUrl={image}
                    label={`Galeri Görseli ${idx + 1}`}
                  />
                  <button 
                    type="button"
                    onClick={() => removeArrayItem('gallery', idx)}
                    className="mt-2 bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded w-full"
                  >
                    Bu Görseli Kaldır
                  </button>
                </div>
              ))}
              
              {activity.gallery.length === 0 && (
                <div className="border border-dashed border-gray-300 p-6 rounded flex flex-col items-center justify-center text-gray-500">
                  <p>Henüz galeri görseli eklenmemiş</p>
                  <button 
                    type="button"
                    onClick={() => addArrayItem('gallery', '')}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    İlk Görseli Ekle
                  </button>
                </div>
              )}
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
              ) : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}