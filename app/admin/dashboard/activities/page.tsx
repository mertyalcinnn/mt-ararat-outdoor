'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';

interface Activity {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  featured: boolean;
  difficultyLevel: string;
}

export default function ActivitiesListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Admin girişini kontrol et
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }

    // Async fonksiyon ile veri yükleme
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Aktivite verilerini almak için API isteği yapılıyor...');
        const response = await fetch('/api/admin/activities', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('API yanıtı JSON olarak ayrıştırılamadı:', jsonError);
          throw new Error('Sunucudan geçersiz yanıt alındı');
        }
        
        // Validasyon kontrolü
        if (!Array.isArray(data)) {
          console.error('Aktiviteler dizisi değil:', data);
          
          // Eğer veri bir dizi değilse, boş bir dizi kullan
          console.log('Aktiviteler dizisi olmadığı için boş dizi kullanılıyor');
          setActivities([]);
          setIsLoading(false);
          return;
        }
        
        setActivities(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err instanceof Error ? err.message : 'Veri yüklenirken bir hata oluştu');
        setIsLoading(false);
        
        // Hata durumunda boş dizi ile devam et
        setActivities([]);
      }
    };

    loadActivities();
  }, [router]);

  const navigateToNewActivity = () => {
    router.push('/admin/dashboard/activities/new');
  };

  // Aktivite silme işlevi
  const deleteActivity = async (slug: string) => {
    // Onay iste
    const confirm = window.confirm(`${slug} aktivitesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`);
    
    if (!confirm) {
      return; // Kullanıcı iptal ettiyse hiçbir şey yapma
    }
    
    try {
      setIsDeleting(slug); // Silme işlemi başladı
      
      console.log(`${slug} aktivitesini silmek için API isteği yapılıyor...`);
      
      // Doğrudan silme API'sini çağır (GET kontrolünü atla)
      const response = await fetch(`/api/admin/activities/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          slug: slug // Silinecek aktivitenin slug'ını gönder
        })
      });
      
      // Başarısız silme işlemi durumunda
      if (!response.ok) {
        let errorMessage = `Aktivite silinemedi: HTTP ${response.status}`;
        
        // Response'u klonlayarak okuma işlemini güvenli hale getiriyoruz
        const clonedResponse = response.clone();
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('API yanıtı JSON olarak ayrıştırılamadı:', jsonError);
          
          try {
            // Klonlanmış yanıtı text olarak okuyoruz
            const textResponse = await clonedResponse.text();
            console.error('Ham yanıt:', textResponse);
          } catch (textError) {
            console.error('Yanıt text olarak da okunamadı:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Başarılı silme işlemi
      try {
        const result = await response.json();
        console.log('Silme işlemi yanıtı:', result);
        
        // Listeyi güncelle
        setActivities(activities.filter(activity => activity.slug !== slug));
        
        // Kullanıcıya bildir
        alert(`${slug} aktivitesi başarıyla silindi`);
      } catch (jsonError) {
        console.warn('Silme işlemi başarılı ancak JSON yanıtı alınamadı:', jsonError);
        
        // JSON yanıtı alamadık, ancak yanıt OK olduğundan başarılı kabul edelim
        // Listeyi güncelle
        setActivities(activities.filter(activity => activity.slug !== slug));
        
        // Kullanıcıya bildir
        alert(`${slug} aktivitesi başarıyla silindi (yanıt ayrıştırılamadı)`);
      }
      
    } catch (error) {
      console.error('Aktivite silinirken hata:', error);
      alert(error instanceof Error ? error.message : 'Aktivite silinirken bir hata oluştu');
    } finally {
      setIsDeleting(null); // Silme işlemi tamamlandı
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Aktiviteler</h1>
          <p className="text-sm text-gray-600">Tüm aktiviteleri yönetin</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Geri Dön
          </button>
          
          <button
            onClick={navigateToNewActivity}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Yeni Aktivite Ekle
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Hata</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded"
          >
            Yeniden Dene
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activities.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">Henüz hiç aktivite eklenmemiş.</p>
              <button
                onClick={navigateToNewActivity}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                İlk Aktiviteyi Ekle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktivite
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zorluk
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.slug} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {activity.coverImage && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <SafeImage
                                src={activity.coverImage}
                                alt={activity.title}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{activity.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${activity.difficultyLevel === 'Kolay' ? 'bg-green-100 text-green-800' : 
                            activity.difficultyLevel === 'Orta' ? 'bg-yellow-100 text-yellow-800' : 
                            activity.difficultyLevel === 'Zor' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                          {activity.difficultyLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.featured 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.featured ? 'Öne Çıkan' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link 
                            href={`/admin/dashboard/activities/edit/${activity.slug}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Düzenle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </Link>
                          <Link 
                            href={`/tr/activities/${activity.slug}`}
                            target="_blank"
                            className="text-green-600 hover:text-green-900"
                            title="Görüntüle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </Link>
                          <button
                            onClick={() => deleteActivity(activity.slug)}
                            disabled={isDeleting === activity.slug}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            {isDeleting === activity.slug ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}