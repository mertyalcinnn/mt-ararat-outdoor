import { getAllActivities } from "@/lib/activities";
import Link from "next/link";
import { Locale } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";
import SafeImage from "@/components/SafeImage";
import React from "react";

// Aktivite arayüzünü tanımlayalım
interface Activity {
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  difficultyLevel: string;
  duration: string;
}

// Sayfanın dinamik olduğunu belirt - her istekte yeniden oluşturulsun
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ActivitiesPage({
  params,
}: {
  params: { lang: Locale };
}) {
  console.log(
    `[${new Date().toISOString()}] [${
      params.lang
    }] Aktiviteler sayfası render ediliyor...`
  );

  // Await the async getDictionary function
  const dict = await getDictionary(params.lang);

  // Önbelleği atlayarak aktiviteleri al
  console.log(
    `[${new Date().toISOString()}] [${
      params.lang
    }] Aktiviteler sayfası: Aktiviteler alınıyor...`
  );
  const activities = await getAllActivities() as Activity[];
  console.log(
    `[${new Date().toISOString()}] [${params.lang}] Aktiviteler sayfası: ${
      activities?.length || 0
    } aktivite alındı`
  );

  return (
    <div className="relative mt-24 pt-16 pb-12"> {/* Header için yeterli boşluk bıraktık */}
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">
          {dict.homepage.activities.title}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {dict.homepage.activities.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity: Activity) => (
            <Link
              href={`/${params.lang}/activities/${activity.slug}`}
              key={activity.slug}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-56 w-full bg-gray-200">
                {activity.coverImage ? (
                  <SafeImage
                    src={activity.coverImage}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    Görsel Yok
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full text-white ${
                      activity.difficultyLevel === "Kolay"
                        ? "bg-green-600"
                        : activity.difficultyLevel === "Orta"
                        ? "bg-yellow-600"
                        : activity.difficultyLevel === "Zor"
                        ? "bg-orange-600"
                        : "bg-red-600"
                    }`}
                  >
                    {activity.difficultyLevel}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">
                  {activity.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2 min-h-[3rem]">
                  {activity.description}
                </p>
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    {activity.duration}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
