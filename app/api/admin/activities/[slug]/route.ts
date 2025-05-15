import { NextRequest, NextResponse } from 'next/server';
import { findOne, updateOne, deleteOne } from '@/lib/mongodb';
import { syncActivityToJson, deleteActivityJson } from '@/lib/activities';

// API rotasını dinamik olarak işaretle
export const dynamic = 'force-dynamic';

// Vercel derleme hatalarını önlemek için revalidate süresini 0 olarak belirle
// Bu, sayfanın her istekte yeniden oluşturulmasını sağlar
export const revalidate = 0;

// Dinamik API'ler için Next.js tarafından gereken yapılandırma
export const fetchCache = 'force-no-store';

// Bu dosya için gereken tüm dinamik parametreleri oluştur
export async function generateStaticParams() {
  try {
    // Aktivite sluglarını getir (vercel derleme için)
    const fs = require('fs');
    const path = require('path');
    
    // Aktivite dosyalarının bulunduğu dizini kontrol et
    const activityDir = path.join(process.cwd(), 'data', 'activities');
    
    // Dizin yoksa veya erişilemiyorsa boş dizi dön
    if (!fs.existsSync(activityDir)) {
      console.log('Aktivite dizini bulunamadı, boş slug listesi döndürülüyor');
      return [];
    }
    
    // JSON dosyalarını bul
    const files = fs.readdirSync(activityDir);
    const jsonFiles = files.filter((file: string) => file.endsWith('.json'));
    
    // Slug parametrelerini oluştur
    const params = jsonFiles.map((file: string) => ({
      slug: file.replace('.json', '')
    }));
    
    console.log(`${params.length} adet aktivite slugı oluşturuldu`);
    return params;
  } catch (error) {
    console.error('Slug parametreleri oluşturulurken hata:', error);
    // Herhangi bir hata durumunda boş dizi döndür
    return [];
  }
}

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

