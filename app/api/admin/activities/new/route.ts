import { NextRequest, NextResponse } from 'next/server';
import { insertOne, updateOne, findOne } from '@/lib/mongodb';
import { syncActivityToJson } from '@/lib/activities';
import { revalidatePages } from '@/lib/revalidate';
import { v4 as uuidv4 } from 'uuid';

// API rotasını dinamik olarak işaretle
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Slug oluşturmak için yardımcı fonksiyon
function createSlug(title: string): string {
  if (!title) return '';
  
  // Türkçe karakterleri ASCII karşılıklarıyla değiştir
  const turkishCharMap: Record<string, string> = {
    'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
    'İ': 'I', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'Ö': 'O', 'Ç': 'C'
  };
  
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Alfanümerik olmayan karakterleri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-'); // Birden fazla tireyi tek tireye indir
    
  // Türkçe karakterleri değiştir
  for (const [turkishChar, asciiChar] of Object.entries(turkishCharMap)) {
    slug = slug.replace(new RegExp(turkishChar, 'g'), asciiChar);
  }
  
  return slug;
}

// POST - Yeni aktivite ekle
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/activities/new isteği alındı.');
    
    const body = await request.json();
    
    // Eğer slug yoksa veya boşsa başlıktan oluştur
    if (!body.slug || body.slug.trim() === '') {
      body.slug = createSlug(body.title);
      console.log(`Başlıktan slug oluşturuldu: ${body.slug}`);
    }
    
    // Slug'ın benzersiz olup olmadığını kontrol et
    try {
      const existingActivity = await findOne('activities', { slug: body.slug });
      
      if (existingActivity) {
        console.log(`${body.slug} slug'ı ile bir aktivite zaten mevcut, benzersiz hale getiriliyor...`);
        // Benzersiz bir slug oluştur
        const randomSuffix = uuidv4().substring(0, 6);
        body.slug = `${body.slug}-${randomSuffix}`;
        console.log(`Yeni benzersiz slug: ${body.slug}`);
      }
    } catch (checkError) {
      console.error('Slug kontrolü sırasında hata:', checkError);
    }
    
    // Aktivite verilerini hazırla
    const activityData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Veritabanına kaydet
    let dbResult = false;
    try {
      console.log('Yeni aktivite MongoDB\'ye kaydediliyor...');
      const insertResult = await insertOne('activities', activityData);
      dbResult = !!insertResult;
      console.log('MongoDB kayıt sonucu:', !!insertResult);
    } catch (dbError) {
      console.error('MongoDB kayıt hatası:', dbError);
    }
    
    // JSON dosyasına kaydet
    let fileResult = false;
    try {
      console.log('Aktivite JSON dosyasına yazılıyor...');
      const jsonActivity = await syncActivityToJson(activityData);
      fileResult = !!jsonActivity;
      console.log(`Aktivite JSON dosyasına kaydedildi: ${body.slug}`);
    } catch (fileError) {
      console.error('Aktivite JSON dosyasına yazılırken hata:', fileError);
    }
    
    // Her iki kaynak da başarısız olduysa hata döndür
    if (!dbResult && !fileResult) {
      return NextResponse.json(
        { error: 'Aktivite kaydedilemedi. Hem veritabanı hem de dosya sistemi başarısız oldu.' },
        { status: 500 }
      );
    }
    
    // Önbelleği temizleme işlemini gerçekleştir
    const revalidateResult = await revalidatePages();
    
    return NextResponse.json({ 
      success: true,
      activity: activityData,
      savedToMongo: dbResult,
      savedToFile: fileResult,
      revalidated: !!revalidateResult
    });
    
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json(
      { error: 'Aktivite eklenemedi', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}