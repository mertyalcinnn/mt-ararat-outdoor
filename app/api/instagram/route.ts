import { NextRequest, NextResponse } from 'next/server';
import { staticPosts } from '@/lib/instagram';
import { scrapeInstagramProfile } from '@/lib/instagram-scraper';

export const dynamic = 'force-dynamic'; // Her seferinde yeni veri almak için

export async function GET(request: NextRequest) {
  try {
    // URL'den username parametresini al
    const url = new URL(request.url);
    const username = url.searchParams.get('username') || 'likyaclimbing_olympos';
    const limit = parseInt(url.searchParams.get('limit') || '8', 10);
    
    // Doğrudan Instagram profilinden gönderileri çek
    const posts = await scrapeInstagramProfile(username, limit);
    
    // Eğer gönderi çekilemezse statik verilere dön
    if (posts.length === 0) {
      return NextResponse.json(staticPosts.slice(0, limit), {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' // 10 dakika cache
        }
      });
    }
    
    // Başarılı cevap döndür
    return NextResponse.json(posts, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' // 1 saat cache
      } 
    });
  } catch (error) {
    console.error('Instagram API route error:', error);
    
    // Hata durumunda statik gönderileri döndür
    return NextResponse.json(staticPosts, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' // 10 dakika cache
      }
    });
  }
}
