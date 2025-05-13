'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';

interface InstagramProfileWidgetProps {
  title: string;
  description: string;
  followText: string;
  lang: Locale;
  instagramUsername: string;
  postCount?: number;
}

// Varsayılan resimler (Instagram bağlantısı olmadığında gösterilecek)
const fallbackImageUrls = [
  '/images/about-section.jpg',
  '/images/climbing-cover.jpg',
  '/images/hiking-cover.jpg',
  '/images/hero-image.jpg',
  '/images/private-guidance-cover.jpg',
  '/images/sea-kayak-sup-cover.jpg',
  '/images/ski-touring-cover.jpg',
  '/images/placeholder-image.jpg'
];

export default function InstagramProfileWidget({
  title,
  description,
  followText,
  lang,
  instagramUsername,
  postCount = 5
}: InstagramProfileWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(4);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const instagramProfileUrl = `https://instagram.com/${instagramUsername}`;
  
  // Instagram post placeholder indeksleri
  const postPlaceholderRefs = useRef<HTMLDivElement[]>([]);
  
  // Rastgele değil sabit sırayla placeholder resimleri kullan
  const placeholderImages = fallbackImageUrls.slice(0, postCount);

  // Ekran boyutuna göre kolon sayısını ayarla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(2); // Mobil için 2 kolon
      } else if (window.innerWidth < 1024) {
        setColumns(2); // Tablet için 2 kolon
      } else {
        setColumns(3); // Desktop için 3 kolon
      }
    };

    // İlk yüklemede çağır
    handleResize();

    // Ekran boyutu değişimlerini izle
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Instagram embed scriptini yükle
  useEffect(() => {
    if (scriptLoaded && window.instgrm) {
      window.instgrm.Embeds.process();
      setLoading(false);
    }
  }, [scriptLoaded]);

  // Sabit post ID'leri kullan
  const postIds = [
    'C1hsdcgM9PB',
    'B7nZ2pKAMXr',
    'CZr3yOBMl2x',
    'D8gTq5nF_Pm',
    'E5kLwpqRs9N',
  ];
  
  // Doğrudan erişim için URL'ler - sabit ID'ler kullan
  const postUrls = Array.from({ length: postCount }).map((_, index) => 
    `https://www.instagram.com/p/${postIds[index % postIds.length]}/`
  );

  return (
    <section className="section bg-white">
      {/* Instagram embedlerini yüklemek için gerekli script */}
      <Script 
        src="//www.instagram.com/embed.js" 
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg max-w-2xl mx-auto">
            {description}
            <a
              href={instagramProfileUrl}
              className="text-primary font-bold ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {followText}
            </a>
          </p>
        </div>

        {/* Profil gösterici - estetik ve yüksek kaliteli */}
        <div className="relative mb-12 overflow-hidden rounded-xl shadow-xl max-w-4xl mx-auto">
          <a 
            href={instagramProfileUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-24"></div>
            <div className="flex flex-col md:flex-row p-4 pb-6 -mt-10 bg-white items-center">
              <div className="relative h-24 w-24 rounded-full border-4 border-white overflow-hidden shadow-lg mb-4 md:mb-0 md:mr-4">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                  {instagramUsername.slice(0, 1).toUpperCase()}
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-xl font-bold">@{instagramUsername}</h3>
                <p className="text-gray-500 text-sm mb-2">Instagram Profili</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <span className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs">
                    #outdoor
                  </span>
                  <span className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs">
                    #climbing
                  </span>
                  <span className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs">
                    #adventure
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Takip Et
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Yüksek kaliteli görsel grid galerisi */}
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4 mb-8`}>
          {placeholderImages.map((imageUrl, index) => (
            <a 
              key={index}
              href={instagramProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div 
                className="aspect-square rounded-lg overflow-hidden relative shadow-md group-hover:shadow-xl transition-all duration-300"
                ref={el => { if (el) postPlaceholderRefs.current[index] = el; }}
              >
                <div className="w-full h-full relative">
                  <div 
                    className="w-full h-full absolute z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                  <Image
                    src={imageUrl}
                    alt={`Instagram gönderi ${index + 1}`}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span className="text-sm font-medium">245</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      <span className="text-sm font-medium">18</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
        
        <div className="text-center">
          <a
            href={instagramProfileUrl}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-medium rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>Tüm Gönderileri Görüntüle</span>
          </a>
        </div>
      </div>
    </section>
  );
}
