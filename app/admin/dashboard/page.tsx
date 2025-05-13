'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Activity {
  title: string;
  slug: string;
  featured: boolean;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    featuredActivities: 0,
    lastUpdate: '',
  });
  const [error, setError] = useState<string | null>(null);
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
        
        const response = await fetch('/api/admin/activities');
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validasyon kontrolü
        if (!Array.isArray(data)) {
          console.error('Aktiviteler dizisi değil:', data);
          throw new Error('Sunucudan beklenmeyen veri formatı alındı');
        }
        
        setActivities(data);
        
        // İstatistikleri hesapla
        const featuredCount = data.filter((a: Activity) => a.featured).length;
        const now = new Date();
        
        setStats({
          totalActivities: data.length,
          featuredActivities: featuredCount,
          lastUpdate: now.toLocaleString('tr-TR'),
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err instanceof Error ? err.message : 'Veri yüklenirken bir hata oluştu');
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600"></div>
        <p className="ml-3 text-slate-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Panel Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Mt.Ararat Outdoor Adventures içerik yönetim sistemi</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-md text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-1.5"></i> Çıkış
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-lg shadow-sm mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata Oluştu</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-4 rounded-md text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                >
                  <i className="fas fa-sync-alt mr-1.5"></i> Yeniden Dene
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* İstatistikler - Yeni Görünüm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-4 rounded-full bg-teal-50 text-teal-600 mr-4">
                  <i className="fas fa-hiking text-xl"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Toplam Aktivite</p>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-slate-800">{stats.totalActivities}</p>
                    <span className="ml-1 text-xs font-medium text-green-500 flex items-center">
                      <i className="fas fa-arrow-up mr-0.5"></i> Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-4 rounded-full bg-emerald-50 text-emerald-600 mr-4">
                  <i className="fas fa-star text-xl"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Öne Çıkan Aktivite</p>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-slate-800">{stats.featuredActivities}</p>
                    <span className="ml-1 text-xs font-medium text-green-500 flex items-center">
                      <i className="fas fa-check mr-0.5"></i> Gösterimde
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-4 rounded-full bg-amber-50 text-amber-600 mr-4">
                  <i className="fas fa-clock text-xl"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Son Güncelleme</p>
                  <div className="flex items-baseline">
                    <p className="text-xl font-bold text-slate-800">{stats.lastUpdate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı Erişim Kartları - Yeni Görünüm */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <i className="fas fa-bolt text-amber-500 mr-2"></i> Hızlı Erişim
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link 
                href="/admin/dashboard/activities"
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all group"
              >
                <div className="h-1.5 bg-teal-500"></div>
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-teal-50 text-teal-600 mb-4 transform group-hover:scale-110 transition-transform">
                      <i className="fas fa-hiking text-xl"></i>
                    </div>
                    <h3 className="font-medium text-slate-800 mb-1">Aktiviteleri Yönet</h3>
                    <p className="text-sm text-slate-500">Tüm aktiviteleri düzenle</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/admin/dashboard/homepage"
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div className="h-1.5 bg-emerald-500"></div>
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mb-4 transform group-hover:scale-110 transition-transform">
                      <i className="fas fa-home text-xl"></i>
                    </div>
                    <h3 className="font-medium text-slate-800 mb-1">Ana Sayfa</h3>
                    <p className="text-sm text-slate-500">Ana sayfa içeriğini güncelle</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/admin/dashboard/about"
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <div className="h-1.5 bg-amber-500"></div>
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-amber-50 text-amber-600 mb-4 transform group-hover:scale-110 transition-transform">
                      <i className="fas fa-info-circle text-xl"></i>
                    </div>
                    <h3 className="font-medium text-slate-800 mb-1">Hakkımızda</h3>
                    <p className="text-sm text-slate-500">Şirket bilgilerini düzenle</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/admin/dashboard/contact"
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all group"
              >
                <div className="h-1.5 bg-rose-500"></div>
                <div className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-rose-50 text-rose-600 mb-4 transform group-hover:scale-110 transition-transform">
                      <i className="fas fa-address-card text-xl"></i>
                    </div>
                    <h3 className="font-medium text-slate-800 mb-1">İletişim</h3>
                    <p className="text-sm text-slate-500">İletişim bilgilerini güncelle</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Son Aktiviteler Tablosu - Yeni Görünüm */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-10 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                  <i className="fas fa-list-ul text-teal-500 mr-2"></i> Aktiviteler
                </h2>
                <p className="text-sm text-slate-500 mt-1">Tüm aktivitelerin listesi</p>
              </div>
              <Link 
                href="/admin/dashboard/activities/new"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm transition-colors"
              >
                <i className="fas fa-plus mr-1.5"></i> Yeni Ekle
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Aktivite
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {activities.length > 0 ? activities.map((activity) => (
                    <tr key={activity.slug} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                            <i className="fas fa-hiking"></i>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-800">{activity.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{activity.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          activity.featured 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {activity.featured ? (
                            <>
                              <i className="fas fa-star mr-1 text-yellow-500"></i> Öne Çıkan
                            </>
                          ) : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link 
                            href={`/admin/dashboard/activities/${activity.slug}`}
                            className="text-slate-600 hover:text-slate-900 flex items-center"
                          >
                            <i className="fas fa-eye mr-1"></i> Görüntüle
                          </Link>
                          <Link 
                            href={`/admin/dashboard/activities/edit/${activity.slug}`}
                            className="text-teal-600 hover:text-teal-900 flex items-center"
                          >
                            <i className="fas fa-edit mr-1"></i> Düzenle
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p>Henüz aktivite eklenmemiş.</p>
                          <Link 
                            href="/admin/dashboard/activities/new" 
                            className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                          >
                            <i className="fas fa-plus mr-1.5"></i> Aktivite Ekle
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
              <Link 
                href="/admin/dashboard/activities"
                className="text-teal-600 hover:text-teal-900 text-sm font-medium"
              >
                Tüm Aktiviteleri Görüntüle <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>

          {/* Yardım Kartı - Yeni Görünüm */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-teal-100">
            <div className="flex items-start">
              <div className="p-3 rounded-full bg-white text-teal-600 mr-4 shadow-sm">
                <i className="fas fa-question-circle text-xl"></i>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Yardım ve Destek</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Bu admin panelini kullanarak sitenizin tüm içeriklerini yönetebilirsiniz. 
                  Yukarıdaki hızlı erişim kartlarını kullanarak farklı bölümlere kolayca erişebilir, içeriklerinizi güncelleyebilirsiniz.
                </p>
                <div className="flex space-x-3">
                  <a href="#" className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 shadow-sm">
                    <i className="fas fa-book mr-1.5"></i> Dokümantasyon
                  </a>
                  <a href="mailto:support@mtararat.com" className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 shadow-sm">
                    <i className="fas fa-envelope mr-1.5"></i> Destek Al
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Mt. Ararat Outdoor Adventures. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}