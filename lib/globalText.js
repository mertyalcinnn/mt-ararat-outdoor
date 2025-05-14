'use client';

import { createContext, useContext } from 'react';

// Varsayılan metinler
const defaultTexts = {
  tr: {
    common: {
      viewMore: "Tüm Aktiviteler",
      gallery: "Galeri",
      activityDetails: "Aktivite Detayları",
      duration: "Süre",
      difficulty: "Zorluk Seviyesi",
      includedServices: "Dahil Olan Hizmetler",
      reservation: "Rezervasyon Yap",
      exploreActivities: "Diğer Aktivitelerimizi Keşfedin",
      home: "Ana Sayfa",
      activities: "Aktiviteler",
      about: "Hakkımızda",
      contact: "İletişim",
      seeAll: "Tümünü Gör",
      loading: "Yükleniyor...",
      notFound: "Bulunamadı",
      error: "Hata oluştu"
    }
  },
  en: {
    common: {
      viewMore: "All Activities",
      gallery: "Gallery",
      activityDetails: "Activity Details",
      duration: "Duration",
      difficulty: "Difficulty Level",
      includedServices: "Included Services",
      reservation: "Make Reservation",
      exploreActivities: "Explore Our Other Activities",
      home: "Home",
      activities: "Activities",
      about: "About Us",
      contact: "Contact",
      seeAll: "See All",
      loading: "Loading...",
      notFound: "Not Found",
      error: "An error occurred"
    }
  },
  ru: {
    common: {
      viewMore: "Все Мероприятия",
      gallery: "Галерея",
      activityDetails: "Детали Мероприятия",
      duration: "Продолжительность",
      difficulty: "Уровень Сложности",
      includedServices: "Включенные Услуги",
      reservation: "Забронировать",
      exploreActivities: "Изучите Наши Другие Мероприятия",
      home: "Главная",
      activities: "Мероприятия",
      about: "О нас",
      contact: "Контакты",
      seeAll: "Смотреть все",
      loading: "Загрузка...",
      notFound: "Не найдено",
      error: "Произошла ошибка"
    }
  }
};

// Context oluştur
const GlobalTextContext = createContext(defaultTexts.tr.common);

// Provider bileşeni
export function GlobalTextProvider({ children, lang = 'tr' }) {
  const texts = defaultTexts[lang]?.common || defaultTexts.tr.common;
  return (
    <GlobalTextContext.Provider value={texts}>
      {children}
    </GlobalTextContext.Provider>
  );
}

// Hook
export function useGlobalText() {
  return useContext(GlobalTextContext);
}

// Metinlere doğrudan erişim
export function getGlobalText(lang = 'tr') {
  return defaultTexts[lang]?.common || defaultTexts.tr.common;
}
