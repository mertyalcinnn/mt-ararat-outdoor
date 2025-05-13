'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface InstagramPromoBannerProps {
  title: string;
  description: string;
  followText: string;
  lang: Locale;
  instagramUsername: string;
}

export default function InstagramPromoBanner({
  title,
  description,
  followText,
  lang,
  instagramUsername
}: InstagramPromoBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const instagramProfileUrl = `https://instagram.com/${instagramUsername}`;
  
  // Görünüm animasyonu için mount olduktan sonra görünür yap
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white overflow-hidden relative">
      {/* Arka plan dekorasyon elemanları */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white opacity-10"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white opacity-5"></div>
        
        {/* Instagram Simgesi (arka planda büyük ve soluk) */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-5">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </div>
      </div>
      
      <div className="container-custom relative">
        <div className={`text-center max-w-3xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
          
          <p className="text-xl opacity-90 mb-8">
            {description}
          </p>
          
          {/* Instagram Profil Kartı */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-10 shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-yellow-500 via-pink-500 to-red-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">@{instagramUsername}</h3>
                <p className="opacity-80">{followText}</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-white/20 rounded-md animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
            
            <div className="mt-6 flex justify-center items-center">
              <Link 
                href={instagramProfileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-yellow-500 via-pink-500 to-red-500 text-white py-3 px-8 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Profili Görüntüle
              </Link>
            </div>
          </div>
          
          {/* Sosyal Medya İstatistikleri */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="rounded-lg bg-white/10 backdrop-blur-md p-4">
              <div className="text-3xl font-bold">1K+</div>
              <div className="text-sm opacity-80">Takipçi</div>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-md p-4">
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm opacity-80">Gönderi</div>
            </div>
            <div className="rounded-lg bg-white/10 backdrop-blur-md p-4">
              <div className="text-3xl font-bold">5+</div>
              <div className="text-sm opacity-80">Yıllık Deneyim</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
