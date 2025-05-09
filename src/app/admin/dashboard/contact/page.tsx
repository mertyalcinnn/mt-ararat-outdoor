'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ContactData {
  title: string;
  address: string;
  email: string;
  phone: string;
  mapLocation: string;
  content: string;
}

export default function ContactPage() {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [markdownPreview, setMarkdownPreview] = useState(false);
  const router = useRouter();

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
    // İletişim verilerini yükle
    fetch('/api/admin/contact')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setContactData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching contact data:', err);
        setError('İletişim verileri yüklenirken bir hata oluştu');
        setIsLoading(false);
      });
  }, []);

  const handleInputChange = (field: keyof ContactData, value: string) => {
    if (!contactData) return;
    
    setContactData({
      ...contactData,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!contactData) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
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
        <p className="ml-3">İletişim verileri yükleniyor...</p>
      </div>
    );
  }

  if (error && !contactData) {
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

  if (!contactData) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
        <p>İletişim verisi bulunamadı</p>
      </div>
    );
  }

  // İletişim verilerini Google Maps ile görselleştirme URL'i
  const mapUrl = `https://www.google.com/maps?q=${contactData.mapLocation.replace(/\s/g, '')}&output=embed`;

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{contactData.title}</h1>
          <p className="text-sm text-gray-600">İletişim bilgilerini düzenle</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <a
            href="/tr/contact"
            target="_blank"
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            <i className="fas fa-eye mr-1"></i> İletişim Sayfasını Görüntüle
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
                  value={contactData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <textarea
                  id="address"
                  value={contactData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  id="email"
                  value={contactData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  id="phone"
                  value={contactData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="mapLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Harita Konumu (Koordinatlar)
                </label>
                <input
                  type="text"
                  id="mapLocation"
                  value={contactData.mapLocation}
                  onChange={(e) => handleInputChange('mapLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Örn: 39.770, 44.280"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enlem ve boylam değerlerini virgülle ayırarak yazın (örn: 39.770, 44.280)
                </p>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Sayfa İçeriği (Markdown)
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
                    className="w-full border border-gray-300 rounded-md shadow-sm p-4 min-h-[200px] prose max-w-none bg-white"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(contactData.content) }}
                  />
                ) : (
                  <textarea
                    id="content"
                    value={contactData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
                    required
                  />
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Harita Önizleme</h3>
                <div className="border border-gray-300 rounded-md overflow-hidden h-64">
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Harita Konumu"
                  ></iframe>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Harita konumunun doğru göründüğünden emin olun.
                </p>
              </div>
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