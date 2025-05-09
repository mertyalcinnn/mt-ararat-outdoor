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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [originalActivity, setOriginalActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isAutoSave, setIsAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [markdownPreview, setMarkdownPreview] = useState(false);
  
  // Örnek markdown içerik dönüştürücü (basit)
  const renderMarkdown = (content: string) => {
    // Başlıklar
    let html = content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold my-2">$1</h3>');

    // Liste öğeleri
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>');
    
    // Paragraflar
    html = html.replace(/^(?!<h|<li)(.*$)/gim, function(m) {
      return m.trim() === '' ? '' : '<p class="my-2">'+m+'</p>';
    });
    
    return html;
  };

  useEffect(() => {
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
        setOriginalActivity(JSON.parse(JSON.stringify(data))); // Deep copy for comparison
        setPreviewUrl(`/tr/activities/${data.slug}`);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching activity:', err);
        setError('Aktivite yüklenirken bir hata oluştu');
        setIsLoading(false);
      });
  }, [slug]);

  // Değişiklikleri kontrol et
  const hasChanges = () => {
    if (!activity || !originalActivity) return false;
    return JSON.stringify(activity) !== JSON.stringify(originalActivity);
  };

  // Otomatik kaydetme
  useEffect(() => {
    if (!isAutoSave || !hasChanges() || isSaving || isLoading) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 10000); // 10 saniye sonra otomatik kaydet
    
    return () => clearTimeout(timer);
  }, [activity, isAutoSave, isSaving, isLoading]);

  const handleInputChange = (field: keyof Activity, value: any) => {
    if (!activity) return;
    
    // Eğer slug değişiyorsa, önizleme URL'sini güncelle
    if (field === 'slug') {
      setPreviewUrl(`/tr/activities/${value}`);
    }
    
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

  const handleSave = async (redirectAfterSave = false) => {
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
      
      // Başarıyla kaydedildiyse
      setOriginalActivity(JSON.parse(JSON.stringify(activity))); // Update original
      setLastSaved(new Date().toLocaleTimeString());
      
      if (redirectAfterSave) {
        // Başarılı mesajı gösterip dashboard'a yönlendir
        alert('Aktivite başarıyla kaydedildi!');
        router.push('/admin/dashboard/activities');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?')) {
        router.push('/admin/dashboard/activities');
      }
    } else {
      router.push('/admin/dashboard/activities');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3">Aktivite yükleniyor...</p>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
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
            onClick={() => router.push('/admin/dashboard/activities')} 
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-4 rounded"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
        <p>Aktivite bulunamadı</p>
        <button 
          onClick={() => router.push('/admin/dashboard/activities')} 
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg mb-6">
        {/* Üst Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              <span className="text-blue-600">{`/tr/activities/${activity.slug}`}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {/* Otomatik Kaydetme */}
            <div className="flex items-center mr-4">
              <input
                type="checkbox"
                id="autoSave"
                checked={isAutoSave}
                onChange={(e) => setIsAutoSave(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoSave" className="ml-2 block text-sm text-gray-700">
                Otomatik kaydet
              </label>
            </div>
            
            {/* Ön izleme butonu */}
            <a
              href={previewUrl || '#'}
              target="_blank"
              className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              <i className="fas fa-eye mr-1"></i> Ön İzleme
            </a>
            
            {/* Vazgeç butonu */}
            <button
              onClick={handleCancel}
              className="px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            
            {/* Kaydet butonu */}
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving || !hasChanges()}
              className={`px-3 py-2 text-sm text-white rounded transition-colors ${
                isSaving || !hasChanges() 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i> Kaydediliyor...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1"></i> Kaydet ve Çık
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Sekmeler */}
        <div className="bg-gray-50 border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'general'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-info-circle mr-1"></i> Genel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'content'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-pen-fancy mr-1"></i> İçerik
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'media'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-images mr-1"></i> Medya
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'services'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-concierge-bell mr-1"></i> Hizmetler
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-cog mr-1"></i> Ayarlar
            </button>
          </nav>
        </div>
        
        {error && (
          <div className="m-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-bold">Hata</p>
            <p>{error}</p>
          </div>
        )}
        
        {lastSaved && (
          <div className="mx-6 mt-4 text-sm text-gray-500">
            <i className="fas fa-check-circle text-green-500 mr-1"></i> Son kaydetme: {lastSaved}
          </div>
        )}
        
        {/* Sekme İçeriği */}
        <div className="p-6">
          {/* Genel Bilgiler Sekmesi */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Aktivite Başlığı
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={activity.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      /tr/activities/
                    </span>
                    <input
                      type="text"
                      id="slug"
                      value={activity.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    URL için benzersiz tanımlayıcı. Boşluk ve özel karakter içermemeli.
                  </p>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Kısa Açıklama
                  </label>
                  <textarea
                    id="description"
                    value={activity.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Aktiviteyi kısaca tanımlayan bir açıklama yazın.
                  </p>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Süre
                  </label>
                  <input
                    type="text"
                    id="duration"
                    value={activity.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: 2-3 gün, 4 saat, vb."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Zorluk Seviyesi
                  </label>
                  <select
                    id="difficultyLevel"
                    value={activity.difficultyLevel}
                    onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Kolay">Kolay</option>
                    <option value="Orta">Orta</option>
                    <option value="Zor">Zor</option>
                    <option value="Çok Zor">Çok Zor</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="contactWhatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp İletişim Numarası
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      <i className="fab fa-whatsapp text-green-500"></i>
                    </span>
                    <input
                      type="text"
                      id="contactWhatsapp"
                      value={activity.contactWhatsapp || ''}
                      onChange={(e) => handleInputChange('contactWhatsapp', e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      placeholder="+905001234567"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    WhatsApp üzerinden iletişim için telefon numarası.
                  </p>
                </div>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={activity.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Öne Çıkan Aktivite
                  </label>
                  <p className="ml-6 text-sm text-gray-500">
                    Öne çıkan aktiviteler ana sayfada gösterilir.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* İçerik Sekmesi */}
          {activeTab === 'content' && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  İçerik (Markdown)
                </label>
                <button
                  type="button"
                  onClick={() => setMarkdownPreview(!markdownPreview)}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  {markdownPreview ? (
                    <>
                      <i className="fas fa-edit mr-1"></i> Düzenle
                    </>
                  ) : (
                    <>
                      <i className="fas fa-eye mr-1"></i> Önizleme
                    </>
                  )}
                </button>
              </div>
              
              {markdownPreview ? (
                <div
                  className="w-full border border-gray-300 rounded-md shadow-sm p-4 min-h-[400px] prose max-w-none bg-white"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(activity.content) }}
                />
              ) : (
                <textarea
                  id="content"
                  value={activity.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
                  required
                />
              )}
              
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded p-3">
                <h3 className="text-sm font-medium text-blue-800">Markdown İpuçları</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-600">
                  <div>
                    <code className="bg-blue-100 px-1 rounded"># Başlık</code> - Büyük başlık
                  </div>
                  <div>
                    <code className="bg-blue-100 px-1 rounded">## Alt Başlık</code> - Alt başlık
                  </div>
                  <div>
                    <code className="bg-blue-100 px-1 rounded">- Liste öğesi</code> - Liste maddesi
                  </div>
                  <div>
                    <code className="bg-blue-100 px-1 rounded">**Kalın**</code> - Kalın yazı
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Medya Sekmesi */}
          {activeTab === 'media' && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapak Görseli
                </label>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={activity.coverImage}
                      onChange={(e) => handleInputChange('coverImage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="/images/activity-cover.jpg"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Görsel yolu (örn: /images/hiking-cover.jpg)
                    </p>
                  </div>
                  
                  {activity.coverImage && (
                    <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded overflow-hidden">
                      <img 
                        src={activity.coverImage} 
                        alt="Kapak görseli" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Görsel+Yok';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Galeri Görselleri
                  </label>
                  <button 
                    type="button"
                    onClick={() => addArrayItem('gallery', '/images/')}
                    className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <i className="fas fa-plus mr-1"></i> Görsel Ekle
                  </button>
                </div>
                
                <div className="space-y-4">
                  {activity.gallery.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Henüz galeri görseli eklenmemiş.</p>
                  ) : (
                    activity.gallery.map((image, index) => (
                      <div key={index} className="flex items-start space-x-4 border border-gray-200 rounded-lg p-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={image}
                            onChange={(e) => handleArrayChange('gallery', index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="/images/gallery-image.jpg"
                          />
                        </div>
                        
                        <div className="flex-shrink-0 w-20 h-20 border border-gray-200 rounded overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Galeri görseli ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Görsel+Yok';
                            }}
                          />
                        </div>
                        
                        <button 
                          type="button"
                          onClick={() => removeArrayItem('gallery', index)}
                          className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <i className="fas fa-trash"></i>
                          <span className="sr-only">Sil</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Hizmetler Sekmesi */}
          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dahil Olan Hizmetler
                </label>
                <button 
                  type="button"
                  onClick={() => addArrayItem('includedServices')}
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  <i className="fas fa-plus mr-1"></i> Hizmet Ekle
                </button>
              </div>
              
              <div className="space-y-3">
                {activity.includedServices.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Henüz hizmet eklenmemiş.</p>
                ) : (
                  activity.includedServices.map((service, index) => (
                    <div key={index} className="flex items-center border border-gray-200 rounded-lg p-3">
                      <div className="flex-shrink-0 text-green-500 mr-3">
                        <i className="fas fa-check-circle text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={service}
                          onChange={(e) => handleArrayChange('includedServices', index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Örn: Profesyonel rehberlik hizmeti"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeArrayItem('includedServices', index)}
                        className="flex-shrink-0 ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <i className="fas fa-times"></i>
                        <span className="sr-only">Sil</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* Ayarlar Sekmesi */}
          {activeTab === 'settings' && (
            <div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-yellow-800">Ayarlar ve Öneriler</h3>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li><i className="fas fa-lightbulb mr-1"></i> Aktivite başlığını SEO dostu oluşturun</li>
                  <li><i className="fas fa-lightbulb mr-1"></i> URL'de özel karakter ve boşluk kullanmayın</li>
                  <li><i className="fas fa-lightbulb mr-1"></i> Görsel dosyalarını önceden yükleyin</li>
                  <li><i className="fas fa-lightbulb mr-1"></i> Detaylı ve açıklayıcı içerik ekleyin</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Aktivite Bilgileri</h3>
                  <dl className="space-y-2">
                    <div className="flex py-2 border-b border-gray-100">
                      <dt className="w-1/3 text-sm text-gray-500">Başlık:</dt>
                      <dd className="w-2/3 text-sm text-gray-900">{activity.title}</dd>
                    </div>
                    <div className="flex py-2 border-b border-gray-100">
                      <dt className="w-1/3 text-sm text-gray-500">URL:</dt>
                      <dd className="w-2/3 text-sm text-blue-600">/{activity.slug}</dd>
                    </div>
                    <div className="flex py-2 border-b border-gray-100">
                      <dt className="w-1/3 text-sm text-gray-500">Zorluk:</dt>
                      <dd className="w-2/3 text-sm text-gray-900">{activity.difficultyLevel}</dd>
                    </div>
                    <div className="flex py-2 border-b border-gray-100">
                      <dt className="w-1/3 text-sm text-gray-500">Süre:</dt>
                      <dd className="w-2/3 text-sm text-gray-900">{activity.duration}</dd>
                    </div>
                    <div className="flex py-2 border-b border-gray-100">
                      <dt className="w-1/3 text-sm text-gray-500">Öne Çıkan:</dt>
                      <dd className="w-2/3 text-sm text-gray-900">
                        {activity.featured ? (
                          <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Evet
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Hayır
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Aktiviteyi Sil</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Aktiviteyi silmek istiyorsanız, bu işlem geri alınamaz. Tüm veriler kalıcı olarak silinecektir.
                  </p>
                  <button
                    type="button"
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    onClick={() => {
                      if (confirm('Bu aktiviteyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
                        // Silme fonksiyonu eklecek
                        alert('Bu özellik henüz aktif değil');
                      }
                    }}
                  >
                    <i className="fas fa-trash-alt mr-1"></i> Aktiviteyi Sil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Alt Bar */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div>
            {lastSaved && (
              <p className="text-sm text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-1"></i> Son kaydetme: {lastSaved}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving || !hasChanges()}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                isSaving || !hasChanges() 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i> Kaydediliyor...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-1"></i> Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}