// GET - Slug'a göre aktivite getir
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log(`GET /api/admin/activities/${slug} isteği alındı.`);
    
    // MongoDB'den aktiviteyi almayı dene
    let activity = null;
    try {
      activity = await findOne('activities', { slug });
      
      if (activity) {
        console.log(`Aktivite MongoDB'den alındı: ${slug}`);
        return NextResponse.json(activity);
      }
    } catch (dbError) {
      console.error(`MongoDB'den aktivite alınırken hata:`, dbError);
    }
    
    // MongoDB'de yoksa JSON dosyasından almayı dene
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'data', 'activities', `${slug}.json`);
      
      if (fs.existsSync(filePath)) {
        console.log(`Aktivite dosya sisteminden alınıyor: ${slug}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        activity = JSON.parse(fileContent);
        return NextResponse.json(activity);
      }
    } catch (fileError) {
      console.error(`Dosya sisteminden aktivite alınırken hata:`, fileError);
    }
    
    // Her iki kaynakta da bulunamadıysa 404 döndür
    console.log(`${slug} aktivitesi hem MongoDB'de hem de dosya sisteminde bulunamadı`);
    // Burada 404 yanıtı dönmek yerine placeholder bir veri dönelim (sadece edit sayfasının çalışması için)
    return NextResponse.json({
      slug: slug,
      title: "Yeni Aktivite",
      description: "Bu aktivite mevcut değil. Kaydettiğinizde yeni bir aktivite olarak oluşturulacaktır.",
      content: "# Yeni Aktivite\n\nBu aktivite sisteminizde bulunamadı. Bilgileri girerek yeni bir aktivite oluşturabilirsiniz.",
      coverImage: "",
      gallery: [],
      duration: "",
      difficultyLevel: "Orta",
      includedServices: ["Rehberlik", "Ulaşım", "Ekipman"],
      contactWhatsapp: "",
      featured: false,
      isNewPlaceholder: true  // Bu özel alanla bu aktivitenin gerçekte mevcut olmadığını belirtelim
    });
    
  } catch (error) {
    console.error('Aktivite alınırken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite alınamadı', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT - Aktiviteyi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log(`PUT /api/admin/activities/${slug} isteği alındı.`);
    
    const activityData = await request.json();
    
    // Slug değiştirilmediyse doğrudan güncelle
    let finalSlug = slug;
    if (activityData.slug && activityData.slug !== slug) {
      finalSlug = activityData.slug;
      console.log(`Aktivite slug değişimi: ${slug} -> ${finalSlug}`);
    }
    
    // Önce MongoDB'den aktiviteyi almayı dene
    let existingActivity = null;
    try {
      existingActivity = await findOne('activities', { slug });
    } catch (dbError) {
      console.error(`MongoDB'den aktivite alınırken hata:`, dbError);
    }
    
    // MongoDB'de yoksa JSON dosyasından almayı dene
    if (!existingActivity) {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'data', 'activities', `${slug}.json`);
        
        if (fs.existsSync(filePath)) {
          console.log(`Aktivite dosya sisteminden alınıyor: ${slug}`);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          existingActivity = JSON.parse(fileContent);
        }
      } catch (fileError) {
        console.error(`Dosya sisteminden aktivite alınırken hata:`, fileError);
      }
    }
    
    // Her iki kaynakta da bulunamadıysa yeni bir aktivite oluştur
    if (!existingActivity) {
      console.log(`${slug} aktivitesi güncelleme için bulunamadı. Yeni aktivite olarak oluşturulacak.`);
      
      // Aktivite yok, yeni oluşturuluyor
      const newActivity = {
        ...activityData,
        slug: finalSlug,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Veritabanına kaydet
      let dbResult = false;
      try {
        console.log('Yeni aktivite MongoDB\'ye kaydediliyor...');
        const insertResult = await updateOne('activities', { slug: finalSlug }, newActivity, true);
        dbResult = !!insertResult;
        console.log('MongoDB kayıt sonucu:', insertResult);
      } catch (dbError) {
        console.error('MongoDB kayıt hatası:', dbError);
      }
      
      // JSON dosyasına kaydet
      let fileResult = false;
      try {
        const jsonActivity = await syncActivityToJson(newActivity);
        fileResult = !!jsonActivity;
        console.log(`Aktivite JSON dosyasına kaydedildi: ${finalSlug}`);
      } catch (fileError) {
        console.error('Aktivite JSON dosyasına yazılırken hata:', fileError);
      }
      
      // Her iki kaynak da başarısız olduysa hata döndür
      if (!dbResult && !fileResult) {
        return NextResponse.json(
          { error: 'Aktivite oluşturulamadı. Hem veritabanı hem de dosya sistemi başarısız oldu.' },
          { status: 500 }
        );
      }
      
      // Önbelleği temizleme işlemini gerçekleştir
      const revalidateResult = await revalidatePages();
      
      return NextResponse.json({ 
        success: true,
        activity: newActivity,
        isNew: true,
        savedToMongo: dbResult,
        savedToFile: fileResult,
        revalidated: !!revalidateResult
      });
    }
    
    const updatedActivity = {
      ...existingActivity,
      ...activityData,
      slug: finalSlug,
      updatedAt: new Date()
    };
    
    // Veritabanına kaydet
    let dbResult = false;
    try {
      console.log('Aktivite MongoDB\'ye güncelleniyor...');
      const mongoResult = await updateOne('activities', { slug: finalSlug }, updatedActivity);
      dbResult = !!mongoResult;
      console.log(`MongoDB güncelleme sonucu:`, mongoResult);
    } catch (dbError) {
      console.error('MongoDB güncelleme hatası:', dbError);
    }
    
    // Slug değiştiyse eski dosyayı sil
    if (finalSlug !== slug) {
      try {
        console.log(`Eski JSON dosyası siliniyor: ${slug}`);
        await deleteActivityJson(slug);
      } catch (deleteError) {
        console.error(`Eski JSON dosyası silinirken hata:`, deleteError);
      }
    }
    
    // JSON dosyasına kaydet
    let fileResult = false;
    try {
      const jsonActivity = await syncActivityToJson(updatedActivity);
      fileResult = !!jsonActivity;
      console.log(`Aktivite JSON dosyasına da güncellendi: ${finalSlug}`);
    } catch (fileError) {
      console.error('Aktivite JSON dosyasına yazılırken hata:', fileError);
    }
    
    // Her iki kaynak da başarısız olduysa hata döndür
    if (!dbResult && !fileResult) {
      return NextResponse.json(
        { error: 'Aktivite güncellenemedi. Hem veritabanı hem de dosya sistemi güncellemesi başarısız oldu.' },
        { status: 500 }
      );
    }
    
    // Önbelleği temizleme işlemini gerçekleştir
    const revalidateResult = await revalidatePages();
    
    return NextResponse.json({ 
      success: true,
      activity: updatedActivity,
      savedToMongo: dbResult,
      savedToFile: fileResult,
      revalidated: !!revalidateResult
    });
    
  } catch (error) {
    console.error('Aktivite güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite güncellenemedi', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST - İşlem türüne göre aksiyon al (silme işlemi için)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log(`POST /api/admin/activities/${slug} isteği alındı.`);
    
    // İstek gövdesini al
    const body = await request.json();
    
    // Silme işlemini kontrol et
    if (body && body._action === "delete") {
      console.log(`Silme işlemi algılandı: ${slug}`);
      return handleDeleteRequest(slug);
    }
    
    // Desteklenmeyen aksiyon
    return NextResponse.json(
      { error: 'Desteklenmeyen işlem türü' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('POST işlemi sırasında hata:', error);
    return NextResponse.json(
      { error: 'İşlem gerçekleştirilemedi', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Silme işlemi için yardımcı fonksiyon
async function handleDeleteRequest(slug: string) {
  if (!slug) {
    return NextResponse.json(
      { error: 'Aktivite slug bilgisi eksik' },
      { status: 400 }
    );
  }
  
  // Veritabanından sil
  let dbResult = false;
  try {
    const deleteResult = await deleteOne('activities', { slug });
    
    if (deleteResult) {
      dbResult = !!(deleteResult.deletedCount > 0);
      console.log(`Aktivite MongoDB'den silindi: ${slug} (Silinen: ${deleteResult.deletedCount})`);
    } else {
      console.log(`deleteOne null sonuç döndü: ${slug}`);
    }
  } catch (dbError) {
    console.error(`Aktivite MongoDB'den silinirken hata:`, dbError);
  }
  
  // JSON dosyasını da sil
  let fileResult = false;
  try {
    fileResult = await deleteActivityJson(slug);
    console.log(`JSON dosyası silme sonucu: ${fileResult ? 'Başarılı' : 'Başarısız'}`);
  } catch (fileError) {
    console.error('JSON dosyası silinirken hata:', fileError);
  }
  
  // Her iki kaynak da başarısız olduysa ve aktivite bulunamadıysa hata döndür
  if (!dbResult && !fileResult) {
    // Dosya sisteminde bir kez daha bakalım
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'data', 'activities', `${slug}.json`);
      
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: 'Aktivite bulunamadı veya silinemedi' },
          { status: 404 }
        );
      }
    } catch (fsError) {
      console.error('Dosya sistemi kontrolü hatası:', fsError);
    }
  }
  
  // Önbelleği temizleme işlemini gerçekleştir
  const revalidateResult = await revalidatePages();
  
  return NextResponse.json({ 
    success: true,
    message: `${slug} aktivitesi başarıyla silindi.`,
    deletedFromMongo: dbResult,
    deletedFromFile: fileResult,
    revalidated: !!revalidateResult
  });
}

// DELETE - Aktiviteyi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log(`DELETE /api/admin/activities/${slug} isteği alındı.`);
    
    return handleDeleteRequest(slug);
    
  } catch (error) {
    console.error('Aktivite silinirken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite silinemedi', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}