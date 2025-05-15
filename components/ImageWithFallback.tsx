'use client';

import { useState } from 'react';

export default function ImageWithFallback({ src, alt, className, ...props }) {
  const [error, setError] = useState(false);
  const [srcUrl, setSrcUrl] = useState(src);

  const handleError = () => {
    // Eğer zaten fallback görsele düştüyse tekrar deneme
    if (error) return;
    
    console.error('Görsel yüklenemedi:', src);
    
    // Eğer Cloudinary URL'si değilse ve yerel bir yolsa, dosya sistemi yolunu düzelt
    if (!src.includes('cloudinary.com') && src.startsWith('/')) {
      // '/uploads/...' gibi bir yol, tam URL'ye çevirelim
      const fullUrl = `${window.location.origin}${src}`;
      console.log('Tam URL deneniyor:', fullUrl);
      setSrcUrl(fullUrl);
    } else {
      // Yine başarısız olursa hata durumunu işaretle ve placeholder göster
      setError(true);
    }
  };

  if (error) {
    // Hata durumunda placeholder göster
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 text-center ${className}`}
        style={{ minHeight: '150px' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-gray-400 mb-2"
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
    );
  }

  return (
    <img
      src={srcUrl || '/images/placeholder.jpg'}
      alt={alt || "Görsel"}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}