import { NextRequest, NextResponse } from 'next/server';
import { findOne, updateOne, deleteOne } from '@/lib/mongodb';
import { syncActivityToJson, deleteActivityJson } from '@/lib/activities';

export async function PUT(
  request: NextRequest
) {
  try {
    const updatedData = await request.json();
    const slug = updatedData.originalSlug || updatedData.slug;
    
    // Aktivitenin var olup olmadığını kontrol et
    const existingActivity = await findOne('activities', { slug });
    
    if (!existingActivity) {
      console.error(`Güncellenecek aktivite bulunamadı: ${slug}`);
      return NextResponse.json(
        { error: `${slug} aktivitesi bulunamadı` },
        { status: 404 }
      );
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
      await updateOne('activities', { slug }, activityToUpdate);
      
      // JSON dosyasını güncelle
      try {
        syncActivityToJson(activityToUpdate);
        console.log(`Aktivite JSON dosyası güncellendi: ${slug}`);
      } catch (fileError) {
        console.error(`Aktivite MongoDB'de güncellendi ancak JSON dosyası güncellenemedi:`, fileError);
      }
      
      return NextResponse.json({
        success: true,
        activity: activityToUpdate
      });
    } 
    // Slug değişiyorsa, eskisini sil ve yenisini ekle
    else {
      const newSlug = updatedData.slug;
      const originalSlug = updatedData.originalSlug;
      
      if (updatedData.originalSlug) {
        delete updatedData.originalSlug; // Gereksiz alanı temizle
      }
      
      // Eski aktiviteyi sil
      await deleteOne('activities', { slug: originalSlug });
      
      // JSON dosyasını sil
      try {
        deleteActivityJson(originalSlug);
      } catch (fileError) {
        console.error(`Eski JSON dosyası silinemedi:`, fileError);
      }
      
      // Yeni aktiviteyi ekle
      const newActivity = {
        ...updatedData,
        updatedAt: new Date()
      };
      
      // MongoDB'ye kaydet
      await updateOne('activities', { slug: newSlug }, newActivity);
      
      // JSON dosyasını kaydet
      try {
        syncActivityToJson(newActivity);
        console.log(`Yeni aktivite JSON dosyası oluşturuldu: ${newSlug}`);
      } catch (fileError) {
        console.error(`Yeni JSON dosyası oluşturulamadı:`, fileError);
      }
      
      return NextResponse.json({
        success: true,
        activity: newActivity
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