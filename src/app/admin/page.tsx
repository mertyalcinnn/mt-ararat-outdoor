'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
  title: string;
  slug: string;
  description: string;
  contactWhatsapp: string;
  featured: boolean;
}

export default function AdminPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // JSON dosyalarınızı yükleyin
    fetch('/api/admin/activities')
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `HTTP Error: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(data => {
        console.log('Aktiviteler başarıyla yüklendi:', data.length);
        setActivities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Aktiviteleri yüklerken hata:', err);
        setError(err.message || 'Aktiviteler yüklenirken bir hata oluştu');
        setLoading(false);
      });
  }, []);
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mt.Ararat Outdoor Admin Panel</h1>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Hata</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
          >
            Yeniden Dene
          </button>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Aktiviteler</h2>
          {activities.length === 0 ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
              <p>Aktivite bulunamadı.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öne Çıkan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.slug} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{activity.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{activity.contactWhatsapp || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {activity.featured ? 'Evet' : 'Hayır'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          href={`/admin/activities/${activity.slug}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Düzenle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded border border-blue-200 mt-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Yardım</h3>
        <p className="text-blue-600 mb-2">
          Bu admin paneli ile aktivitelerinizi yönetebilirsiniz. 
          Her aktivite için WhatsApp iletişim bilgilerini düzenleyebilir ve içerik detaylarını güncelleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}