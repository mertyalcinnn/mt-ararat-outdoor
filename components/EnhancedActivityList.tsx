'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';
import { useState, useEffect } from 'react';

interface Activity {
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  difficultyLevel: string;
  duration: string;
  featured?: boolean;
}

interface ActivityListProps {
  activities: Activity[];
  lang: Locale;
}

// Varsayılan görsel yolu
const DEFAULT_IMAGE = "/images/placeholder-image.jpg";

export default function EnhancedActivityList({ activities, lang }: ActivityListProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Animasyon için görünürlük ayarla
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Öne çıkan aktiviteleri en başa al
  const sortedActivities = [...activities].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  }).filter(activity => activity); // undefined veya null değerleri filtrele

  // Dile göre farklı metinler
  const viewDetails = {
    tr: "Detayları Gör",
    en: "View Details",
    ru: "Подробнее"
  };
  
  const featured = {
    tr: "Öne Çıkan",
    en: "Featured",
    ru: "Рекомендуемый"
  };

  if (!sortedActivities || sortedActivities.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-gray-600">Henüz aktivite bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {sortedActivities.map((activity, index) => {
        // Kapak görselinin mevcut olduğundan emin olun ve varsayılan değer ekleyin
        const imageSrc = activity.coverImage && activity.coverImage.trim() !== '' 
          ? activity.coverImage 
          : DEFAULT_IMAGE;
          
        // Gecikme etkisi ile kademeli olarak gösterme için
        const delay = `${index * 0.1}s`;

        return (
          <div 
            key={index} 
            className={`group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: delay }}
          >
            <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
              <Image
                src={imageSrc}
                alt={activity.title || "Aktivite"}
                width={600}
                height={400}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/40 to-transparent opacity-60 group-hover:opacity-50 transition-opacity"></div>
              
              {/* Zorluk seviyesi ve süre göstergeleri - resim üzerinde */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                <div className="flex items-center bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{activity.duration}</span>
                </div>
                
                <div className="flex items-center bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span>{activity.difficultyLevel}</span>
                </div>
              </div>
              
              {activity.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="flex items-center bg-gradient-to-r from-primary to-secondary text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {featured[lang]}
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 relative z-10 bg-white">
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{activity.title}</h3>
              <p className="text-dark/70 mb-6 line-clamp-2">{activity.description}</p>
              
              <Link 
                href={`/${lang}/activities/${activity.slug}`} 
                className="inline-flex items-center justify-center w-full py-3 bg-light rounded-lg border-2 border-primary/20 text-primary font-medium hover:border-primary hover:bg-primary/5 transition-all duration-300"
              >
                <span>{viewDetails[lang]}</span>
                <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
