import { NextRequest, NextResponse } from 'next/server';
import { findOne, updateOne } from '@/lib/mongodb';
import { syncActivityToJson } from '@/lib/activities';

// Slug oluşturma fonksiyonu
function createSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
    
  return slug;
}

// Slug'ın benzersiz olup olmadığını kontrol etme
async function isSlugUnique(slug: string): Promise<boolean> {
  try {
    const existingActivity = await findOne('activities', { slug });
    return !existingActivity;
  } catch (error) {
    console.error('Slug kontrol hatası:', error);
    return false;
  }
}

// Benzersiz bir slug oluştur
async function generateUniqueSlug(title: string): Promise<string> {
  let slug = createSlug(title);
  let isUnique = await isSlugUnique(slug);
  let counter = 1;
  
  // Eğer slug benzersiz değilse, sonuna sayı ekle
  while (!isUnique) {
    slug = `${createSlug(title)}-${counter}`;
    isUnique = await isSlugUnique(slug);
    counter++;
  }
  
  return slug;
}

// POST - Yeni aktivite oluştur
// Revalidate fonksiyonu - önbelleği temizler
async function revalidatePages() {
  console.log('Sayfalar yeniden oluşturuluyor...');
  try {
    // NEXT_PUBLIC_SITE_URL değerini kontrol et
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    console.log(`NEXT_PUBLIC_SITE_URL: ${siteUrl || 'TANIMLANMAMIŞ'}`);
    
    // Tüm olası revalidate API'lerini dene
    const revalidationEndpoints = [
      // Birincil revalidation API
      `${siteUrl}/api/revalidate`,
      // Yedek olarak force-revalidate API
      `${siteUrl}/api/force-revalidate`,
      // Son çare olarak clear-cache API
      `${siteUrl}/api/clear-cache`
    ];
    
    // Göreli yollar için alternatif API'ler
    if (!siteUrl) {
      revalidationEndpoints.push('/api/revalidate');
      revalidationEndpoints.push('/api/force-revalidate');
      revalidationEndpoints.push('/api/clear-cache');
    }
    
    // Birden fazla revalidation API'sini dene
    for (const endpoint of revalidationEndpoints) {
      try {
        console.log(`${endpoint} çağrılıyor...`);
        
        const revalidateResponse = await fetch(endpoint, {
          cache: 'no-store',
          signal: AbortSignal.timeout(5000) // 5 saniye timeout
        });
        
        if (revalidateResponse.ok) {
          const result = await revalidateResponse.json();
          console.log(`${endpoint} başarılı:`, result);
          return result;
        } else {
          console.error(`${endpoint} hata döndü: ${revalidateResponse.status}`);
        }
      } catch (endpointError) {
        console.error(`${endpoint} çağrılamadı:`, endpointError);
      }
    }
    
    // Hiçbir API çalışmadıysa
    return null;
  } catch (error) {
    console.error('Revalidate hatası:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Yeni aktivite oluşturma isteği alındı.');
    const activityData = await request.json();
    
    if (!activityData.title) {
      return NextResponse.json(
        { error: 'Aktivite başlığı gereklidir' },
        { status: 400 }
      );
    }
    
    // Slug oluştur veya gelen değeri kullan
    let slug;
    try {
      slug = activityData.slug ? 
        await generateUniqueSlug(activityData.slug) : 
        await generateUniqueSlug(activityData.title);
      
      console.log(`Oluşturulan slug: ${slug}`);
    } catch (slugError) {
      console.error('Slug oluşturma hatası:', slugError);
      return NextResponse.json(
        { error: 'Slug oluşturulamadı', details: slugError instanceof Error ? slugError.message : String(slugError) },
        { status: 500 }
      );
    }
    
    const newActivity = {
      ...activityData,
      slug,
      // Eksik alanları varsayılan değerlerle doldur
      gallery: activityData.gallery || [],
      includedServices: activityData.includedServices || [],
      contactWhatsapp: activityData.contactWhatsapp || '',
      featured: activityData.featured || false,
      content: activityData.content || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Veritabanına kaydet
    let dbResult;
    try {
      console.log('Aktivite MongoDB\'ye kaydediliyor...');
      dbResult = await updateOne('activities', { slug }, newActivity);
      console.log('Aktivite MongoDB\'ye kaydedildi:', dbResult);
    } catch (dbError) {
      console.error('MongoDB kayıt hatası:', dbError);
      
      // MongoDB veritabanına yazamadıysak yine de dosya sistemine yazmayı deneyebiliriz
      // Yalnızca JSON kaydetme işlemine devam et
    }
    
    // Ayrıca dosya sistemine kaydet (JSON olarak)
    let fileResult = false;
    try {
      console.log('Aktivite JSON dosyasına kaydediliyor...');
      const jsonActivity = syncActivityToJson(newActivity);
      fileResult = !!jsonActivity;
      console.log(`Aktivite JSON dosyasına da kaydedildi: ${slug}`);
    } catch (fileError) {
      console.error(`Aktivite JSON dosyasına yazılamadı:`, fileError);
    }
    
    // Her iki kayıt da başarısızsa hata döndür
    if (!dbResult && !fileResult) {
      return NextResponse.json(
        { error: 'Aktivite kaydedilemedi. Hem veritabanı hem de dosya sistemi kaydı başarısız oldu.' },
        { status: 500 }
      );
    }
    
    // Önbelleği temizleme işlemini gerçekleştir
    const revalidateResult = await revalidatePages();

    return NextResponse.json({ 
      success: true,
      activity: newActivity,
      savedToMongo: !!dbResult,
      savedToFile: fileResult,
      revalidated: !!revalidateResult
    });
    
  } catch (error) {
    console.error('Yeni aktivite oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite oluşturulamadı', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}