'use client';

import { Locale } from '@/lib/i18n';

export type Dictionary = {
  navigation: {
    home: string;
    activities: string;
    about: string;
    contact: string;
    reservation: string;
  };
  // ... diğer alanlar (ihtiyaç duyulursa)
};

// Client'da kullanılabilecek basitleştirilmiş bir sözlük yöneticisi
export default function useTranslation(locale: Locale, translations: Record<string, any>): Record<string, any> {
  // Bu fonksiyon client tarafında çalışacak ve basitçe çevirileri döndürecek
  return translations;
}
