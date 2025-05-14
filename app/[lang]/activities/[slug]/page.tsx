import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';
import ActivityGallery from '../../../../components/ActivityGallery';
import { getActivityBySlug, getAllActivities } from '../../../../lib/api';
import { Locale } from '../../../../lib/i18n';
import { getDictionary } from '../../../../dictionaries';

// Sayfa yenileme için revalidate değeri (saniye cinsinden) - 0 = Her istekte yeniden oluştur
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

export default async function ActivityPage({ params }: { params: { slug: string, lang: Locale } }) {
  try {
    const activity = await getActivityBySlug(params.slug);
    const dictionary = getDictionary(params.lang);
    const { navigation } = dictionary;
    
    if (!activity) {
      notFound();
    }
    
    return (
      <div>
        <div className="relative h-[50vh] min-h-[400px]">
          <div className="absolute inset-0">
            <Image 
              src={activity.coverImage} 
              alt={activity.title}
              fill
              className="object-cover"
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
                    <ActivityGallery images={activity.gallery} title={activity.title} />
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
                    {activity.contactWhatsapp && (
                      <a 
                        href={`https://wa.me/${activity.contactWhatsapp.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary w-full text-center flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"></path>
                          <path d="M13.398 20.997h-.004c-1.839-.001-3.649-.47-5.24-1.358l-.376-.224-3.895 1.021 1.04-3.798-.246-.391c-.975-1.553-1.492-3.34-1.492-5.16.001-5.357 4.363-9.719 9.722-9.719 2.598.001 5.039 1.013 6.873 2.85 1.835 1.837 2.846 4.278 2.845 6.876-.001 5.356-4.363 9.719-9.72 9.719z" fillRule="evenodd"></path>
                          <path d="M11.996 2.268c-4.695 0-8.517 3.823-8.518 8.52-.001 1.609.45 3.179 1.303 4.533l-1.386 5.059 5.176-1.357c1.305.711 2.778 1.086 4.275 1.086 4.694 0 8.516-3.823 8.517-8.52 0-2.277-.887-4.416-2.498-6.029s-3.752-2.501-6.029-2.501l.16-.141zm-5.207 18.018l.002-.004.001-.002z" fill="none"></path>
                        </svg>
                        {params.lang === 'tr' ? 'Rezervasyon Yap' : params.lang === 'en' ? 'Make Reservation' : 'Забронировать'}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="section bg-light">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-6">Diğer Aktivitelerimizi Keşfedin</h2>
            <Link href={`/${params.lang}/activities`} className="btn btn-outline">
              {navigation.activities}
            </Link>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Aktivite sayfası render hatası:', error);
    notFound();
  }
}