'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Site ayarları tipi
interface Settings {
  site: {
    title: string;
    logo: string;
    favicon: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  contact: {
    whatsapp: string;
    reservationEmail: string;
  };
  languages: {
    default: string;
    available: string[];
  };
  privacy: {
    cookiesEnabled: boolean;
    analyticsEnabled: boolean;
    gdprCompliant: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const router = useRouter();

  useEffect(() => {
    // Ayarları yükle
    fetch('/api/admin/settings')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setSettings(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching settings:', err);
        setError('Ayarlar yüklenirken bir hata oluştu');
        setIsLoading(false);
      });
  }, []);

  const handleInputChange = (category: keyof Settings, field: string, value: any) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    });
  };

  const handleArrayChange = (field: string, value: string[]) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      languages: {
        ...settings.languages,
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
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
        <p className="ml-3">Ayarlar yükleniyor...</p>
      </div>
    );
  }

  if (error && !settings) {
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

  if (!settings) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
        <p>Ayarlar bulunamadı</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Site Ayarları</h1>
          <p className="text-sm text-gray-600">Web sitesi yapılandırmasını düzenle</p>
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
        {/* Sekmeler */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                activeTab === 'general'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-cog mr-1"></i> Genel
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                activeTab === 'seo'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-search mr-1"></i> SEO
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                activeTab === 'social'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-share-alt mr-1"></i> Sosyal Medya
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                activeTab === 'contact'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-phone-alt mr-1"></i> İletişim
            </button>
            <button
              onClick={() => setActiveTab('languages')}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                activeTab === 'languages'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-language mr-1"></i> Diller
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-shield-alt mr-1"></i> Gizlilik
            </button>
          </nav>
        </div>

        {/* Genel Ayarlar */}
        {activeTab === 'general' && (
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <label htmlFor="site-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Başlığı
                </label>
                <input
                  type="text"
                  id="site-title"
                  value={settings.site.title}
                  onChange={(e) => handleInputChange('site', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Sitenizin başlığı tarayıcı sekmelerinde ve arama sonuçlarında görünür.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="site-logo" className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    id="site-logo"
                    value={settings.site.logo}
                    onChange={(e) => handleInputChange('site', 'logo', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  {settings.site.logo && (
                    <div className="w-10 h-10 border border-gray-200 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={settings.site.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=No+Logo';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Site logosunun URL'i
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="site-favicon" className="block text-sm font-medium text-gray-700 mb-1">
                  Favicon URL
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    id="site-favicon"
                    value={settings.site.favicon}
                    onChange={(e) => handleInputChange('site', 'favicon', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  {settings.site.favicon && (
                    <div className="w-6 h-6 border border-gray-200 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={settings.site.favicon} 
                        alt="Favicon" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/16?text=No';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Favicon URL'i (tarayıcı sekmesinde görünen küçük ikon)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SEO Ayarları */}
        {activeTab === 'seo' && (
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <label htmlFor="meta-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Başlık
                </label>
                <input
                  type="text"
                  id="meta-title"
                  value={settings.seo.metaTitle}
                  onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Meta başlık, arama motorlarında gösterilen başlıktır. 50-60 karakter arasında olması önerilir.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="meta-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Açıklama
                </label>
                <textarea
                  id="meta-description"
                  value={settings.seo.metaDescription}
                  onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Meta açıklama, arama motorlarında gösterilen kısa açıklamadır. 150-160 karakter arasında olması önerilir.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                  Anahtar Kelimeler
                </label>
                <textarea
                  id="keywords"
                  value={settings.seo.keywords}
                  onChange={(e) => handleInputChange('seo', 'keywords', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Anahtar kelimeler virgülle ayrılmalıdır (örn: Ağrı Dağı, dağcılık, outdoor).
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800">SEO İpuçları</h3>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li><i className="fas fa-check-circle mr-1"></i> Meta başlık ve açıklama benzersiz olmalıdır.</li>
                  <li><i className="fas fa-check-circle mr-1"></i> Anahtar kelimeleri başlık ve açıklamada kullanın.</li>
                  <li><i className="fas fa-check-circle mr-1"></i> Yerel arama için konum bazlı anahtar kelimeler ekleyin.</li>
                  <li><i className="fas fa-check-circle mr-1"></i> Sayfa içeriğiniz meta açıklamanızla tutarlı olmalıdır.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sosyal Medya Ayarları */}
        {activeTab === 'social' && (
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <i className="fab fa-instagram"></i>
                  </span>
                  <input
                    type="url"
                    id="instagram"
                    value={settings.social.instagram}
                    onChange={(e) => handleInputChange('social', 'instagram', e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="https://instagram.com/mtararatoutdoor"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <i className="fab fa-facebook-f"></i>
                  </span>
                  <input
                    type="url"
                    id="facebook"
                    value={settings.social.facebook}
                    onChange={(e) => handleInputChange('social', 'facebook', e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="https://facebook.com/mtararatoutdoor"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter / X
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <i className="fab fa-twitter"></i>
                  </span>
                  <input
                    type="url"
                    id="twitter"
                    value={settings.social.twitter}
                    onChange={(e) => handleInputChange('social', 'twitter', e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="https://twitter.com/mtararatoutdoor"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <i className="fab fa-youtube"></i>
                  </span>
                  <input
                    type="url"
                    id="youtube"
                    value={settings.social.youtube}
                    onChange={(e) => handleInputChange('social', 'youtube', e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="https://youtube.com/mtararatoutdoor"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* İletişim Ayarları */}
        {activeTab === 'contact' && (
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Numarası
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <i className="fab fa-whatsapp text-green-500"></i>
                  </span>
                  <input
                    type="text"
                    id="whatsapp"
                    value={settings.contact.whatsapp}
                    onChange={(e) => handleInputChange('contact', 'whatsapp', e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="+905001234567"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  WhatsApp üzerinden iletişim için kullanılacak numara
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="reservation-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Rezervasyon E-posta Adresi
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <i className="fas fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    id="reservation-email"
                    value={settings.contact.reservationEmail}
                    onChange={(e) => handleInputChange('contact', 'reservationEmail', e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="rezervasyon@mtararatoutdoor.com"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Rezervasyon formundan gelen mesajların gönderileceği e-posta adresi
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dil Ayarları */}
        {activeTab === 'languages' && (
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <label htmlFor="default-language" className="block text-sm font-medium text-gray-700 mb-1">
                  Varsayılan Dil
                </label>
                <select
                  id="default-language"
                  value={settings.languages.default}
                  onChange={(e) => handleInputChange('languages', 'default', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Sitenin varsayılan dili
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanılabilir Diller
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lang-tr"
                      checked={settings.languages.available.includes('tr')}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        let langs = [...settings.languages.available];
                        
                        if (isChecked && !langs.includes('tr')) {
                          langs.push('tr');
                        } else if (!isChecked) {
                          langs = langs.filter(l => l !== 'tr');
                        }
                        
                        handleArrayChange('available', langs);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lang-tr" className="ml-2 block text-sm text-gray-700">
                      Türkçe
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lang-en"
                      checked={settings.languages.available.includes('en')}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        let langs = [...settings.languages.available];
                        
                        if (isChecked && !langs.includes('en')) {
                          langs.push('en');
                        } else if (!isChecked) {
                          langs = langs.filter(l => l !== 'en');
                        }
                        
                        handleArrayChange('available', langs);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lang-en" className="ml-2 block text-sm text-gray-700">
                      English
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lang-ru"
                      checked={settings.languages.available.includes('ru')}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        let langs = [...settings.languages.available];
                        
                        if (isChecked && !langs.includes('ru')) {
                          langs.push('ru');
                        } else if (!isChecked) {
                          langs = langs.filter(l => l !== 'ru');
                        }
                        
                        handleArrayChange('available', langs);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lang-ru" className="ml-2 block text-sm text-gray-700">
                      Русский
                    </label>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Sitede hangi dillerin kullanılabilir olacağını seçin
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Dil Ayarları Hakkında</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>En az bir dil seçili olmalıdır. Varsayılan dil, kullanılabilir diller arasında olmalıdır.</p>
                      <p className="mt-1">Dil ayarlarını değiştirdiğinizde, site yeniden başlatılabilir.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gizlilik Ayarları */}
        {activeTab === 'privacy' && (
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700">Çerez ve Analitik Ayarları</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Bu ayarlar, sitenizin çerezleri ve analitik araçları nasıl kullandığını belirler.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="cookies-enabled"
                      checked={settings.privacy.cookiesEnabled}
                      onChange={(e) => handleInputChange('privacy', 'cookiesEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="cookies-enabled" className="font-medium text-gray-700">Çerezleri Etkinleştir</label>
                    <p className="text-gray-500">Kullanıcı oturumları ve tercihleri için çerezleri etkinleştirir.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="analytics-enabled"
                      checked={settings.privacy.analyticsEnabled}
                      onChange={(e) => handleInputChange('privacy', 'analyticsEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="analytics-enabled" className="font-medium text-gray-700">Google Analytics Etkinleştir</label>
                    <p className="text-gray-500">Site trafiğini ve kullanıcı davranışlarını izlemek için Google Analytics'i etkinleştirir.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="gdpr-compliant"
                      checked={settings.privacy.gdprCompliant}
                      onChange={(e) => handleInputChange('privacy', 'gdprCompliant', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="gdpr-compliant" className="font-medium text-gray-700">GDPR Uyumlu Çerez İzini</label>
                    <p className="text-gray-500">Kullanıcılara çerezler hakkında bilgi veren ve onaylarını isteyen bir banner görüntüler.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Önemli Uyarı</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        GDPR ve diğer gizlilik yasalarına uyum sağlamak için, site sahibi olarak gizlilik politikanızı oluşturmalı ve 
                        kullanıcılarınıza hangi verileri topladığınızı ve nasıl kullandığınızı açıkça belirtmelisiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Alt Buton Alanı */}
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