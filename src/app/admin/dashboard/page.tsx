'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Activity {
  title: string;
  slug: string;
  description: string;
  contactWhatsapp: string;
  featured: boolean;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Oturum kontrolü
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }

    // Aktiviteleri yükle - sadece client side'da çalışır
    fetch('/api/admin/activities')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setActivities(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching activities:', err);
        setError('Aktiviteler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setIsLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mt.Ararat Outdoor Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Çıkış Yap
        </button>
      </div>

      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded"
          >
            Yeniden Dene
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Aktiviteler</h2>
            
            {activities.length === 0 ? (
              <p>Henüz aktivite bulunamadı.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İsim
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        WhatsApp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Öne Çıkan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.slug} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          <div className="text-sm text-gray-500">{activity.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {activity.contactWhatsapp || 'Ayarlanmamış'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {activity.featured ? 'Evet' : 'Hayır'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => router.push(`/admin/dashboard/edit/${activity.slug}`)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Düzenle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Yardım</h3>
            <p className="text-blue-600 mb-2">
              Bu panel ile aktivitelerinizi görüntüleyebilir ve düzenleyebilirsiniz.
            </p>
            <p className="text-blue-600">
              Sorun yaşarsanız, site yöneticisi ile iletişime geçin.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
