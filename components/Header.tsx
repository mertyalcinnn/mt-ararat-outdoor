"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { locales, localeNames, Locale } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";
import { siteConfig } from "@/config/site";

export default function Header({ lang }: { lang: Locale }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const pathname = usePathname();

  const dictionary = getDictionary(lang);
  const { navigation } = dictionary;

  // Mevcut URL'den dil kodu olmadan path'i alır
  const getPathWithoutLang = () => {
    if (!pathname) return "/";

    const segments = pathname.split("/");
    segments.splice(1, 1); // Dil segmentini çıkar
    return segments.join("/") || "/";
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md backdrop-blur-sm py-2 bg-opacity-95"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center ml-0 md:ml-0 lg:-ml-6 md:-ml-4">
            <div className="relative h-16 w-16 mr-2">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={64}
                height={64}
                className="object-contain"
                style={{
                  filter: scrolled ? "none" : "brightness(0) invert(1)"
                }}
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-xl font-bold tracking-wide ${
                  scrolled ? "text-primary" : "text-white"
                }`}
              >
                {siteConfig.name.split(" ")[0].toUpperCase()}
              </span>
              <span
                className={`text-xs font-medium tracking-wider ${
                  scrolled ? "text-secondary" : "text-white opacity-80"
                }`}
              >
                {siteConfig.slogan}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href={`/${lang}`}
              className={`px-4 py-2 rounded-md transition-colors ${
                scrolled
                  ? "text-dark hover:text-primary hover:bg-primary hover:bg-opacity-5"
                  : "text-white hover:text-white hover:text-opacity-80 hover:bg-white hover:bg-opacity-10"
              }`}
            >
              {navigation.home}
            </Link>
            <Link
              href={`/${lang}/activities`}
              className={`px-4 py-2 rounded-md transition-colors ${
                scrolled
                  ? "text-dark hover:text-primary hover:bg-primary hover:bg-opacity-5"
                  : "text-white hover:text-white hover:text-opacity-80 hover:bg-white hover:bg-opacity-10"
              }`}
            >
              {navigation.activities}
            </Link>
            <Link
              href={`/${lang}/about`}
              className={`px-4 py-2 rounded-md transition-colors ${
                scrolled
                  ? "text-dark hover:text-primary hover:bg-primary hover:bg-opacity-5"
                  : "text-white hover:text-white hover:text-opacity-80 hover:bg-white hover:bg-opacity-10"
              }`}
            >
              {navigation.about}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className={`px-4 py-2 rounded-md transition-colors ${
                scrolled
                  ? "text-dark hover:text-primary hover:bg-primary hover:bg-opacity-5"
                  : "text-white hover:text-white hover:text-opacity-80 hover:bg-white hover:bg-opacity-10"
              }`}
            >
              {navigation.contact}
            </Link>

            {/* Dil Seçimi */}
            <div className="relative ml-4">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  scrolled
                    ? "text-dark hover:text-primary hover:bg-primary hover:bg-opacity-5"
                    : "text-white hover:text-white hover:text-opacity-80 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <span>{lang.toUpperCase()}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50">
                  {locales.map((locale) => (
                    <Link
                      key={locale}
                      href={`/${locale}${getPathWithoutLang()}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:bg-opacity-5 hover:text-primary"
                      onClick={() => setLanguageMenuOpen(false)}
                    >
                      {localeNames[locale]}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={`/${lang}/contact`}
              className={`ml-2 px-5 py-2 rounded-md ${
                scrolled
                  ? "bg-primary text-white hover:bg-primary hover:opacity-90"
                  : "bg-white text-white hover:bg-white hover:bg-opacity-30 backdrop-blur-sm border border-white border-opacity-30 bg-opacity-20"
              }`}
            >
              {navigation.reservation}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Dil Seçimi - Mobil */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className={`p-2 rounded-md ${
                  scrolled ? "text-dark" : "text-white"
                }`}
              >
                <span>{lang.toUpperCase()}</span>
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg overflow-hidden z-50">
                  {locales.map((locale) => (
                    <Link
                      key={locale}
                      href={`/${locale}${getPathWithoutLang()}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:bg-opacity-5 hover:text-primary"
                      onClick={() => {
                        setLanguageMenuOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {localeNames[locale]}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburger Menü */}
            <button
              type="button"
              className={`md:hidden p-2 rounded-md ${
                scrolled ? "text-dark" : "text-white"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg overflow-hidden">
            <nav className="py-2">
              <Link
                href={`/${lang}`}
                className="block px-4 py-3 text-dark hover:bg-primary hover:bg-opacity-5 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {navigation.home}
              </Link>
              <Link
                href={`/${lang}/activities`}
                className="block px-4 py-3 text-dark hover:bg-primary hover:bg-opacity-5 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {navigation.activities}
              </Link>
              <Link
                href={`/${lang}/about`}
                className="block px-4 py-3 text-dark hover:bg-primary hover:bg-opacity-5 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {navigation.about}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="block px-4 py-3 text-dark hover:bg-primary hover:bg-opacity-5 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {navigation.contact}
              </Link>
              <div className="px-4 py-3">
                <Link
                  href={`/${lang}/contact`}
                  className="block w-full py-2 text-center bg-primary text-white rounded-md hover:bg-primary hover:opacity-90"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {navigation.reservation}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}