'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface AboutData {
  title: string;
  content: string;
  teamMembers: TeamMember[];
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
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
    // Hakkımızda verilerini yükle
    fetch('/api/admin/about')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setAboutData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching about data:', err);
        setError('Hakkımızda verileri yüklenirken bir hata oluştu');
        setIsLoading(false);
      });
  }, []);

  const handleInputChange = (field: keyof AboutData, value: any) => {
    if (!aboutData) return;
    
    setAboutData({
      ...aboutData,
      [field]: value
    });
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    if (!aboutData) return;
    
    const updatedTeamMembers = [...aboutData.teamMembers];
    updatedTeamMembers[index] = {
      ...updatedTeamMembers[index],
      [field]: value
    };
    
    setAboutData({
      ...aboutData,
      teamMembers: updatedTeamMembers
    });
  };

  const addTeamMember = () => {
    if (!aboutData) return;
    
    const newTeamMember: TeamMember = {
      name: '',
      role: '',
      bio: '',
      image: '/images/team-default.jpg'
    };
    
    setAboutData({
      ...aboutData,
      teamMembers: [...aboutData.teamMembers, newTeamMember]
    });
  };

  const removeTeamMember = (index: number) => {
    if (!aboutData) return;
    
    const updatedTeamMembers = [...aboutData.teamMembers];
    updatedTeamMembers.splice(index, 1);
    
    setAboutData({
      ...aboutData,
      teamMembers: updatedTeamMembers
    });
  };

  const handleSave = async () => {
    if (!aboutData) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutData),
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
        <p className="ml-3">Hakkımızda verileri yükleniyor...</p>
      </div>
    );
  }

  if (error && !aboutData) {
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

  if (!aboutData) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
        <p>Hakkımızda verisi bulunamadı</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{aboutData.title}</h1>
          <p className="text-sm text-gray-600">Hakkımızda sayfası içeriğini düzenle</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <a
            href="/tr/about"
            target="_blank"
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            <i className="fas fa-eye mr-1"></i> Hakkımızda Sayfasını Görüntüle
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
        {/* Sekmeler */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'content'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-file-alt mr-1"></i> Sayfa İçeriği
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'team'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="fas fa-users mr-1"></i> Ekip Üyeleri
            </button>
          </nav>
        </div>

        {/* Sayfa İçeriği Sekmesi */}
        {activeTab === 'content' && (
          <div className="p-6">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Sayfa Başlığı
              </label>
              <input
                type="text"
                id="title"
                value={aboutData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
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
                  className="w-full border border-gray-300 rounded-md shadow-sm p-4 min-h-[400px] prose max-w-none bg-white"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(aboutData.content) }}
                />
              ) : (
                <textarea
                  id="content"
                  value={aboutData.content}
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
          </div>
        )}

        {/* Ekip Üyeleri Sekmesi */}
        {activeTab === 'team' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Ekip Üyeleri</h2>
              <button
                type="button"
                onClick={addTeamMember}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <i className="fas fa-plus mr-1"></i> Ekip Üyesi Ekle
              </button>
            </div>
            
            <div className="space-y-6">
              {aboutData.teamMembers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <i className="fas fa-users text-gray-400 text-4xl mb-3"></i>
                  <p className="text-gray-500">Henüz ekip üyesi eklenmemiş.</p>
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="mt-3 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <i className="fas fa-plus mr-1"></i> Ekip Üyesi Ekle
                  </button>
                </div>
              ) : (
                aboutData.teamMembers.map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">
                        {member.name || 'Yeni Ekip Üyesi'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-trash"></i>
                        <span className="sr-only">Sil</span>
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              İsim
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Ahmet Yılmaz"
                              required
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pozisyon
                            </label>
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Kurucu & Baş Rehber"
                              required
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Biyografi
                            </label>
                            <textarea
                              value={member.bio}
                              onChange={(e) => handleTeamMemberChange(index, 'bio', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Ekip üyesi hakkında kısa bir biyografi..."
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Profil Görseli
                            </label>
                            <input
                              type="text"
                              value={member.image}
                              onChange={(e) => handleTeamMemberChange(index, 'image', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="/images/team-member.jpg"
                              required
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              Ekip üyesinin profil görseli URL'i
                            </p>
                          </div>
                          
                          {member.image && (
                            <div className="mt-4 flex justify-center">
                              <div className="w-32 h-32 border border-gray-200 rounded-full overflow-hidden">
                                <img 
                                  src={member.image} 
                                  alt={member.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Görsel+Yok';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
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