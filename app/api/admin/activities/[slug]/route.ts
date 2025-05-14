import { NextRequest, NextResponse } from 'next/server';
import { findOne, updateOne, deleteOne } from '@/lib/mongodb';
import { syncActivityToJson, deleteActivityJson } from '@/lib/activities';

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
    return NextResponse.json(
      { error: 'Aktivite bulunamadı' },
      { status: 404 }
    );
    
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
    
    // Her iki kaynakta da bulunamadıysa 404 döndür
    if (!existingActivity) {
      return NextResponse.json(
        { error: 'Güncellenecek aktivite bulunamadı' },
        { status: 404 }
      );
    }
    
    // Slug değiştirilmediyse doğrudan güncelle
    let finalSlug = slug;
    if (activityData.slug && activityData.slug !== slug) {
      finalSlug = activityData.slug;
      console.log(`Aktivite slug değişimi: ${slug} -> ${finalSlug}`);
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
        deleteActivityJson(slug);
      } catch (deleteError) {
        console.error(`Eski JSON dosyası silinirken hata:`, deleteError);
      }
    }
    
    // JSON dosyasına kaydet
    let fileResult = false;
    try {
      const jsonActivity = syncActivityToJson(updatedActivity);
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
    
    return NextResponse.json({ 
      success: true,
      activity: updatedActivity,
      savedToMongo: dbResult,
      savedToFile: fileResult
    });
    
  } catch (error) {
    console.error('Aktivite güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite güncellenemedi', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Aktiviteyi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log(`DELETE /api/admin/activities/${slug} isteği alındı.`);
    
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
      dbResult = !!(deleteResult && deleteResult.deletedCount > 0);
      
      if (dbResult) {
        console.log(`Aktivite MongoDB'den silindi: ${slug}`);
      } else {
        console.log(`Aktivite MongoDB'de bulunamadı veya silinemedi: ${slug}`);
      }
    } catch (dbError) {
      console.error(`Aktivite MongoDB'den silinirken hata:`, dbError);
    }
    
    // JSON dosyasını da sil
    let fileResult = false;
    try {
      fileResult = deleteActivityJson(slug);
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
    
    return NextResponse.json({ 
      success: true,
      message: `${slug} aktivitesi başarıyla silindi.`,
      deletedFromMongo: dbResult,
      deletedFromFile: fileResult
    });
    
  } catch (error) {
    console.error('Aktivite silinirken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite silinemedi', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}