'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt = '',
  width = 500,
  height = 300,
  className = '',
  objectFit = 'cover',
  priority = false,
  quality = 85
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  
  // URL düzeltici fonksiyon
  const fixImageSrc = (url: string): string => {
    if (!url) return '/images/placeholder.jpg';
    
    // localhost referanslarını temizle
    if (url.includes('localhost')) {
      // http://localhost:3000/uploads/image.jpg -> /uploads/image.jpg
      return url.replace(/^https?:\/\/localhost:[0-9]+/, '');
    }
    
    // Mutlak URL kontrolü
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Göreceli URL düzeltme
    if (url.startsWith('/')) {
      // /tr/uploads/ gibi dil kodlarını temizle
      if (url.match(/^\/[a-z]{2}\/uploads\//i)) {
        return url.replace(/^\/[a-z]{2}(\/uploads\/.*)$/i, '$1');
      }
      return url;
    }
    
    // Diğer durumlar için varsayılan
    return `/uploads/${url}`;
  };
  
  // URL düzeltilmesi
  const correctedSrc = fixImageSrc(imageSrc);
  
  // Hata durumunda placeholder göster
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-center rounded overflow-hidden ${className}`} 
        style={{ width, height }}
      >
        <div className="p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-400 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 text-sm">Görsel yüklenemedi</p>
        </div>
      </div>
    );
  }
  
  // Bazı URL'ler Next.js Image ile çalışmayabilir, onun için kontroller
  if (correctedSrc.startsWith('/uploads/')) {
    // Yerel görsel için Next.js Image bileşeni
    return (
      <div style={{ position: 'relative', width, height }} className={className}>
        <Image
          src={correctedSrc}
          alt={alt}
          fill
          style={{ objectFit }}
          quality={quality}
          priority={priority}
          onError={() => {
            console.error(`Görsel yüklenemedi: ${correctedSrc}`);
            
            // Alternatif yolla tekrar dene
            const absoluteUrl = `${window.location.origin}${correctedSrc}`;
            if (correctedSrc !== absoluteUrl) {
              setImageSrc(absoluteUrl);
            } else {
              setError(true);
            }
          }}
        />
      </div>
    );
  }
  
  // Harici URL'ler için normal img etiketi
  return (
    <img
      src={correctedSrc}
      alt={alt}
      className={className}
      style={{ width, height, objectFit }}
      onError={() => setError(true)}
    />
  );
}