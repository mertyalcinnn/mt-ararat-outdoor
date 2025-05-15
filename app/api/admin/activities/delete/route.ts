import { NextRequest, NextResponse } from 'next/server';
import { deleteOne } from '@/lib/mongodb';
import { deleteActivityJson } from '@/lib/activities';
import { revalidatePages } from '@/lib/revalidate';

// API rotasını dinamik olarak işaretle
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST - Aktivite silme endpoint
export async function POST(request: NextRequest) {
  try {
    console.log(`POST /api/admin/activities/delete isteği alındı.`);
    
    // İstek gövdesini al
    const body = await request.json();
    const { slug } = body;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Aktivite slug bilgisi eksik veya geçersiz' },
        { status: 400 }
      );
    }
    
    console.log(`Silme işlemi başlıyor: ${slug}`);
    
    // Veritabanından sil
    let dbResult = false;
    try {
      const deleteResult = await deleteOne('activities', { slug });
      
      if (deleteResult) {
        dbResult = !!(deleteResult.deletedCount > 0);
        console.log(`Aktivite MongoDB'den silindi: ${slug} (Silinen: ${deleteResult.deletedCount})`);
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
          console.log(`${slug} aktivitesi bulunamadı fakat silme işlemi başarılı sayılıyor`);
          // 404 yerine başarılı yanıt dönelim ve kullanıcı arayüzünde aktiviteyi kaldıralım
          return NextResponse.json({ 
            success: true,
            message: `${slug} aktivitesi zaten mevcut değil, silme işlemi başarılı sayıldı.`,
            deletedFromMongo: dbResult,
            deletedFromFile: fileResult,
            revalidated: false,
            notFound: true
          });
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
    
  } catch (error) {
    console.error('Aktivite silinirken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite silinemedi', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}