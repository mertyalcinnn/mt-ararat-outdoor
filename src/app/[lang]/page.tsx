import Hero from "@/components/Hero";
import ActivityList from "@/components/ActivityList";
import ManualInstagramFeed from "@/components/ManualInstagramFeed";
import { getHomepageData, getAllActivities, getTestimonials } from "@/lib/api";
import { getDictionary } from "@/dictionaries";
import { Locale } from "@/lib/i18n";
import { fetchInstagramPosts } from "@/lib/instagram";
import Image from "next/image";
import Link from "next/link";

// Define Testimonial type
interface Testimonial {
  name: string;
  quote: string;
  avatar: string;
  activity: string;
}

// Sayfa yenileme stratejisi - 1 saat cache
export const revalidate = 3600;

export default async function Home({ params }: { params: { lang: Locale } }) {
  // Dil parametresini güvenli bir şekilde al
  const lang = params?.lang || "tr";

  const homeData = getHomepageData();
  const activities = getAllActivities();
  const testimonials = getTestimonials() as Testimonial[];
  const dictionary = getDictionary(lang);
  const { homepage } = dictionary;
  
  // Instagram kullanıcı adı
  const instagramUsername = "likyaclimbing_olympos";
  
  // Instagram gönderilerini getirmeyi dene - hata durumunda içerideki fallback mekanizma çalışacak
  const instagramPosts = await fetchInstagramPosts(instagramUsername, 8).catch(() => []);

  return (
    <div>
      <Hero
        title={homepage.hero.title}
        description={homepage.hero.description}
        image={homeData.heroImage}
      />

      {/* Aktiviteler Bölümü */}
      <section id="activities" className="section bg-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {homepage.activities.title}
            </h2>
            <p className="text-lg max-w-3xl mx-auto">
              {homepage.activities.description}
            </p>
          </div>

          <ActivityList activities={activities} lang={lang} />
        </div>
      </section>

      {/* İstatistikler Bölümü */}
      <section className="section bg-primary text-white py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold mb-2">
                {dictionary.common.mountHeight}
              </span>
              <p className="text-white/80">{homepage.stats.mountHeight}</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold mb-2">
                {dictionary.common.yearsExperience}
              </span>
              <p className="text-white/80">{homepage.stats.experience}</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold mb-2">
                {dictionary.common.happyAdventurers}
              </span>
              <p className="text-white/80">{homepage.stats.clients}</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold mb-2">
                {dictionary.common.uniqueActivities}
              </span>
              <p className="text-white/80">{homepage.stats.activities}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Neden Biz Bölümü */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold mb-6">
                {homepage.whyUs.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-light rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-primary mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl mb-2">
                    {homepage.whyUs.professionalGuides.title}
                  </h3>
                  <p className="text-dark/70">
                    {homepage.whyUs.professionalGuides.description}
                  </p>
                </div>

                <div className="bg-light rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-primary mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl mb-2">
                    {homepage.whyUs.safety.title}
                  </h3>
                  <p className="text-dark/70">
                    {homepage.whyUs.safety.description}
                  </p>
                </div>

                <div className="bg-light rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-primary mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"></path>
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl mb-2">
                    {homepage.whyUs.uniqueLocations.title}
                  </h3>
                  <p className="text-dark/70">
                    {homepage.whyUs.uniqueLocations.description}
                  </p>
                </div>

                <div className="bg-light rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-primary mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                      <line x1="16" y1="8" x2="2" y2="22"></line>
                      <line x1="17.5" y1="15" x2="9" y2="15"></line>
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl mb-2">
                    {homepage.whyUs.equipment.title}
                  </h3>
                  <p className="text-dark/70">
                    {homepage.whyUs.equipment.description}
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href={`/${lang}/about`} className="btn btn-primary">
                  {homepage.whyUs.moreInfo}
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative">
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <Image
                    src="/images/about-section.jpg"
                    alt="Climbing Activities"
                    width={600}
                    height={450}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-4">
                      <img
                        src="/images/placeholder-image.jpg"
                        alt="Rehber"
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                      <img
                        src="/images/placeholder-image.jpg"
                        alt="Rehber"
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                      <img
                        src="/images/placeholder-image.jpg"
                        alt="Rehber"
                        className="w-10 h-10 rounded-full border-2 border-white"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {homepage.whyUs.guidesLabel}
                      </p>
                      <p className="text-xs text-dark/60">
                        {homepage.whyUs.certifiedTeam}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Müşteri Yorumları Bölümü */}
      <section className="section bg-light py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {homepage.testimonials.title}
            </h2>
            <p className="text-lg max-w-2xl mx-auto">
              {homepage.testimonials.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial: Testimonial, index: number) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 relative"
              >
                <div className="text-primary mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
                    <path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
                  </svg>
                </div>
                <p className="mb-6 italic">{testimonial.quote}</p>
                <div className="flex items-center mt-auto">
                  <Image
                    src="/images/placeholder-image.jpg"
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-dark/60">
                      {testimonial.activity}
                    </p>
                  </div>
                </div>
                <div className="absolute top-6 right-6 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Beslemesi Bölümü */}
      <ManualInstagramFeed 
        title={homepage.instagram.title}
        description={homepage.instagram.description}
        followText={homepage.instagram.followUs}
        lang={lang}
        instagramUsername={instagramUsername}
      />
    </div>
  );
}
