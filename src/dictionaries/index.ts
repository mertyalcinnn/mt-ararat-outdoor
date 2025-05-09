import { Locale, locales } from '@/lib/i18n';

interface Dictionary {
  homepage: {
    hero: {
      title: string;
      description: string;
    };
    activities: {
      title: string;
      description: string;
    };
    stats: {
      mountHeight: string;
      experience: string;
      clients: string;
      activities: string;
    };
    whyUs: {
      title: string;
      professionalGuides: {
        title: string;
        description: string;
      };
      safety: {
        title: string;
        description: string;
      };
      uniqueLocations: {
        title: string;
        description: string;
      };
      equipment: {
        title: string;
        description: string;
      };
      moreInfo: string;
      guidesLabel: string;
      certifiedTeam: string;
    };
    testimonials: {
      title: string;
      description: string;
    };
    instagram: {
      title: string;
      description: string;
      followUs: string;
    };
    cta: {
      title: string;
      description: string;
      contact: string;
      explore: string;
    };
  };
  common: {
    mountHeight: string;
    yearsExperience: string;
    happyAdventurers: string;
    uniqueActivities: string;
  };
  navigation: {
    home: string;
    activities: string;
    about: string;
    contact: string;
    reservation: string;
  };
}

const tr: Dictionary = {
  homepage: {
    hero: {
      title: "Ağrı Dağı'nda Eşsiz Maceralar",
      description: "Profesyonel rehberler eşliğinde Türkiye'nin en yüksek dağında unutulmaz deneyimler"
    },
    activities: {
      title: "Outdoor Aktivitelerimiz",
      description: "Ağrı Dağı ve çevresinde, her seviyeye uygun outdoor aktiviteleri sunuyoruz. Profesyonel rehberlerimiz eşliğinde doğanın tadını çıkarın."
    },
    stats: {
      mountHeight: "Ağrı Dağı Zirvesi",
      experience: "Yıllık Deneyim",
      clients: "Mutlu Maceraperest",
      activities: "Eşsiz Aktivite"
    },
    whyUs: {
      title: "Neden Mt.Ararat Outdoor Adventures?",
      professionalGuides: {
        title: "Profesyonel Rehberlik",
        description: "Tüm rehberlerimiz sertifikalı, deneyimli ve yerel kültüre hakim uzmanlardır."
      },
      safety: {
        title: "Güvenlik Odaklı",
        description: "Modern ekipmanlar, acil durum protokolleri ve tam kapsamlı sigorta ile güvenliğiniz garanti altında."
      },
      uniqueLocations: {
        title: "Eşsiz Lokasyonlar",
        description: "Ağrı Dağı'nın gizli kalmış güzelliklerini keşfedin, turistik olmayan rotalarla eşsiz deneyimler yaşayın."
      },
      equipment: {
        title: "Kaliteli Ekipman",
        description: "Black Diamond, Salomon, North Face gibi dünya lideri markaların en son teknoloji ürünlerini kullanıyoruz."
      },
      moreInfo: "Hakkımızda Daha Fazla",
      guidesLabel: "Profesyonel Rehberler",
      certifiedTeam: "TEDAK sertifikalı uzman ekip"
    },
    testimonials: {
      title: "Maceraperestler Ne Diyor?",
      description: "Katılımcılarımızın deneyimleri ve bizimle yaşadıkları unutulmaz anlar"
    },
    instagram: {
      title: "Instagram'dan Kareler",
      description: "Takipçilerimizin paylaştığı en güzel anlar",
      followUs: "@mtararatoutdoor"
    },
    cta: {
      title: "Maceraya Hazır mısınız?",
      description: "Hemen rezervasyon yapın ve Ağrı Dağı'nın eşsiz doğasında unutulmaz bir deneyime hazırlanın.",
      contact: "İletişime Geçin",
      explore: "Aktiviteleri Keşfedin"
    }
  },
  common: {
    mountHeight: "5137m",
    yearsExperience: "15+",
    happyAdventurers: "1000+",
    uniqueActivities: "5"
  },
  navigation: {
    home: "Ana Sayfa",
    activities: "Aktiviteler",
    about: "Hakkımızda",
    contact: "İletişim",
    reservation: "Rezervasyon"
  }
};

