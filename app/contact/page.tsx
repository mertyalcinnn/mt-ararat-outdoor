import ReactMarkdown from 'react-markdown';
import PageHeader from '@/components/PageHeader';
import ContactForm from '@/components/ContactForm';
import { getContactData } from '@/lib/api';

export default function ContactPage() {
  const contactData = getContactData();
  
  return (
    <div>
      <PageHeader 
        title={contactData.title} 
        description="Sorularınız veya rezervasyon talepleriniz için bizimle iletişime geçin." 
      />
      
      <section className="section">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Bize Ulaşın</h2>
              
              <div className="space-y-6">
                {contactData.address && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">Adres</h3>
                    <p>{contactData.address}</p>
                  </div>
                )}
                
                {contactData.email && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">E-posta</h3>
                    <p><a href={`mailto:${contactData.email}`} className="text-primary hover:underline">{contactData.email}</a></p>
                  </div>
                )}
                
                {contactData.phone && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">Telefon</h3>
                    <p><a href={`tel:${contactData.phone}`} className="text-primary hover:underline">{contactData.phone}</a></p>
                  </div>
                )}
              </div>
              
              {contactData.content && (
                <div className="mt-8 prose">
                  <ReactMarkdown>{contactData.content}</ReactMarkdown>
                </div>
              )}
              
              {contactData.mapLocation && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Konum</h3>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg">
                    <iframe
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d97956.87315587593!2d44.22017270486378!3d39.701913090291696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4066a7536c6a962d%3A0x1d43a74bb35cea3!2sMount%20Ararat!5e0!3m2!1sen!2str!4v1651057138690!5m2!1sen!2str`}
                      width="600"
                      height="450"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full rounded-lg"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6">Mesaj Gönderin</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
      
      <section className="section bg-light">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-primary text-4xl mb-4">🌄</div>
              <h3 className="text-xl font-bold mb-2">Aktivite Bilgileri</h3>
              <p className="mb-4">Aktivitelerimiz hakkında detaylı bilgi almak için iletişime geçebilirsiniz.</p>
              <a href="/activities" className="text-primary hover:underline">Aktiviteleri İncele</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-primary text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">Rezervasyon</h3>
              <p className="mb-4">Aktivite rezervasyonu için formu doldurabilir veya bizi arayabilirsiniz.</p>
              <a href="tel:+905551234567" className="text-primary hover:underline">{contactData.phone}</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-primary text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Özel Talepler</h3>
              <p className="mb-4">Özel grup organizasyonları ve kurumsal etkinlikler için bizimle iletişime geçin.</p>
              <a href={`mailto:${contactData.email}`} className="text-primary hover:underline">{contactData.email}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}