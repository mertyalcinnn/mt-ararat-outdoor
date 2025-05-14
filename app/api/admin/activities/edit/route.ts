import { NextRequest, NextResponse } from 'next/server';
import { findOne, updateOne, deleteOne } from '@/lib/mongodb';
import { syncActivityToJson, deleteActivityJson } from '@/lib/activities';

export async function PUT(
  request: NextRequest
) {
  try {
    const updatedData = await request.json();
    const slug = updatedData.originalSlug || updatedData.slug;
    
    if (!slug) {
      console.error('Güncellenecek aktivite için slug bilgisi eksik');
      return NextResponse.json(
        { error: 'Slug bilgisi eksik' },
        { status: 400 }
      );
    }
    
    // Aktivitenin var olup olmadığını kontrol et
    let existingActivity = null;
    try {
      existingActivity = await findOne('activities', { slug });
    } catch (dbError) {
      console.error(`Aktivite sorgulanırken MongoDB hatası:`, dbError);
    }
    
    // Mongo'da bulunamadıysa JSON dosyasından kontrol edelim
    if (!existingActivity) {
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'data', 'activities', `${slug}.json`);
        
        if (fs.existsSync(filePath)) {
          console.log(`MongoDB'de bulunamayan aktivite JSON dosyasından okunuyor: ${slug}`);
          const fileContents = fs.readFileSync(filePath, 'utf8');
          existingActivity = JSON.parse(fileContents);
        } else {
          console.error(`Güncellenecek aktivite bulunamadı: ${slug}`);
          return NextResponse.json(
            { error: `${slug} aktivitesi bulunamadı` },
            { status: 404 }
          );
        }
      } catch (fileError) {
        console.error(`Dosya sisteminden aktivite okuma hatası:`, fileError);
        return NextResponse.json(
          { error: `${slug} aktivitesi bulunamadı` },
          { status: 404 }
        );
      }
    }
    
    // Slug değişmiyorsa, doğrudan güncelle
    if (!updatedData.originalSlug || updatedData.originalSlug === updatedData.slug) {
      const activityToUpdate = {
        ...updatedData,
        updatedAt: new Date()
      };
      
      if (activityToUpdate.originalSlug) {
        delete activityToUpdate.originalSlug; // Gereksiz alanı temizle
      }
      
      // MongoDB'de güncelle
      let dbResult = null;
      try {
        dbResult = await updateOne('activities', { slug }, activityToUpdate);
        console.log(`Aktivite MongoDB'de güncellendi: ${slug}`);
      } catch (dbError) {
        console.error(`Aktivite MongoDB'de güncellenirken hata:`, dbError);
        // Hata oluşursa dosya sisteminde güncellemeye devam et
      }
      
      // JSON dosyasını güncelle
      let fileResult = false;
      try {
        const jsonActivity = await syncActivityToJson(activityToUpdate);
        fileResult = !!jsonActivity;
        console.log(`Aktivite JSON dosyası güncellendi: ${slug}`);
      } catch (fileError) {
        console.error(`Aktivite JSON dosyası güncellenirken hata:`, fileError);
      }
      
      // Her iki kaynak da başarısız olduysa hata döndür
      if (!dbResult && !fileResult) {
        return NextResponse.json(
          { error: 'Aktivite güncellenemedi. Hem veritabanı hem de dosya sistemi güncellemesi başarısız oldu.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        activity: activityToUpdate,
        savedToMongo: !!dbResult,
        savedToFile: fileResult
      });
    } 
    // Slug değişiyorsa, eskisini sil ve yenisini ekle
    else {
      const newSlug = updatedData.slug;
      const originalSlug = updatedData.originalSlug;
      
      if (!newSlug) {
        return NextResponse.json(
          { error: 'Yeni slug değeri belirtilmemiş' },
          { status: 400 }
        );
      }
      
      const newActivity = {
        ...updatedData,
        updatedAt: new Date()
      };
      
      if (newActivity.originalSlug) {
        delete newActivity.originalSlug; // Gereksiz alanı temizle
      }
      
      // Eski aktiviteyi sil
      let deleteResult = null;
      try {
        deleteResult = await deleteOne('activities', { slug: originalSlug });
        console.log(`Eski aktivite MongoDB'den silindi: ${originalSlug}`);
      } catch (dbError) {
        console.error(`Eski aktivite MongoDB'den silinirken hata:`, dbError);
      }
      
      // JSON dosyasını sil
      let jsonDeleteResult = false;
      try {
        jsonDeleteResult = await deleteActivityJson(originalSlug);
        console.log(`Eski JSON dosyası silindi: ${originalSlug}`);
      } catch (fileError) {
        console.error(`Eski JSON dosyası silinirken hata:`, fileError);
      }
      
      // Yeni aktiviteyi ekle
      let dbResult = null;
      try {
        dbResult = await updateOne('activities', { slug: newSlug }, newActivity);
        console.log(`Yeni aktivite MongoDB'ye eklendi: ${newSlug}`);
      } catch (dbError) {
        console.error(`Yeni aktivite MongoDB'ye eklenirken hata:`, dbError);
      }
      
      // JSON dosyasını kaydet
      let fileResult = false;
      try {
        const jsonActivity = await syncActivityToJson(newActivity);
        fileResult = !!jsonActivity;
        console.log(`Yeni aktivite JSON dosyası oluşturuldu: ${newSlug}`);
      } catch (fileError) {
        console.error(`Yeni JSON dosyası oluşturulurken hata:`, fileError);
      }
      
      // Her iki kaynak da başarısız olduysa hata döndür
      if (!dbResult && !fileResult) {
        return NextResponse.json(
          { error: 'Aktivite güncellenemedi. Hem veritabanı hem de dosya sistemi güncellemesi başarısız oldu.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        activity: newActivity,
        savedToMongo: !!dbResult,
        savedToFile: fileResult
      });
    }
  } catch (error) {
    console.error('Aktivite güncellenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'Aktivite güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}