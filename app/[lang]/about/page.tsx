// Using server component since we're fetching data
// Remove "use client" directive

import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import TeamMember from '../../../components/TeamMember';
import { getAboutData } from '../../../lib/api'; // Changed to use api.ts instead of api-mongodb.ts
import { Locale } from '../../../lib/i18n';
import { getDictionary } from '../../../dictionaries';

export default async function AboutPage({ params }: { params: { lang: Locale } }) {
  // async fonksiyon olarak değiştirildi ve await eklendi
  const aboutData = await getAboutData();
  const dictionary = getDictionary(params.lang);
  const { navigation } = dictionary;
  
  // Dile göre metinler
  const aboutPageTexts = {
    tr: {
      subtitle: "Profesyonel outdoor rehberliğinde kalite ve güvenlik.",
      teamTitle: "Ekibimiz",
      ctaTitle: "Bizimle Maceraya Çıkmaya Hazır mısınız?",
      ctaDescription: "Profesyonel rehberlerimiz eşliğinde Ağrı Dağı'nın eşsiz doğasında unutulmaz bir deneyime hazırlanın.",
      ctaButton: "Şimdi Rezervasyon Yapın"
    },
    en: {
      subtitle: "Quality and safety in professional outdoor guidance.",
      teamTitle: "Our Team",
      ctaTitle: "Are You Ready for an Adventure with Us?",
      ctaDescription: "Prepare for an unforgettable experience in the unique nature of Mount Ararat with our professional guides.",
      ctaButton: "Make a Reservation Now"
    },
    ru: {
      subtitle: "Качество и безопасность в профессиональном руководстве на открытом воздухе.",
      teamTitle: "Наша команда",
      ctaTitle: "Готовы к приключениям с нами?",
      ctaDescription: "Приготовьтесь к незабываемым впечатлениям в уникальной природе горы Арарат с нашими профессиональными гидами.",
      ctaButton: "Забронировать сейчас"
    }
  };
  
  const texts = aboutPageTexts[params.lang];
  
  return (
    <div>
      <PageHeader 
        title={aboutData.title} 
        description={texts.subtitle} 
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
            <h2 className="text-3xl font-bold mb-12 text-center">{texts.teamTitle}</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aboutData.teamMembers.map((member: any, index: number) => (
                <TeamMember 
                  key={index}
                  name={member.name}
                  role={member.role}
                  bio={member.bio}
                  image={member.image}
                  lang={params.lang}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      <section className="section bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-6">{texts.ctaTitle}</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            {texts.ctaDescription}
          </p>
          <Link href={`/${params.lang}/contact`} className="btn bg-white text-primary hover:bg-light">
            {texts.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}