'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

type MediaItem = {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  type: string;
};

interface AdvancedImageUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export default function AdvancedImageUploader({ 
  onImageSelect, 
  currentImageUrl = '', 
  label = 'Görsel Ekle' 
}: AdvancedImageUploaderProps) {
  // Tab ve seçili resim state'leri
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'gallery'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<MediaItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client tarafında render edildiğinden emin ol
  useEffect(() => {
    setClientReady(true);
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  // Galeri sekmesi açıldığında resimleri yükle
  useEffect(() => {
    if (activeTab === 'gallery' && galleryImages.length === 0) {
      loadGalleryImages();
    }
  }, [activeTab]);

  // Galeri resimlerini yükle
  const loadGalleryImages = async () => {
    setIsLoadingGallery(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/media');
      
      if (!response.ok) {
        throw new Error('Galeri resimleri yüklenemedi');
      }
      
      const data: MediaItem[] = await response.json();
      setGalleryImages(data);
    } catch (err) {
      console.error('Galeri resimleri yüklenirken hata:', err);
      setError('Galeri resimleri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoadingGallery(false);
    }
  };

  // PC'den dosya yükleme
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Dosya boyutu kontrolü (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu çok büyük. Lütfen 10MB\'dan küçük bir dosya seçin.');
      return;
    }
    
    // Geçici önizleme
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Yükleme başlat
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Dosya yüklenemedi');
      }
      
      const data = await response.json();
      console.log('Yükleme başarılı:', data);
      
      // URL'yi parent component'e bildir
      onImageSelect(data.url);
      setPreviewUrl(data.url);
      
    } catch (error) {
      console.error('Yükleme hatası:', error);
      setError(error instanceof Error ? error.message : 'Dosya yüklenirken bir hata oluştu');
      // Hata durumunda önizlemeyi kaldır veya eski haline getir
      if (!currentImageUrl) {
        setPreviewUrl('');
      } else {
        setPreviewUrl(currentImageUrl);
      }
    } finally {
      setIsUploading(false);
      // Input alanını temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // URL ile resim ekleme
  const handleUrlSubmit = () => {
    if (!imageUrl) {
      setError('Lütfen bir URL girin');
      return;
    }
    
    setError(null);
    
    try {
      const url = new URL(imageUrl);
      // URL'yi parent component'e bildir
      onImageSelect(imageUrl);
      setPreviewUrl(imageUrl);
    } catch (error) {
      setError('Geçersiz URL formatı. Lütfen tam URL adresini girin (örn: https://example.com/image.jpg)');
    }
  };

  // Galeriden resim seçme
  const handleGallerySelect = (image: MediaItem) => {
    onImageSelect(image.url);
    setPreviewUrl(image.url);
  };

  // Dosya seçme dialog'unu aç
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Görüntü hata yakalama işleyicisi
  const handleImageError = () => {
    console.error('Görüntü yükleme hatası:', previewUrl);
    setError('Görüntü gösterilirken hata oluştu');
    // Doğrudan state güncellemesi yerine timeout kullanarak
    // React işlem sırasını bozmamak için güvenli gecikme ekleyelim
    setTimeout(() => {
      setPreviewUrl('');
    }, 0);
  };

  // Client tarafında render edilene kadar bekle
  if (!clientReady) {
    return <div className="w-full h-28 bg-gray-100 rounded-lg animate-pulse"></div>;
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Sekme Başlıkları */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === 'upload' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          Bilgisayardan
        </button>
        
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === 'url' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('url')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
          URL ile
        </button>
        
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === 'gallery' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('gallery')}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Galeriden
        </button>
      </div>
      
      {/* Önizleme Alanı */}
      {previewUrl && (
        <div className="px-4 pt-4">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
            <Image 
            src={previewUrl} 
            alt="Seçilen Görsel" 
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            style={{ objectFit: 'contain' }}
            className="rounded-lg"
            onError={handleImageError}
            loading="eager"
            unoptimized={previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')}
            />
          </div>
        </div>
      )}
      
      {/* Tab İçerikleri */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{label}</h3>
        
        {/* Bilgisayardan Yükleme */}
        {activeTab === 'upload' && (
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              ref={fileInputRef}
            />
            
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 
                rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white 
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yükleniyor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  Dosya Seç
                </>
              )}
            </button>
            
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG, WEBP, GIF veya SVG. Maksimum 10MB.
            </p>
          </div>
        )}
        
        {/* URL ile Ekleme */}
        {activeTab === 'url' && (
          <div>
            <div className="flex">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 border border-gray-300 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Ekle
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Tam URL adresini girin. Görsel erişilebilir olmalıdır.
            </p>
          </div>
        )}
        
        {/* Galeriden Seçme */}
        {activeTab === 'gallery' && (
          <div>
            {isLoadingGallery ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Henüz yüklenmiş görsel bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                {galleryImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`relative border rounded overflow-hidden cursor-pointer ${
                      previewUrl === image.url ? 'ring-2 ring-blue-500' : 'hover:opacity-80'
                    }`}
                    onClick={() => handleGallerySelect(image)}
                  >
                    <div className="aspect-square relative">
                      <Image 
                        src={image.url} 
                        alt={image.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                        sizes="100px"
                        unoptimized={image.url.startsWith('blob:') || image.url.startsWith('data:')}
                        onError={(e) => {
                          console.error(`Failed to load gallery image: ${image.url}`);
                          e.currentTarget.src = '/images/placeholder-image.svg';
                          setError(`Bir görsel yüklenemedi: ${image.name}. Başka bir görsel seçin.`);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={loadGalleryImages}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Galeriyi Yenile
            </button>
          </div>
        )}
        
        {/* Hata Mesajı */}
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}