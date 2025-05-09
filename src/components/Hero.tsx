'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import { getDictionary } from '@/dictionaries';

interface HeroProps {
  title: string;
  description: string;
  image: string;
}

export default function Hero({ title, description, image }: HeroProps) {
  const params = useParams();
  const lang = params.lang as Locale || 'tr';
  const dictionary = getDictionary(lang);
  const { homepage } = dictionary;
  
  const scrollToActivities = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('activities')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Dile göre farklı metinler
  const exploreText = {
    tr: "KEŞFEDİN",
    en: "EXPLORE",
    ru: "ИССЛЕДОВАТЬ"
  };

  return (
    <section className="relative h-screen min-h-[600px] flex items-center">
      <div className="absolute inset-0">
        <Image 
          src={image} 
          alt={title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/40 to-transparent"></div>
      </div>
      
      <div className="container-custom relative z-10 pt-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white [text-shadow:_0_2px_10px_rgba(0,0,0,0.3)]">
            {title}
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white/90 [text-shadow:_0_1px_5px_rgba(0,0,0,0.3)]">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href={`/${lang}/activities`} 
              className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-md transition-all shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
            >
              {homepage.cta.explore}
            </Link>
            <Link 
              href={`/${lang}/contact`} 
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-medium px-8 py-3 rounded-md transition-all shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
            >
              {homepage.cta.contact}
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-light to-transparent"></div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <a 
          href="#activities" 
          className="flex flex-col items-center text-white hover:text-accent transition-colors"
          onClick={scrollToActivities}
        >
          <span className="mb-2 text-sm font-medium tracking-wider">{exploreText[lang]}</span>
          <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </a>
      </div>
    </section>
  );
}