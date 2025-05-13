import ActivityList from '@/components/ActivityList';
import PageHeader from '@/components/PageHeader';
import { getAllActivities } from '@/lib/api';

export const revalidate = 0; // Her istekte sayfayı yeniden oluştur

export default async function ActivitiesPage() {
  const activities = await getAllActivities();
  
  return (
    <div>
      <PageHeader 
        title="Aktivitelerimiz" 
        description="Ağrı Dağı ve çevresinde profesyonel rehberlerimiz eşliğinde yapabileceğiniz outdoor aktiviteler" 
      />
      
      <section className="section bg-light">
        <div className="container-custom">
          <ActivityList activities={activities} />
        </div>
      </section>
    </div>
  );
}