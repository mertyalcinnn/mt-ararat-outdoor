'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// URL yollarındaki dil kodunu temizleyerek doğru görüntü URL'si elde etmek için yardımcı fonksiyon
export const fixImagePath = (url: string): string => {
  if (!url) return '';
  
  // URL zaten tam ise (http:// veya https:// ile başlıyorsa)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // URL içinde dil kodu varsa temizle
    if (url.match(/\/[a-z]{2}\/uploads\//i)) {
      return url.replace(/\/([a-z]{2})\/uploads\//i, '/uploads/');
    }
    return url;
  }
  
  // URL göreli ise (/ ile başlıyorsa)
  if (url.startsWith('/')) {
    // Dil kodu içeriyorsa temizle
    if (url.match(/^\/[a-z]{2}\/uploads\//i)) {
      return url.replace(/^\/[a-z]{2}(\/uploads\/.*)$/i, '$1');
    }
    return url;
  }
  
  // URL belirsiz bir formatta ise
  return url;
};

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onError?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export default function SafeImage({ 
  src, 
  alt, 
  className = '',
  width,
  height,
  onError,
  objectFit = 'cover'
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    // Dil kodunu temizle
    const fixedSrc = fixImagePath(src);
    setImageSrc(fixedSrc);
    setError(false);
  }, [src]);
  
  const handleError = () => {
    console.error('Görüntü yükleme hatası:', imageSrc);
    
    // Hata meydana geldiğinde, görüntü URL'sini değiştirmeyi dene
    if (imageSrc && imageSrc !== src) {
      // Farklı bir doğrultuda daha denenmiş ve hala başarısız olunmuşsa
      setError(true);
      
      if (onError) {
        onError();
      }
    } else if (imageSrc && (imageSrc.includes('/tr/') || imageSrc.includes('/en/') || imageSrc.includes('/ru/'))) {
      // Dil kodu içeriyorsa temizle ve tekrar dene
      const fixedUrl = imageSrc.replace(/\/([a-z]{2})\//i, '/');
      console.log('URL\'den dil kodu çıkarıldı, yeni URL:', fixedUrl);
      setImageSrc(fixedUrl);
    } else if (imageSrc.startsWith('/') && !imageSrc.startsWith('http')) {
      // Göreli URL'yi tam URL'ye çevirmeyi dene
      const fullUrl = `${window.location.origin}${imageSrc}`;
      console.log('Göreli URL tam URL\'ye çevrildi:', fullUrl);
      setImageSrc(fullUrl);
    } else {
      // Tüm denemeler başarısız oldu
      setError(true);
      
      if (onError) {
        onError();
      }
    }
  };
  
  if (error || !imageSrc) {
    // Placeholder görüntü
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
        style={{ width: width || '100%', height: height || '100%' }}
      >
        <span className="text-xs">Görsel Yüklenemedi</span>
      </div>
    );
  }
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={{ 
        objectFit, 
        width: width ? `${width}px` : '100%', 
        height: height ? `${height}px` : '100%' 
      }}
      onError={handleError}
    />
  );
}