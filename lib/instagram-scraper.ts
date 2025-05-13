// Instagram Scraper Utility
// Bu metot doğrudan Instagram profilini tarayarak gönderileri çeker
// Dikkat: Instagram'ın yapısı değişirse bu kod çalışmayabilir

export interface InstagramPost {
  id: string;
  imageUrl: string;
  link: string;
  caption?: string;
  timestamp?: string;
}

/**
 * Instagram profilini doğrudan tarayarak gönderileri çeker
 * @param username Instagram kullanıcı adı
 * @param limit Çekilecek gönderi sayısı
 * @returns Instagram gönderileri
 */
export async function scrapeInstagramProfile(
  username: string,
  limit: number = 5
): Promise<InstagramPost[]> {
  try {
    // Instagram profilini ziyaret et
    const profileUrl = `https://www.instagram.com/${username}/`;
    
    // User-Agent'ı değiştir ki Instagram botu algılamasın
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    // Profil sayfasını çek
    const response = await fetch(profileUrl, { 
      headers,
      cache: 'no-store'  // Her seferinde yeni veri al
    });

    if (!response.ok) {
      throw new Error(`Instagram profili yüklenemedi: ${response.status}`);
    }

    // HTML içeriğini al
    const html = await response.text();
    
    // Instagram JavaScript nesnesini bul
    // Instagram, sayfa yüklendiğinde "window._sharedData" veya "__NEXT_DATA__" içinde veri depolar
    let jsonData: any = null;
    
    // Yöntem 1: window._sharedData içinden veriyi çıkar
    const sharedDataMatch = html.match(/<script type="text\/javascript">window\._sharedData = (.+?);<\/script>/);
    if (sharedDataMatch && sharedDataMatch[1]) {
      try {
        jsonData = JSON.parse(sharedDataMatch[1]);
      } catch (e) {
        console.warn('Shared data JSON ayrıştırılamadı');
      }
    }
    
    // Yöntem 2: __NEXT_DATA__ içinden veriyi çıkar (Instagram'ın yeni yapısı için)
    if (!jsonData) {
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
      if (nextDataMatch && nextDataMatch[1]) {
        try {
          jsonData = JSON.parse(nextDataMatch[1]);
        } catch (e) {
          console.warn('NEXT_DATA JSON ayrıştırılamadı');
        }
      }
    }
    
    // Veri bulunamadıysa hata fırlat
    if (!jsonData) {
      throw new Error('Instagram verisi sayfadan çıkarılamadı');
    }
    
    // JSON verilerinden gönderileri bul
    // Not: Instagram'ın veri yapısı değiştiği için birkaç farklı yol deneyelim
    let posts: InstagramPost[] = [];
    
    // Eski yapı: sharedData içinde user->media->nodes
    if (jsonData.entry_data?.ProfilePage?.[0]?.graphql?.user?.edge_owner_to_timeline_media?.edges) {
      const edges = jsonData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
      
      posts = edges.slice(0, limit).map((edge: any) => {
        const node = edge.node;
        return {
          id: node.id,
          imageUrl: node.display_url || node.thumbnail_src,
          link: `https://www.instagram.com/p/${node.shortcode}/`,
          caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
          timestamp: new Date(node.taken_at_timestamp * 1000).toISOString()
        };
      });
    }
    // Yeni yapı: NEXT_DATA içindeki farklı paths
    else if (jsonData.props?.pageProps?.user?.edge_owner_to_timeline_media?.edges) {
      const edges = jsonData.props.pageProps.user.edge_owner_to_timeline_media.edges;
      
      posts = edges.slice(0, limit).map((edge: any) => {
        const node = edge.node;
        return {
          id: node.id,
          imageUrl: node.display_url || node.thumbnail_src,
          link: `https://www.instagram.com/p/${node.shortcode}/`,
          caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
          timestamp: new Date(node.taken_at_timestamp * 1000).toISOString()
        };
      });
    }
    
    // Diğer olası veri yapıları için try-catchler eklenebilir
    
    if (posts.length === 0) {
      throw new Error('Instagram gönderileri bulunamadı veya çıkarılamadı');
    }
    
    return posts;
  } catch (error) {
    console.error('Instagram profili tarananamadı:', error);
    // Hata durumunda boş dizi döndür, uygulama daha sonra statik verilere dönecek
    return [];
  }
}
