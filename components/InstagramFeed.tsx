'use client';

import { useState, useEffect } from 'react';
import { Locale } from '@/lib/i18n';
import { InstagramPost, staticPosts } from '@/lib/instagram';

interface InstagramFeedProps {
  title: string;
  description: string;
  followText: string;
  lang: Locale;
  instagramUsername?: string;
  posts?: InstagramPost[];
}

export default function InstagramFeed({ 
  title, 
  description, 
  followText, 
  lang, 
  instagramUsername = 'likyaclimbing_olympos',
  posts: initialPosts 
}: InstagramFeedProps) {
  // Responsive grid için farklı kolon sayıları
  const [columns, setColumns] = useState(4);
  const [posts, setPosts] = useState<InstagramPost[]>(initialPosts && initialPosts.length > 0 ? initialPosts : staticPosts);
  const [loading, setLoading] = useState(false);
  
  // Instagram profil linki
  const instagramProfileUrl = `https://instagram.com/${instagramUsername}`;

  // Client-side olarak Instagram gönderilerini çekme
  useEffect(() => {
    // Her durumda API'den gönderileri çek
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Limit parametresi ekleyerek sadece 5 gönderi çek
        const response = await fetch(`/api/instagram?username=${instagramUsername}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setPosts(data);
          }
        }
      } catch (error) {
        console.warn('Instagram gönderileri istemci tarafında çekilemedi:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
    
    // 5 dakikada bir gönderileri yenile (opsiyonel)
    const refreshInterval = setInterval(fetchPosts, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [instagramUsername]);

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
  const limitedPosts = posts.slice(0, columns * 2);

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
          {loading ? (
            // Yükleme göstergesi
            Array.from({ length: columns * 2 }).map((_, index) => (
              <div key={`loading-${index}`} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
            ))
          ) : (
            // Instagram gönderileri
            limitedPosts.map((post) => (
              <a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square relative overflow-hidden rounded-lg group"
              >
                {/* Görsel arka planlı div kullan - daha güvenilir */}
                <div 
                  className="w-full h-full bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url(${post.imageUrl})` }}
                  aria-label={post.caption || "Instagram Paylaşımı"}
                ></div>
                <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
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
                </div>
                
                {post.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p 
                      className="text-white text-sm line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: formatCaption(post.caption) }}
                    ></p>
                  </div>
                )}
              </a>
            ))
          )}
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
