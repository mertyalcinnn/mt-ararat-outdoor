import ActivityList from '../../../components/ActivityList';
import PageHeader from '../../../components/PageHeader';
import { getAllActivities } from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import { getDictionary } from '../../../dictionaries';

// Sayfa yenileme için revalidate değeri (saniye cinsinden) - 0 = Her istekte yeniden oluştur
export const revalidate = 0;

// FEtch cache devre dışı bırak
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function ActivitiesPage({ params }: { params: { lang: Locale } }) {
  // Cache'i devre dışı bırak
  const activitiesPromise = getAllActivities();
  console.log('Aktiviteler sayfası render ediliyor...');
  
  // Aktiviteler ve çeviriler yükleniyor
  const [activities, dictionary] = await Promise.all([
    activitiesPromise,
    Promise.resolve(getDictionary(params.lang))
  ]);
  
  const { navigation } = dictionary;
  
  if (!activities || activities.length === 0) {
    console.warn('Dikkat: Aktiviteler bulunamadı veya boş!');
  } else {
    console.log(`Başarılı: ${activities.length} aktivite yüklendi.`);
  }
  
  return (
    <div>
      <PageHeader 
        title={navigation.activities} 
        description="Ağrı Dağı ve çevresinde profesyonel rehberlerimiz eşliğinde yapabileceğiniz outdoor aktiviteler" 
      />
      
      <section className="section bg-light">
        <div className="container-custom">
          {/* timestamp ekleyerek sayfanın ne zaman render edildiğini görelim */}
          <div className="text-xs text-gray-400 text-right mb-4">
            Son güncelleme: {new Date().toLocaleTimeString()}
          </div>
          
          <ActivityList activities={activities} lang={params.lang} />
        </div>
      </section>
    </div>
  );
}