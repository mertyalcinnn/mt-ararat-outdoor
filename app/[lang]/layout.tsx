import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { locales, Locale } from "@/lib/i18n";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

// Export ortak root layout metadata ile paylaşılıyor

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
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
