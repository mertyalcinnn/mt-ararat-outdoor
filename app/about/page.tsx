import ReactMarkdown from 'react-markdown';
import PageHeader from '@/components/PageHeader';
import TeamMember from '@/components/TeamMember';
import { getAboutData } from '@/lib/api';

export default function AboutPage() {
  const aboutData = getAboutData();
  
  return (
    <div>
      <PageHeader 
        title={aboutData.title} 
        description="Profesyonel outdoor rehberliğinde kalite ve güvenlik." 
      />
      
      <section className="section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>{aboutData.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </section>
      
      {aboutData.teamMembers && aboutData.teamMembers.length > 0 && (
        <section className="section bg-light">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-12 text-center">Ekibimiz</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aboutData.teamMembers.map((member: any, index: number) => (
                <TeamMember 
                  key={index}
                  name={member.name}
                  role={member.role}
                  bio={member.bio}
                  image={member.image}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      <section className="section bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-6">Bizimle Maceraya Çıkmaya Hazır mısınız?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Profesyonel rehberlerimiz eşliğinde Ağrı Dağı'nın eşsiz doğasında unutulmaz bir deneyime hazırlanın.
          </p>
          <a href="/contact" className="btn bg-white text-primary hover:bg-light">Şimdi Rezervasyon Yapın</a>
        </div>
      </section>
    </div>
  );
}