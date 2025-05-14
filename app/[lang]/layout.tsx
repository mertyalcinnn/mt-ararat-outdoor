import { Inter } from "next/font/google";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Locale } from "../../lib/i18n";

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} />
      <main className="flex-grow">{children}</main>
      <Footer lang={lang} />
    </div>
  );
}