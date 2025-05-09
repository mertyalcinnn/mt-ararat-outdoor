'use client';

import { useState, useEffect } from 'react';
import { Locale } from '@/lib/i18n';

interface ManualInstagramFeedProps {
  title: string;
  description: string;
  followText: string;
  lang: Locale;
  instagramUsername?: string;
}

// Garantili çalışması için doğrudan sabit içerik
const manualPosts = [
  {
    id: '1',
    caption: 'Likya bölgesinde muhteşem bir gün #tırmanış #outdoor',
    colorClass: 'bg-blue-200'
  },
  {
    id: '2',
    caption: 'Olympos kayalıkları #climbing #nature',
    colorClass: 'bg-green-200'
  },
  {
    id: '3',
    caption: 'Akşam tırmanışı #sunset #climbing',
    colorClass: 'bg-yellow-200'
  },
  {
    id: '4',
    caption: 'Doğa ile iç içe macera #adventure',
    colorClass: 'bg-red-200'
  },
  {
    id: '5',
    caption: 'Kış sezonu başladı #skiing #winter',
    colorClass: 'bg-purple-200'
  },
  {
    id: '6',
    caption: 'Karlı dağlar #skitouring',
    colorClass: 'bg-pink-200'
  },
  {
    id: '7',
    caption: 'Zirve tırmanışı #mountaineering',
    colorClass: 'bg-indigo-200'
  },
  {
    id: '8',
    caption: 'Ekibimizle birlikte #team #outdoor',
    colorClass: 'bg-teal-200'
  }
];

export default function ManualInstagramFeed({ 
  title, 
  description, 
  followText, 
  lang, 
  instagramUsername = 'likyaclimbing_olympos',
}: ManualInstagramFeedProps) {
  // Responsive grid için farklı kolon sayıları
  const [columns, setColumns] = useState(4);
  
  // Instagram profil linki
  const instagramProfileUrl = `https://instagram.com/${instagramUsername}`;

  // Ekran boyutuna göre kolon sayısını ayarla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(2); // Mobil için 2 kolon
      } else if (window.innerWidth < 1024) {
        setColumns(3); // Tablet için 3 kolon
      } else {
        setColumns(4); // Desktop için 4 kolon
      }
    };

    // İlk yüklemede çağır
    handleResize();

    // Ekran boyutu değişimlerini izle
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Göstermek için posts sayısını sınırla
  const limitedPosts = manualPosts.slice(0, columns * 2);

  // Hashtag'leri bulup link haline getirme
  const formatCaption = (caption: string) => {
    if (!caption) return '';
    
    // Hashtag'leri bul ve link haline getir
    return caption.replace(/#(\w+)/g, '<span class="text-primary">#$1</span>');
  };

  return (
    <section className="section bg-white">
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

        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(columns, 4)} gap-4`}>
          {limitedPosts.map((post) => (
            <a
              key={post.id}
              href={instagramProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square relative overflow-hidden rounded-lg group"
            >
              {/* Renkli arka plan kullan */}
              <div className={`w-full h-full ${post.colorClass} flex items-center justify-center`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              
              {post.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p 
                    className="text-white text-sm line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: formatCaption(post.caption) }}
                  ></p>
                </div>
              )}
            </a>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a
            href={instagramProfileUrl}
            className="inline-flex items-center justify-center px-6 py-3 bg-light border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors"
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
            <span>@{instagramUsername}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
