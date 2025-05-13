'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MediaItem {
  path: string;
  name: string;
  size: string;
  lastModified: string;
  type: string;
}

export default function MediaGalleryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Medya öğelerini yükle
    fetch('/api/admin/media')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setMediaItems(data);
        setFilteredItems(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching media items:', err);
        setError('Medya galerisi yüklenirken bir hata oluştu');
        setIsLoading(false);
      });
  }, []);

  // Filtreleme ve Sıralama
  useEffect(() => {
    let result = [...mediaItems];
    
    // Metin araması
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Tür filtresi
    if (selectedType !== 'all') {
      result = result.filter(item => 
        item.type.toLowerCase().includes(selectedType.toLowerCase())
      );
    }
    
    // Sıralama
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'size') {
        const getSize = (size: string) => {
          const [value, unit] = size.split(' ');
          const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          const multiplier = Math.pow(1024, units.indexOf(unit));
          return parseFloat(value) * multiplier;
        };
        
        return sortOrder === 'asc'
          ? getSize(a.size) - getSize(b.size)
          : getSize(b.size) - getSize(a.size);
      } else if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          : new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
      
      return 0;
    });
    
    setFilteredItems(result);
  }, [mediaItems, searchTerm, selectedType, sortBy, sortOrder]);

  // Resim detaylarını göster
  const handleImageClick = (item: MediaItem) => {
    setSelectedImage(item);
    setIsModalOpen(true);
  };

  // Resim URL'ini panoya kopyala
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('URL panoya kopyalandı!');
      })
      .catch(err => {
        console.error('Panoya kopyalama başarısız:', err);
      });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3">Medya galerisi yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Medya Galerisi</h1>
            <p className="text-sm text-slate-500">Tüm görsellerinizi yönetin</p>
          </div>
          <button
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm transition-colors"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt mr-2"></i> Yenile
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-lg shadow-sm">
            <p className="font-bold">Hata</p>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-rose-500 hover:bg-rose-600 text-white py-1.5 px-4 rounded-md text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400"
            >
              <i className="fas fa-sync-alt mr-1.5"></i> Yeniden Dene
            </button>
          </div>
        )}

        {/* Filtreler */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">Ara</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-slate-400"></i>
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="Dosya adı ara..."
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">Dosya Türü</label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              >
                <option value="all">Tümü</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
                <option value="gif">GIF</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-slate-700 mb-1">Sıralama</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              >
                <option value="name">İsim</option>
                <option value="size">Boyut</option>
                <option value="date">Tarih</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-slate-700 mb-1">Sıralama Yönü</label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              >
                <option value="asc">Artan</option>
                <option value="desc">Azalan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Galeri */}
        <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10">
              <i className="fas fa-image text-slate-300 text-5xl mb-4"></i>
              <p className="text-slate-500">Arama kriterlerinize uygun görsel bulunamadı.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-slate-600">
                {filteredItems.length} görsel bulundu.
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleImageClick(item)}
                  >
                    <div className="aspect-square w-full bg-slate-100 relative">
                      <img 
                        src={item.path} 
                        alt={item.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder-image.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-teal-700/0 group-hover:bg-teal-700/10 transition-colors flex items-center justify-center">
                        <div className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                          <i className="fas fa-search text-teal-600"></i>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-slate-800 truncate" title={item.name}>{item.name}</p>
                      <p className="text-xs text-slate-500">{item.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Görsel Detay Modal */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-800 truncate" title={selectedImage.name}>
                {selectedImage.name}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center bg-slate-100 rounded-lg p-4 shadow-inner">
                  <img 
                    src={selectedImage.path} 
                    alt={selectedImage.name}
                    className="max-w-full max-h-80 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder-image.jpg';
                    }}
                  />
                </div>
                
                <div>
                  <div className="flex items-center mb-4 gap-2">
                    <div className="bg-teal-100 text-teal-600 p-2 rounded">
                      <i className="fas fa-info-circle"></i>
                    </div>
                    <h4 className="font-medium text-slate-800">Görsel Bilgileri</h4>
                  </div>
                  
                  <div className="space-y-4 bg-slate-50 rounded-lg p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Dosya adı</p>
                      <p className="text-sm text-slate-800 font-medium">{selectedImage.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-500">Dosya türü</p>
                      <p className="text-sm text-slate-800">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {selectedImage.type.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-500">Dosya boyutu</p>
                      <p className="text-sm text-slate-800">{selectedImage.size}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-500">Son değiştirilme</p>
                      <p className="text-sm text-slate-800">
                        {new Date(selectedImage.lastModified).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-500">URL</p>
                      <div className="mt-1 flex">
                        <input
                          type="text"
                          value={selectedImage.path}
                          readOnly
                          className="flex-1 text-sm px-3 py-2 border border-slate-300 rounded-l-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                        <button
                          onClick={() => copyToClipboard(selectedImage.path)}
                          className="bg-teal-100 text-teal-600 px-3 py-2 rounded-r-md hover:bg-teal-200 transition-colors"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
              >
                Kapat
              </button>
              <button
                onClick={() => copyToClipboard(selectedImage.path)}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-sm"
              >
                <i className="fas fa-copy mr-1"></i> URL Kopyala
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}