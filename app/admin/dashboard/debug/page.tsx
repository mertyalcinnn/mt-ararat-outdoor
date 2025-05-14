'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
  slug: string;
  title: string;
  description: string;
  updatedAt?: string;
}

export default function CacheManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mongoActivities, setMongoActivities] = useState<Activity[]>([]);
  const [fileActivities, setFileActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [lastAction, setLastAction] = useState('');

  const loadActivities = async () => {
    setIsLoading(true);
    
    try {
      // Tüm kaynakları kontrol et
      const response = await fetch('/api/debug/activities');
      const data = await response.json();
      
      if (data.mongo && data.mongo.data) {
        setMongoActivities(data.mongo.data);
      }
      
      if (data.files && data.files.data) {
        setFileActivities(data.files.data);
      }
      
      // Normal aktiviteler listesini kontrol et
      const activitiesResponse = await fetch('/api/admin/activities');
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData);
      }
      
      setMessage('Veriler başarıyla yüklendi.');
      setLastAction('load');
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setMessage('Veri yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async (path = '/') => {
    setIsLoading(true);
    setMessage('Önbellek temizleniyor...');
    
    try {
      // Tüm revalidation API'lerini dene
      const endpoints = [
        '/api/revalidate',
        '/api/force-revalidate',
        '/api/clear-cache'
      ];
      
      let success = false;
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${endpoint}?path=${path}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`${endpoint} başarılı:`, data);
            success = true;
            setMessage(`Önbellek başarıyla temizlendi! Endpoint: ${endpoint}`);
            setLastAction('clear');
            break;
          }
        } catch (endpointError) {
          console.error(`${endpoint} hatası:`, endpointError);
        }
      }
      
      if (!success) {
        setMessage('Hiçbir önbellek temizleme API\'si çalışmadı!');
      }
    } catch (error) {
      console.error('Önbellek temizleme hatası:', error);
      setMessage('Önbellek temizlenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cache ve Veri Yönetimi</h1>
      
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => loadActivities()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading && lastAction === 'load' ? 'Yükleniyor...' : 'Verileri Yenile'}
        </button>
        
        <button
          onClick={() => clearCache()}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading && lastAction === 'clear' ? 'Temizleniyor...' : 'Tüm Önbelleği Temizle'}
        </button>
        
        <Link href="/admin/dashboard/activities" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Aktiviteler Yönetimine Dön
        </Link>
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded ${message.includes('hata') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Normal API'den gelen aktiviteler */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Normal API Aktiviteleri</h2>
          <p className="text-sm text-gray-500 mb-2">Toplam: {activities.length}</p>
          
          {activities.length > 0 ? (
            <ul className="divide-y">
              {activities.map((activity) => (
                <li key={activity.slug} className="py-2">
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-gray-500">{activity.slug}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aktivite bulunamadı.</p>
          )}
        </div>
        
        {/* MongoDB'den gelen aktiviteler */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">MongoDB Aktiviteleri</h2>
          <p className="text-sm text-gray-500 mb-2">Toplam: {mongoActivities.length}</p>
          
          {mongoActivities.length > 0 ? (
            <ul className="divide-y">
              {mongoActivities.map((activity) => (
                <li key={activity.slug} className="py-2">
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-gray-500">{activity.slug}</div>
                  {activity.updatedAt && (
                    <div className="text-xs text-gray-400">
                      Son güncelleme: {new Date(activity.updatedAt).toLocaleString()}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">MongoDB'de aktivite bulunamadı.</p>
          )}
        </div>
        
        {/* JSON dosyalarından gelen aktiviteler */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">JSON Dosyası Aktiviteleri</h2>
          <p className="text-sm text-gray-500 mb-2">Toplam: {fileActivities.length}</p>
          
          {fileActivities.length > 0 ? (
            <ul className="divide-y">
              {fileActivities.map((activity) => (
                <li key={activity.slug} className="py-2">
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-gray-500">{activity.slug}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Dosyalarda aktivite bulunamadı.</p>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Sayfa Önbelleğini Temizle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['/tr', '/en', '/ru', '/tr/activities', '/en/activities', '/ru/activities'].map((path) => (
            <button
              key={path}
              onClick={() => clearCache(path)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              {path} Sayfasını Temizle
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Son işlem: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}