const en: Dictionary = {
  homepage: {
    hero: {
      title: "Unique Adventures on Mount Ararat",
      description: "Unforgettable experiences on Turkey's highest mountain with professional guides"
    },
    activities: {
      title: "Our Outdoor Activities",
      description: "We offer outdoor activities for all levels around Mount Ararat. Enjoy nature with our professional guides."
    },
    stats: {
      mountHeight: "Mt. Ararat Summit",
      experience: "Years Experience",
      clients: "Happy Adventurers",
      activities: "Unique Activities"
    },
    whyUs: {
      title: "Why Mt.Ararat Outdoor Adventures?",
      professionalGuides: {
        title: "Professional Guidance",
        description: "All our guides are certified, experienced experts with deep knowledge of the local culture."
      },
      safety: {
        title: "Safety Focused",
        description: "Your safety is guaranteed with modern equipment, emergency protocols, and comprehensive insurance."
      },
      uniqueLocations: {
        title: "Unique Locations",
        description: "Discover the hidden beauties of Mount Ararat, experience non-touristy routes for unique experiences."
      },
      equipment: {
        title: "Quality Equipment",
        description: "We use the latest technology products from world-leading brands like Black Diamond, Salomon, and North Face."
      },
      moreInfo: "More About Us",
      guidesLabel: "Professional Guides",
      certifiedTeam: "TEDAK certified expert team"
    },
    testimonials: {
      title: "What Adventurers Say",
      description: "Experiences of our participants and the unforgettable moments they had with us"
    },
    instagram: {
      title: "Instagram Highlights",
      description: "Best moments shared by our followers",
      followUs: "@mtararatoutdoor"
    },
    cta: {
      title: "Ready for Adventure?",
      description: "Make a reservation now and prepare for an unforgettable experience in the unique nature of Mount Ararat.",
      contact: "Contact Us",
      explore: "Explore Activities"
    }
  },
  common: {
    mountHeight: "5137m",
    yearsExperience: "15+",
    happyAdventurers: "1000+",
    uniqueActivities: "5"
  },
  navigation: {
    home: "Home",
    activities: "Activities",
    about: "About Us",
    contact: "Contact",
    reservation: "Reservation"
  }
};

const ru: Dictionary = {
  homepage: {
    hero: {
      title: "Уникальные приключения на горе Арарат",
      description: "Незабываемые впечатления на самой высокой горе Турции с профессиональными гидами"
    },
    activities: {
      title: "Наши мероприятия на свежем воздухе",
      description: "Мы предлагаем мероприятия для всех уровней подготовки вокруг горы Арарат. Наслаждайтесь природой с нашими профессиональными гидами."
    },
    stats: {
      mountHeight: "Вершина горы Арарат",
      experience: "Лет опыта",
      clients: "Счастливых искателей приключений",
      activities: "Уникальных мероприятий"
    },
    whyUs: {
      title: "Почему Mt.Ararat Outdoor Adventures?",
      professionalGuides: {
        title: "Профессиональное руководство",
        description: "Все наши гиды - сертифицированные, опытные эксперты с глубоким знанием местной культуры."
      },
      safety: {
        title: "Ориентация на безопасность",
        description: "Ваша безопасность гарантирована современным оборудованием, протоколами действий в чрезвычайных ситуациях и комплексным страхованием."
      },
      uniqueLocations: {
        title: "Уникальные локации",
        description: "Откройте для себя скрытые красоты горы Арарат, пройдите по нетуристическим маршрутам для уникальных впечатлений."
      },
      equipment: {
        title: "Качественное оборудование",
        description: "Мы используем новейшие технологии от ведущих мировых брендов, таких как Black Diamond, Salomon и North Face."
      },
      moreInfo: "Подробнее о нас",
      guidesLabel: "Профессиональные гиды",
      certifiedTeam: "Сертифицированная команда экспертов TEDAK"
    },
    testimonials: {
      title: "Что говорят искатели приключений",
      description: "Впечатления наших участников и незабываемые моменты, которые они пережили с нами"
    },
    instagram: {
      title: "Яркие моменты из Instagram",
      description: "Лучшие моменты, которыми делятся наши подписчики",
      followUs: "@mtararatoutdoor"
    },
    cta: {
      title: "Готовы к приключениям?",
      description: "Сделайте бронирование сейчас и приготовьтесь к незабываемым впечатлениям в уникальной природе горы Арарат.",
      contact: "Свяжитесь с нами",
      explore: "Исследовать мероприятия"
    }
  },
  common: {
    mountHeight: "5137м",
    yearsExperience: "15+",
    happyAdventurers: "1000+",
    uniqueActivities: "5"
  },
  navigation: {
    home: "Главная",
    activities: "Мероприятия",
    about: "О нас",
    contact: "Контакты",
    reservation: "Бронирование"
  }
};

const dictionaries = {
  tr,
  en,
  ru
};

export const getDictionary = (locale: Locale = 'tr') => {
  // Make sure locale is one of the valid locales
  const safeLocale = locales.includes(locale) ? locale : 'tr';
  return dictionaries[safeLocale] || dictionaries.tr; // Fallback to Turkish
};