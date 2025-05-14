import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ActivityGalleryClient from '../../../components/ActivityGalleryClient';
import { getActivityBySlug, getAllActivities } from '../../../lib/api';

// Bu sayfa dynamic olarak işaretleniyor
export const dynamic = 'force-dynamic';

// Vercel build için statik olarak boş bir slug listesi oluştur
// Build sırasındaki hata için geçici çözüm
export async function generateStaticParams() {
  try {
    // Veri almayı dene
    const activities = await getAllActivities();
    
    // Dizi kontrolü yap
    if (activities && Array.isArray(activities) && activities.length > 0) {
      return activities.map((activity) => ({
        slug: activity.slug,
      }));
    }
    
    console.log('getAllActivities bir dizi döndürmedi veya boş, boş slug listesi kullanılıyor.');
  } catch (error) {
    console.error('generateStaticParams fonksiyonunda hata:', error);
  }
  
  // Herhangi bir hata durumunda veya veri yoksa boş bir slug listesi döndür
  // Bu, build sırasındaki hatayı önlemeye yardımcı olacaktır
  return [];
}

export default async function ActivityPage({ params }: { params: { slug: string } }) {
  try {
    const activity = await getActivityBySlug(params.slug);
    
    if (!activity) {
      notFound();
    }
    
    return (
      <div>
        <div className="relative h-[50vh] min-h-[400px]">
          <div className="absolute inset-0">
            <img 
              src={activity.coverImage} 
              alt={activity.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-dark/50"></div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{activity.title}</h1>
              <p className="text-xl md:text-2xl max-w-2xl">{activity.description}</p>
            </div>
          </div>
        </div>
        
        <section className="section">
          <div className="container-custom">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown>{activity.content}</ReactMarkdown>
                </div>
                
                {activity.gallery && activity.gallery.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Galeri</h2>
                    <ActivityGalleryClient images={activity.gallery} title={activity.title} />
                  </div>
                )}
              </div>
              
              <div>
                <div className="bg-light rounded-lg shadow-md p-6 sticky top-24">
                  <h3 className="text-xl font-bold mb-4">Aktivite Detayları</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-dark/70">Süre</h4>
                      <p>{activity.duration}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-dark/70">Zorluk Seviyesi</h4>
                      <p>{activity.difficultyLevel}</p>
                    </div>
                    
                    {activity.includedServices && activity.includedServices.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-dark/70">Dahil Olan Hizmetler</h4>
                        <ul className="list-disc pl-5 mt-2">
                          {activity.includedServices.map((service: string, index: number) => (
                            <li key={index}>{service}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <a href="/contact" className="btn btn-primary w-full text-center">Rezervasyon Yap</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="section bg-light">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-6">Diğer Aktivitelerimizi Keşfedin</h2>
            <a href="/activities" className="btn btn-outline">Tüm Aktiviteler</a>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Aktivite sayfası render hatası:', error);
    notFound();
  }
}