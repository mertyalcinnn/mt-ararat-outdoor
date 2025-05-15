import { getActivityBySlug, getAllActivities } from '@/lib/activities';
import { Locale } from '@/lib/i18n';
import { getDictionary } from '@/dictionaries';
import SafeImage from '@/components/SafeImage';
import ReactMarkdown from 'react-markdown';

// Aktivite arayüzünü tanımlayalım
interface Activity {
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  difficultyLevel: string;
  duration: string;
  content: string;
  gallery?: string[];
  includedServices?: string[];
  contactWhatsapp?: string;
}

// Sayfanın dinamik olduğunu belirt - her istekte yeniden oluşturulsun
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Tüm geçerli aktivite sluglarını getiren yardımcı fonksiyon
export async function generateStaticParams() {
  try {
    console.log('generateStaticParams aktiviteleri alıyor...');
    const activities = await getAllActivities();
    
    if (!activities || !Array.isArray(activities)) {
      console.error('Geçerli aktivite verisi alınamadı');
      return [];
    }
    
    // Her aktivite için slug üret
    const params = activities.map(activity => ({
      slug: activity.slug
    }));
    
    console.log(`${params.length} aktivite parametre oluşturuldu.`);
    return params;
  } catch (error) {
    console.error('Aktivite parametreleri oluşturulurken hata:', error);
    return [];
  }
}

export default async function ActivityDetailPage({ params }: { params: { lang: Locale; slug: string } }) {
  console.log(`[${new Date().toISOString()}] [${params.lang}] Aktivite detay sayfası render ediliyor: "${params.slug}"`);
  
  // Dil sözlüğünü al
  const dict = getDictionary(params.lang);
  
  // Aktiviteyi al
  const activity = await getActivityBySlug(params.slug) as Activity;

  // Aktivite bulunamadıysa hata mesajı göster
  if (!activity) {
    return (
      <div className="relative mt-24 pt-16 pb-12 text-center"> {/* Header için yeterli boşluk */}
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Aktivite Bulunamadı</h1>
          <p className="text-gray-600 mb-8">
            Aradığınız aktivite bulunamadı veya kaldırılmış olabilir.
          </p>
          <a 
            href={`/${params.lang}/activities`}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tüm Aktivitelere Dön
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative mt-24 pt-16 pb-12"> {/* Header için yeterli boşluk */}
      <div className="container mx-auto px-4">
        {/* Hero Bölümü */}
        <div className="relative h-96 rounded-xl overflow-hidden mb-8 shadow-lg">
          {activity.coverImage ? (
            <SafeImage
              src={activity.coverImage} 
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
              <span>Kapak görseli bulunamadı</span>
            </div>
          )}
          
          {/* Hero Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-8">
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 text-sm rounded-full text-white ${
                activity.difficultyLevel === 'Kolay' ? 'bg-green-600' :
                activity.difficultyLevel === 'Orta' ? 'bg-yellow-600' :
                activity.difficultyLevel === 'Zor' ? 'bg-orange-600' : 'bg-red-600'
              }`}>
                {activity.difficultyLevel}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{activity.title}</h1>
            <p className="text-xl text-gray-200 max-w-3xl">{activity.description}</p>
          </div>
        </div>
        
        {/* Ana İçerik */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Markdown İçerik */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown>{activity.content}</ReactMarkdown>
              </article>
            </div>
            
            {/* Galeri */}
            {activity.gallery && activity.gallery.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Galeri</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {activity.gallery.map((image: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <SafeImage
                        src={image}
                        alt={`${activity.title} - Görsel ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Yan Panel */}
          <div>
            {/* Detaylar Kartı */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Detaylar</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Süre</p>
                    <p className="font-medium">{activity.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Zorluk Seviyesi</p>
                    <p className="font-medium">{activity.difficultyLevel}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dahil Olan Hizmetler Kartı */}
            {activity.includedServices && activity.includedServices.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Dahil Olan Hizmetler</h3>
                <ul className="space-y-2">
                  {activity.includedServices.map((service: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 mt-0.5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* İletişim Kartı */}
            <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Rezervasyon Yapın</h3>
              <p className="mb-6">Bu aktivite hakkında daha fazla bilgi almak veya rezervasyon yapmak için bizimle iletişime geçin.</p>
              
              {activity.contactWhatsapp && (
                <a 
                  href={`https://wa.me/${activity.contactWhatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors mb-3"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M17.5 13.2c-.5-.2-1.3-.4-1.8-.6-.7-.3-1.5-.1-2 .5l-.3.3c-.3.3-.7.3-1 .1-1.2-.9-2.1-1.8-2.9-2.9-.3-.4-.2-.9.1-1.2l.3-.3c.5-.6.7-1.4.4-2.1-.2-.5-.4-1.2-.6-1.7-.3-.7-1-1.3-1.8-1.3H6.8c-1.4 0-2.4 1.4-1.9 2.7 2 4.4 5.2 7.6 9.6 9.6 1.3.6 2.7-.5 2.7-1.9v-1.1c0-.8-.6-1.5-1.2-1.8z"/>
                  </svg>
                  WhatsApp ile İletişim
                </a>
              )}
              
              <a 
                href={`/${params.lang}/contact`}
                className="flex items-center justify-center w-full bg-white hover:bg-gray-100 text-blue-600 py-3 px-4 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                İletişim Formu
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}