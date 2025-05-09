import ActivityList from '@/components/ActivityList';
import PageHeader from '@/components/PageHeader';
import { getAllActivities } from '@/lib/api';

export default function ActivitiesPage() {
  const activities = getAllActivities();
  
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