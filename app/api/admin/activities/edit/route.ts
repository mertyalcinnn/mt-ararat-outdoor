import { NextRequest, NextResponse } from 'next/server';
import { findOne, updateOne } from '@/lib/mongodb';
import { syncActivityToJson, deleteActivityJson } from '@/lib/activities';
import { revalidatePages } from '@/lib/revalidate';

// API rotasını dinamik olarak işaretle
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST - Aktiviteyi güncelle (Next.js'te PUT yerine POST kullanabiliriz)
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/activities/edit isteği alındı.');
    
    const body = await request.json();
    const { slug, ...activityData } = body;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Aktivite slug bilgisi eksik veya geçersiz' },
        { status: 400 }
      );
    }
    
    console.log(`Aktivite güncelleniyor: ${slug}`);
    
    // Slug değiştirilmediyse doğrudan güncelle
    let finalSlug = slug;
    if (body.slug && body.slug !== slug) {
      finalSlug = body.slug;
      console.log(`Aktivite slug değişimi: ${slug} -> ${finalSlug}`);
    }
    
    // Önce MongoDB'den aktiviteyi almayı dene
    let existingActivity = null;
    try {
      existingActivity = await findOne('activities', { slug });
      console.log('MongoDB\'den aktivite alındı:', !!existingActivity);
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
    
    let updatedActivity;
    
    // Her iki kaynakta da bulunamadıysa yeni aktivite oluştur
    if (!existingActivity) {
      console.log(`${slug} aktivitesi bulunamadı. Yeni aktivite olarak oluşturulacak.`);
      
      updatedActivity = {
        ...activityData,
        slug: finalSlug,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      // Mevcut aktiviteyi güncelle
      updatedActivity = {
        ...existingActivity,
        ...activityData,
        slug: finalSlug,
        updatedAt: new Date()
      };
    }
    
    // Veritabanına kaydet
    let dbResult = false;
    try {
      console.log('Aktivite MongoDB\'ye kaydediliyor...');
      const mongoResult = await updateOne(
        'activities', 
        { slug: finalSlug }, 
        updatedActivity,
        true // Yoksa oluştur
      );
      dbResult = !!mongoResult;
      console.log(`MongoDB kayıt/güncelleme sonucu:`, mongoResult);
    } catch (dbError) {
      console.error('MongoDB kayıt/güncelleme hatası:', dbError);
    }
    
    // Slug değiştiyse eski dosyayı sil
    if (finalSlug !== slug && existingActivity) {
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
      console.log(`Aktivite JSON dosyasına kaydedildi: ${finalSlug}`);
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
      activity: updatedActivity,
      isNew: !existingActivity,
      savedToMongo: dbResult,
      savedToFile: fileResult,
      revalidated: !!revalidateResult
    });
    
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json(
      { error: 'İşlem başarısız oldu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}