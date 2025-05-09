import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import ActivityGallery from '@/components/ActivityGallery';
import { getActivityBySlug, getAllActivities } from '@/lib/api';

export function generateStaticParams() {
  const activities = getAllActivities();
  return activities.map((activity) => ({
    slug: activity.slug,
  }));
}

export default function ActivityPage({ params }: { params: { slug: string } }) {
  const activity = getActivityBySlug(params.slug);
  
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
                  
                  <div>
                    <h4 className="font-semibold text-dark/70">Fiyat</h4>
                    <p className="text-lg font-bold text-primary">{activity.price}</p>
                  </div>
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
}