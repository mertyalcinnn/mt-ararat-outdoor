'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';

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
  // Yeni OptimizedImage bileşenini kullan
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      width={width || 400}
      height={height || 300}
      objectFit={objectFit}
    />
  );
}