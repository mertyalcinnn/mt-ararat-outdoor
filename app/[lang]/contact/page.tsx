// Using server component since we're fetching data
// Remove "use client" directive

import ReactMarkdown from "react-markdown";
import Link from "next/link";
import PageHeader from "../../../components/PageHeader";
import ContactForm from "../../../components/ContactForm";
import { getContactData } from "../../../lib/api";
import { Locale } from "../../../lib/i18n";
import { getDictionary } from "../../../dictionaries";

export default async function ContactPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const contactData = await getContactData();
  const dictionary = await getDictionary(params.lang);
  const { navigation } = dictionary;

  // Dile göre metinler
  const contactPageTexts = {
    tr: {
      subtitle:
        "Sorularınız veya rezervasyon talepleriniz için bizimle iletişime geçin.",
      contactTitle: "Bize Ulaşın",
      address: "Adres",
      email: "E-posta",
      phone: "Telefon",
      location: "Konum",
      messageTitle: "Mesaj Gönderin",
      infoBoxes: {
        activityInfo: {
          title: "Aktivite Bilgileri",
          description:
            "Aktivitelerimiz hakkında detaylı bilgi almak için iletişime geçebilirsiniz.",
          link: "Aktiviteleri İncele",
        },
        reservation: {
          title: "Rezervasyon",
          description:
            "Aktivite rezervasyonu için formu doldurabilir veya bizi arayabilirsiniz.",
        },
        specialRequests: {
          title: "Özel Talepler",
          description:
            "Özel grup organizasyonları ve kurumsal etkinlikler için bizimle iletişime geçin.",
        },
      },
    },
    en: {
      subtitle: "Contact us for your questions or reservation requests.",
      contactTitle: "Contact Us",
      address: "Address",
      email: "Email",
      phone: "Phone",
      location: "Location",
      messageTitle: "Send a Message",
      infoBoxes: {
        activityInfo: {
          title: "Activity Information",
          description:
            "You can contact us for detailed information about our activities.",
          link: "Explore Activities",
        },
        reservation: {
          title: "Reservation",
          description:
            "You can fill out the form or call us for activity reservations.",
        },
        specialRequests: {
          title: "Special Requests",
          description:
            "Contact us for private group organizations and corporate events.",
        },
      },
    },
    ru: {
      subtitle: "Свяжитесь с нами по вопросам или запросам на бронирование.",
      contactTitle: "Связаться с нами",
      address: "Адрес",
      email: "Электронная почта",
      phone: "Телефон",
      location: "Местоположение",
      messageTitle: "Отправить сообщение",
      infoBoxes: {
        activityInfo: {
          title: "Информация о мероприятиях",
          description:
            "Вы можете связаться с нами для получения подробной информации о наших мероприятиях.",
          link: "Исследовать мероприятия",
        },
        reservation: {
          title: "Бронирование",
          description:
            "Вы можете заполнить форму или позвонить нам для бронирования мероприятий.",
        },
        specialRequests: {
          title: "Специальные запросы",
          description:
            "Свяжитесь с нами для организации частных групп и корпоративных мероприятий.",
        },
      },
    },
  };

  const texts = contactPageTexts[params.lang];

  return (
    <div>
      <PageHeader title={contactData.title} description={texts.subtitle} />

      <section className="section">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">{texts.contactTitle}</h2>

              <div className="space-y-6">
                {contactData.address && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">{texts.address}</h3>
                    <p>{contactData.address}</p>
                  </div>
                )}

                {contactData.email && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">{texts.email}</h3>
                    <p>
                      <a
                        href={`mailto:${contactData.email}`}
                        className="text-primary hover:underline"
                      >
                        {contactData.email}
                      </a>
                    </p>
                  </div>
                )}

                {contactData.phone && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">{texts.phone}</h3>
                    <p>
                      <a
                        href={`tel:${contactData.phone}`}
                        className="text-primary hover:underline"
                      >
                        {contactData.phone}
                      </a>
                    </p>
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
                  <h3 className="text-xl font-bold mb-4">{texts.location}</h3>
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
              <h2 className="text-3xl font-bold mb-6">{texts.messageTitle}</h2>
              <ContactForm lang={params.lang} />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-primary text-4xl mb-4">🌄</div>
              <h3 className="text-xl font-bold mb-2">
                {texts.infoBoxes.activityInfo.title}
              </h3>
              <p className="mb-4">{texts.infoBoxes.activityInfo.description}</p>
              <Link
                href={`/${params.lang}/activities`}
                className="text-primary hover:underline"
              >
                {texts.infoBoxes.activityInfo.link}
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-primary text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">
                {texts.infoBoxes.reservation.title}
              </h3>
              <p className="mb-4">{texts.infoBoxes.reservation.description}</p>
              <a
                href={`tel:${contactData.phone}`}
                className="text-primary hover:underline"
              >
                {contactData.phone}
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-primary text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">
                {texts.infoBoxes.specialRequests.title}
              </h3>
              <p className="mb-4">
                {texts.infoBoxes.specialRequests.description}
              </p>
              <a
                href={`mailto:${contactData.email}`}
                className="text-primary hover:underline"
              >
                {contactData.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
