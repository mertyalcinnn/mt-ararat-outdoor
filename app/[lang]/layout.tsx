// This file is a Server Component by default (no "use client" directive)
// This file is a Server Component by default (no "use client" directive)
// This file is a Server Component by default (no "use client" directive)
// This file is a Server Component by default (no "use client" directive)
// This file is a Server Component by default (no "use client" directive)
// This file is a Server Component by default (no "use client" directive)
import { Inter } from "next/font/google";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Locale } from "../../lib/i18n";
import { getDictionary } from "../../dictionaries";

const inter = Inter({ subsets: ["latin"] });

// Sayfa önbelleğini devre dışı bırak
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateStaticParams() {
  return [{ lang: 'tr' }, { lang: 'en' }, { lang: 'ru' }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const lang = params?.lang || "tr";
  
  // getDictionary'yi burada çağır ve değerlerini aşağıya ilet
  const dictionary = getDictionary(lang) || {};
  const navigation = dictionary?.navigation || {
    home: "Home",
    activities: "Activities",
    about: "About Us",
    contact: "Contact",
    reservation: "Reservation",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} navigation={navigation} />
      <main className="flex-grow">{children}</main>
      <Footer lang={lang} navigation={navigation} />
    </div>
  );
}