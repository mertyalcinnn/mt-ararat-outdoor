import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';

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

export default function ActivityList({ activities, lang }: ActivityListProps) {
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
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {sortedActivities.map((activity, index) => {
        // Kapak görselinin mevcut olduğundan emin olun ve varsayılan değer ekleyin
        const imageSrc = activity.coverImage && activity.coverImage.trim() !== '' 
          ? activity.coverImage 
          : DEFAULT_IMAGE;

        return (
          <div key={index} className="group relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
            <div className="aspect-w-3 aspect-h-2 relative overflow-hidden">
              <Image
                src={imageSrc}
                alt={activity.title || "Aktivite"}
                width={600}
                height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity"></div>
              
              {activity.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-accent text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                    {featured[lang]}
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 relative z-10 bg-white">
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{activity.title}</h3>
              <p className="text-dark/70 mb-4 line-clamp-2">{activity.description}</p>
              
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 text-primary mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-dark/80">{activity.duration}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 text-primary mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span className="text-dark/80">{activity.difficultyLevel}</span>
                </div>
              </div>
              
              <Link 
                href={`/${lang}/activities/${activity.slug}`} 
                className="inline-flex items-center justify-center w-full py-3 bg-light border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <span>{viewDetails[lang]}</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
