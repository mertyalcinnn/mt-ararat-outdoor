'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { InstagramPost } from '@/lib/instagram';
import { Locale } from '@/lib/i18n';

interface InstagramFeedProps {
  posts: InstagramPost[];
  title: string;
  description: string;
  followText: string;
  lang: Locale;
}

export default function InstagramFeed({ posts, title, description, followText, lang }: InstagramFeedProps) {
  // Responsive grid için farklı kolon sayıları
  const [columns, setColumns] = useState(4);

  // Ekran boyutuna göre kolon sayısını ayarla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(2); // Mobil için 2 kolon
      } else if (window.innerWidth < 1024) {
        setColumns(3); // Tablet için 3 kolon
      } else {
        setColumns(4); // Desktop için 4 kolon
      }
    };

    // İlk yüklemede çağır
    handleResize();

    // Ekran boyutu değişimlerini izle
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Göstermek için posts sayısını sınırla
  const limitedPosts = posts.slice(0, columns * 2);

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg max-w-2xl mx-auto">
            {description}
            <a
              href="https://instagram.com/likyaclimbing_olympos"
              className="text-primary font-bold ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {followText}
            </a>
          </p>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-4`}>
          {limitedPosts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square relative overflow-hidden rounded-lg group"
            >
              <Image
                src={post.media_url}
                alt={post.caption || "Instagram Paylaşımı"}
                width={300}
                height={300}
                className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </a>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a
            href="https://instagram.com/likyaclimbing_olympos"
            className="inline-flex items-center justify-center px-6 py-3 bg-light border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>@likyaclimbing_olympos</span>
          </a>
        </div>
      </div>
    </section>
  );
}
