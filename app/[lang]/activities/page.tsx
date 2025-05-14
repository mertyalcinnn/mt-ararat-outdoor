import ActivityList from '../../../components/ActivityList';
import PageHeader from '../../../components/PageHeader';
import { getAllActivities } from '../../../lib/api';
import { Locale } from '../../../lib/i18n';
import { getDictionary } from '../../../dictionaries';

// Sayfa yenileme için revalidate değeri (saniye cinsinden) - 0 = Her istekte yeniden oluştur
export const revalidate = 0;

export default async function ActivitiesPage({ params }: { params: { lang: Locale } }) {
  const activities = await getAllActivities();
  const dictionary = getDictionary(params.lang);
  const { navigation } = dictionary;
  
  return (
    <div>
      <PageHeader 
        title={navigation.activities} 
        description="Ağrı Dağı ve çevresinde profesyonel rehberlerimiz eşliğinde yapabileceğiniz outdoor aktiviteler" 
      />
      
      <section className="section bg-light">
        <div className="container-custom">
          <ActivityList activities={activities} lang={params.lang} />
        </div>
      </section>
    </div>
  );
}