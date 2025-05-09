'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const router = useRouter();

  useEffect(() => {
    // Aktiviteleri yükle
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
        setError('Veri yüklenirken bir hata oluştu');
        setIsLoading(false);
      });
  }, []);

  const navigateToNewActivity = () => {
    router.push('/admin/dashboard/activities/new');
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
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={activity.coverImage}
                                alt={activity.title}
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
                            href={`/admin/dashboard/edit/${activity.slug}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </Link>
                          <Link 
                            href={`/activities/${activity.slug}`}
                            target="_blank"
                            className="text-green-600 hover:text-green-900"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </Link>
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