// Instagram gönderilerini çeken fonksiyon
// Bu yöntem herhangi bir API anahtarı gerektirmez ancak Instagram'ın politika değişiklikleri nedeniyle çalışmayabilir
// Çalışmadığında statik veriler gösterilir

export interface InstagramPost {
  id: string;
  imageUrl: string;
  link: string;
  caption?: string;
  likes?: number;
  timestamp?: string;
}

// Statik Instagram görselleri - bunlar sabit kalır
const imageUrls = [
  '/images/instagram-1.jpg',
  '/images/instagram-2.jpg',
  '/images/instagram-3.jpg',
  '/images/instagram-4.jpg',
  '/images/ski-touring-1.jpg',
  '/images/ski-touring-2.jpg',
  '/images/ski-touring-3.jpg',
  '/images/about-section.jpg',
];

// Bu görsellerin var olduğundan emin olmak için doğrudan kullanabileceğimiz görseller
const fallbackImageUrls = [
  '/images/about-section.jpg',
  '/images/climbing-cover.jpg',
  '/images/hiking-cover.jpg',
  '/images/hero-image.jpg',
  '/images/private-guidance-cover.jpg',
  '/images/sea-kayak-sup-cover.jpg',
  '/images/ski-touring-cover.jpg',
  '/images/placeholder-image.jpg'
];

// Statik Instagram gönderileri - API başarısız olduğunda geri dönüş olarak kullanılır
export const staticPosts: InstagramPost[] = [
  {
    id: '1',
    imageUrl: fallbackImageUrls[0],
    link: 'https://instagram.com/likyaclimbing_olympos',
    caption: 'Likya bölgesinde muhteşem bir gün #tırmanış #outdoor'
  },
  {
    id: '2',
    imageUrl: fallbackImageUrls[1],
    link: 'https://instagram.com/likyaclimbing_olympos',
    caption: 'Olympos kayalıkları #climbing #nature'
  },
  {
    id: '3',
    imageUrl: fallbackImageUrls[2],
    link: 'https://instagram.com/likyaclimbing_olympos',
    caption: 'Akşam tırmanışı #sunset #climbing'
  },
  {
    id: '4',
    imageUrl: fallbackImageUrls[3],
    link: 'https://instagram.com/likyaclimbing_olympos',
    caption: 'Doğa ile iç içe macera #adventure'
  },
  {
    id: '5',
    imageUrl: fallbackImageUrls[4],
    link: 'https://instagram.com/likyaclimbing_olympos',
    caption: 'Kış sezonu başladı #skiing #winter'
  },
  {
    id: '6',
    imageUrl: fallbackImageUrls[5],
    link: 'https://instagram.com/likyaclimbing_olympos',
    caption: 'Karlı dağlar #skitouring'
  },
  {
    id: '7',
    imageUrl: fallbackImageUrls[6],
    link: 'https://instagram.com/likyaclimbing_olympos',
    caption: 'Zirve tırmanışı #mountaineering'
  },
  {
    id: '8',
    imageUrl: fallbackImageUrls[7],
    link: 'https://instagram.com/likyaclimbing_olympos',
    caption: 'Ekibimizle birlikte #team #outdoor'
  }
];

// InstagramJS API'sini kullanarak gerçek gönderileri çekmek için
// Bu açık bir endpoint'i kullanır ama Instagram tarafından değiştirilebilir
async function fetchRealInstagramPosts(username: string, limit: number): Promise<any[]> {
  try {
    // Instagram veri scapping için populer bir servis
    const url = `https://www.instagram.com/${username}/channel/?__a=1&__d=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Instagram API yanıt vermedi: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.graphql || !data.graphql.user || !data.graphql.user.edge_owner_to_timeline_media) {
      throw new Error('Instagram verisi beklenen formatta değil');
    }
    
    return data.graphql.user.edge_owner_to_timeline_media.edges.slice(0, limit);
  } catch (error) {
    console.warn('Gerçek Instagram gönderileri çekilemedi:', error);
    return [];
  }
}

// Proxy üzerinden InstagramBasic Display API'sini kullanma girişimi
async function fetchViaProxy(username: string): Promise<any[]> {
  try {
    // Bu sadece bir örnektir, gerçek bir proxy servisi kullanabilirsiniz
    const url = `https://instagram-proxy.vercel.app/api/feed?username=${username}`;
    const response = await fetch(url);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.warn('Proxy üzerinden Instagram verileri çekilemedi:', error);
    return [];
  }
}

// Instagram gönderilerini çeken fonksiyon
// Bu fonksiyon birkaç yöntemi dener ve birisi çalışırsa gönderileri döndürür
export async function fetchInstagramPosts(
  username: string = 'likyaclimbing_olympos',
  limit: number = 8
): Promise<InstagramPost[]> {
  try {
    // Birkaç farklı yöntem dene
    let rawPosts: any[] = [];
    
    // 1. Yöntem: Doğrudan Instagram API
    rawPosts = await fetchRealInstagramPosts(username, limit);
    
    // Eğer sonuç gelmezse, proxy üzerinden dene
    if (rawPosts.length === 0) {
      rawPosts = await fetchViaProxy(username);
    }
    
    // Hala sonuç yoksa, statik verileri kullan
    if (rawPosts.length === 0) {
      return staticPosts.slice(0, limit);
    }
    
    // Gönderileri dönüştür - Statik görüntüler kullan ama gerçek açıklamaları al
    return rawPosts.map((post, index) => {
      // Instagram'dan gelen metinleri al
      let caption = '';
      
      if (post.node && post.node.edge_media_to_caption && post.node.edge_media_to_caption.edges[0]) {
        caption = post.node.edge_media_to_caption.edges[0].node.text;
      } else if (post.caption) {
        caption = post.caption;
      } else {
        caption = staticPosts[index % staticPosts.length].caption || '';
      }
      
      // Link oluştur
      let link = 'https://instagram.com/likyaclimbing_olympos';
      
      if (post.node && post.node.shortcode) {
        link = `https://www.instagram.com/p/${post.node.shortcode}/`;
      } else if (post.permalink) {
        link = post.permalink;
      }
      
      // Bilinen mevcut görselleri kullan
      const imageUrl = fallbackImageUrls[index % fallbackImageUrls.length];
      
      // Son gönderi nesnesi
      return {
        id: (post.node?.id || post.id || `static-${index}`).toString(),
        imageUrl,
        link,
        caption,
        likes: post.node?.edge_liked_by?.count || post.likes || 0,
        timestamp: post.node?.taken_at_timestamp 
          ? new Date(post.node.taken_at_timestamp * 1000).toISOString() 
          : post.timestamp || new Date().toISOString()
      };
    });
  } catch (error) {
    console.warn('Instagram gönderileri çekilemedi:', error);
    // Hata durumunda statik gönderiler göster
    return staticPosts.slice(0, limit);
  }
}
