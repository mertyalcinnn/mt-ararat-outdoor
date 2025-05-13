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
    
    const activity = await findOne('activities', { slug });
    
    if (!activity) {
      return NextResponse.json(
        { error: 'Aktivite bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(activity);
    
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
    const existingActivity = await findOne('activities', { slug });
    
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
    console.log('Aktivite MongoDB\'ye güncelleniyor...');
    await updateOne('activities', { slug: finalSlug }, updatedActivity);
    
    // Slug değiştiyse eski dosyayı sil
    if (finalSlug !== slug) {
      console.log(`Eski JSON dosyası siliniyor: ${slug}`);
      deleteActivityJson(slug);
    }
    
    // JSON dosyasına kaydet
    try {
      syncActivityToJson(updatedActivity);
      console.log(`Aktivite JSON dosyasına da güncellendi: ${finalSlug}`);
    } catch (fileError) {
      console.error('Aktivite JSON dosyasına yazılırken hata:', fileError);
    }
    
    return NextResponse.json({ 
      success: true,
      activity: updatedActivity
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
    
    // Veritabanından sil
    const deleteResult = await deleteOne('activities', { slug });
    
    if (!deleteResult) {
      return NextResponse.json(
        { error: 'Aktivite bulunamadı veya silinemedi' },
        { status: 404 }
      );
    }
    
    // JSON dosyasını da sil
    try {
      const jsonDeleteResult = deleteActivityJson(slug);
      console.log(`JSON dosyası silme sonucu: ${jsonDeleteResult ? 'Başarılı' : 'Başarısız'}`);
    } catch (fileError) {
      console.error('JSON dosyası silinirken hata:', fileError);
    }
    
    return NextResponse.json({ 
      success: true,
      message: `${slug} aktivitesi başarıyla silindi.`
    });
    
  } catch (error) {
    console.error('Aktivite silinirken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite silinemedi', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
