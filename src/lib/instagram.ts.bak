import { cache } from 'react';

export interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  thumbnail_url?: string;
}

// Instagram API verileriniz için bu değişkenleri ayarlayın
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || '';
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID || '';

// Önbelleğe alınmış API çağrısı, her yeniden oluşturmada çağrıları önler
export const getInstagramFeed = cache(async (limit: number = 8): Promise<InstagramPost[]> => {
  // Eğer gerekli API anahtarları yoksa, örnek veri döndür
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) {
    console.warn('Instagram API anahtarları eksik, örnek veri döndürülüyor.');
    return getMockInstagramPosts(limit);
  }

  try {
    // Instagram Graph API'dan gönderileri çek
    const response = await fetch(
      `https://graph.instagram.com/v12.0/${INSTAGRAM_USER_ID}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=${limit}&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
      { next: { revalidate: 3600 } } // Saatte bir yeniden doğrula
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data as InstagramPost[];
  } catch (error) {
    console.error('Instagram feed alınamadı:', error);
    // Hata durumunda örnek verileri döndür
    return getMockInstagramPosts(limit);
  }
});

// Geçici olarak örnek veri sağlayan fonksiyon
// Gerçek API entegrasyonu yapılana kadar kullanılacak
function getMockInstagramPosts(limit: number): InstagramPost[] {
  const posts: InstagramPost[] = [
    {
      id: '1',
      media_url: '/images/instagram-1.jpg',
      permalink: 'https://www.instagram.com/p/example1/',
      caption: 'Likya bölgesinde muhteşem bir gün #tırmanış #outdoor',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      media_url: '/images/instagram-2.jpg',
      permalink: 'https://www.instagram.com/p/example2/',
      caption: 'Olympos kayalıkları #climbing #nature',
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      media_url: '/images/instagram-3.jpg',
      permalink: 'https://www.instagram.com/p/example3/',
      caption: 'Akşam tırmanışı #sunset #climbing',
      timestamp: new Date().toISOString(),
    },
    {
      id: '4',
      media_url: '/images/instagram-4.jpg',
      permalink: 'https://www.instagram.com/p/example4/',
      caption: 'Doğa ile iç içe macera #adventure',
      timestamp: new Date().toISOString(),
    },
    {
      id: '5',
      media_url: '/images/ski-touring-1.jpg',
      permalink: 'https://www.instagram.com/p/example5/',
      caption: 'Kış sezonu başladı #skiing #winter',
      timestamp: new Date().toISOString(),
    },
    {
      id: '6',
      media_url: '/images/ski-touring-2.jpg',
      permalink: 'https://www.instagram.com/p/example6/',
      caption: 'Karlı dağlar #skitouring',
      timestamp: new Date().toISOString(),
    },
    {
      id: '7',
      media_url: '/images/ski-touring-3.jpg',
      permalink: 'https://www.instagram.com/p/example7/',
      caption: 'Zirve tırmanışı #mountaineering',
      timestamp: new Date().toISOString(),
    },
    {
      id: '8',
      media_url: '/images/about-section.jpg',
      permalink: 'https://www.instagram.com/p/example8/',
      caption: 'Ekibimizle birlikte #team #outdoor',
      timestamp: new Date().toISOString(),
    },
  ];

  return posts.slice(0, limit);
}
