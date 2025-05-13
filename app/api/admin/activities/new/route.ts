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
export async function POST(request: NextRequest) {
  try {
    console.log('Yeni aktivite oluşturma isteği alındı.');
    const activityData = await request.json();
    
    // Slug oluştur veya gelen değeri kullan
    const slug = activityData.slug ? 
      await generateUniqueSlug(activityData.slug) : 
      await generateUniqueSlug(activityData.title);
    
    console.log(`Oluşturulan slug: ${slug}`);
    
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
    console.log('Aktivite MongoDB\'ye kaydediliyor...');
    await updateOne('activities', { slug }, newActivity);
    console.log('Aktivite MongoDB\'ye kaydedildi.');
    
    // Ayrıca dosya sistemine kaydet (JSON olarak)
    try {
      console.log('Aktivite JSON dosyasına kaydediliyor...');
      syncActivityToJson(newActivity);
      console.log(`Aktivite JSON dosyasına da kaydedildi: ${slug}`);
    } catch (fileError) {
      console.error(`Aktivite MongoDB'ye kaydedildi ancak JSON dosyasına yazılamadı:`, fileError);
    }
    
    return NextResponse.json({ 
      success: true,
      activity: newActivity
    });
    
  } catch (error) {
    console.error('Yeni aktivite oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite oluşturulamadı', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}