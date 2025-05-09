"use client";

import { useParams } from "next/navigation";
import { Locale } from "@/lib/i18n";

interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  const params = useParams();
  const lang = (params.lang as Locale) || "tr";

  return (
    <section className="relative bg-primary text-white py-20 md:py-28">
      <div className="absolute inset-0 opacity-20">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <pattern
            id="mountains"
            patternUnits="userSpaceOnUse"
            width="100"
            height="50"
            patternTransform="scale(1 1)"
          >
            <path
              d="M0 50 L25 20 L50 35 L75 15 L100 50 L100 100 L0 100 Z"
              fill="currentColor"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#mountains)" />
        </svg>
      </div>

      <div className="container-custom relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <div className="w-20 h-1 bg-accent mx-auto my-6"></div>
        <p className="text-xl max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-light to-transparent"></div>
    </section>
  );
}
