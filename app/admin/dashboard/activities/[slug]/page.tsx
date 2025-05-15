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
  createdAt?: string;
  updatedAt?: string;
}

export default function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Aktivite yükleniyor...</p>
      </div>
    );
  }

  if (error) {
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

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('tr-TR');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{activity.title}</h1>
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

          <Link 
            href={`/admin/dashboard/activities/edit/${activity.slug}`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Düzenle
          </Link>
          
          <button 
            onClick={() => router.push('/admin/dashboard/activities')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Geri Dön
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sol Kolon - Bilgiler */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  activity.featured 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {activity.featured ? 'Öne Çıkan' : 'Normal'}
                </span>
                
                <span className={`px-3 py-1 text-sm font-medium rounded-full 
                  ${activity.difficultyLevel === 'Kolay' ? 'bg-green-100 text-green-800' : 
                    activity.difficultyLevel === 'Orta' ? 'bg-yellow-100 text-yellow-800' : 
                    activity.difficultyLevel === 'Zor' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                  {activity.difficultyLevel}
                </span>
              </div>
              
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Aktivite Bilgileri</h2>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-600">Slug</td>
                      <td className="py-2">{activity.slug}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-600">Süre</td>
                      <td className="py-2">{activity.duration}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-600">WhatsApp</td>
                      <td className="py-2">
                        {activity.contactWhatsapp || 'Belirtilmemiş'}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-600">Oluşturulma</td>
                      <td className="py-2">{formatDate(activity.createdAt)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-600">Son Güncelleme</td>
                      <td className="py-2">{formatDate(activity.updatedAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Açıklama</h2>
                <p className="text-gray-700">{activity.description}</p>
              </div>
              
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Dahil Olan Hizmetler</h2>
                <ul className="list-disc pl-5 text-gray-700">
                  {activity.includedServices && activity.includedServices.length > 0 ? (
                    activity.includedServices.map((service, idx) => (
                      <li key={idx}>{service}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">Dahil hizmet belirtilmemiş</li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Sağ Kolon - Görseller */}
            <div>
              {activity.coverImage && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">Kapak Görseli</h2>
                  <div className="border border-gray-200 p-2 rounded">
                    <img 
                      src={activity.coverImage}
                      alt={`${activity.title} kapak görseli`}
                      className="w-full h-64 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/600x400?text=Görsel+Yok";
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1 break-all">{activity.coverImage}</p>
                </div>
              )}
              
              {activity.gallery && activity.gallery.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Galeri Görselleri</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {activity.gallery.map((image, idx) => (
                      <div key={idx} className="border border-gray-200 p-2 rounded">
                        <img 
                          src={image}
                          alt={`Galeri ${idx + 1}`}
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/300x200?text=Görsel+Yok";
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1 truncate">{image}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* İçerik Alanı */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">İçerik (Markdown)</h2>
            <div className="bg-gray-50 border border-gray-200 rounded p-4 font-mono whitespace-pre-wrap text-sm">
              {activity.content}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Link 
              href={`/admin/dashboard/activities/edit/${activity.slug}`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Bu Aktiviteyi Düzenle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}