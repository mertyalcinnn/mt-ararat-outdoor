'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdvancedImageUploader from '@/components/AdvancedImageUploader';

interface NewActivity {
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

export default function NewActivityPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activity, setActivity] = useState<NewActivity>({
    title: '',
    slug: '',
    description: '',
    content: `# Aktivite Hakkında

Aktivitenin detaylı açıklaması buraya girilecek. Bu alan Markdown formatını destekler.

## Detaylar

- Madde 1
- Madde 2
- Madde 3

## Rota

1. Başlangıç noktası
2. Ara nokta
3. Bitiş noktası`,
    coverImage: '',
    gallery: ['', ''],
    duration: '',
    difficultyLevel: 'Orta',
    includedServices: ['Profesyonel rehberlik', 'Ekipman', 'Ulaşım'],
    contactWhatsapp: '',
    featured: false
  });
  
  const handleInputChange = (field: keyof NewActivity, value: any) => {
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
    const newArray = [...activity[field]];
    newArray[idx] = value;
    setActivity({
      ...activity,
      [field]: newArray
    });
  };
  
  const addArrayItem = (field: 'includedServices' | 'gallery', defaultValue = '') => {
    setActivity({
      ...activity,
      [field]: [...activity[field], defaultValue]
    });
  };
  
  const removeArrayItem = (field: 'includedServices' | 'gallery', idx: number) => {
    const newArray = [...activity[field]];
    newArray.splice(idx, 1);
    setActivity({
      ...activity,
      [field]: newArray
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    try {
      // Boş galeri resimlerini temizle
      const cleanedActivity = {
        ...activity,
        gallery: activity.gallery.filter(img => img.trim() !== '')
      };
      
      console.log('Yeni aktivite ekleniyor:', cleanedActivity);
      
      // Yeni aktiviteyi API'ye gönder
      const response = await fetch('/api/admin/activities/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedActivity),
      });
      
      // Yanıt text olarak alınıyor ve debug için loglanıyor
      const responseText = await response.text();
      console.log('API yanıtı (text):', responseText);
      
      let data;
      try {
        // Yanıtı JSON olarak ayrıştırmayı dene
        data = JSON.parse(responseText);
      } catch (jsonError) {
        // Eğer yanıt JSON değilse hata fırlat
        console.error('API yanıtı JSON olarak ayrıştırılamadı:', jsonError);
        throw new Error(`Geçersiz API yanıtı: ${responseText.slice(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${data.details || 'Bilinmeyen bir hata oluştu'}`);
      }
      
      alert('Aktivite başarıyla oluşturuldu!');
      router.push('/admin/dashboard/activities');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen bir hata'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCoverImageUpload = (imageUrl: string) => {
    handleInputChange('coverImage', imageUrl);
  };
  
  const handleGalleryImageUpload = (index: number, imageUrl: string) => {
    handleArrayChange('gallery', index, imageUrl);
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Yeni Aktivite Ekle</h1>
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
                  placeholder="Otomatik oluşturulacak (boş bırakabilirsiniz)"
                />
                <p className="text-sm text-gray-500 mt-1">URL için benzersiz tanımlayıcı, boş bırakırsanız başlıktan otomatik oluşturulur</p>
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
                  onImageSelect={handleCoverImageUpload}
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
                    onImageSelect={(url) => handleGalleryImageUpload(idx, url)}
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
              ) : 'Aktiviteyi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}