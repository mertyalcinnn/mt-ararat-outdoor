import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { findOne, updateOne } from '@/lib/mongodb';

// Hakkımızda verilerini al
export async function GET() {
  try {
    console.log('Hakkımızda verisi alınıyor...');
    
    // MongoDB'den veriyi al
    const aboutData = await findOne('content', { _id: 'about' });
    
    if (!aboutData) {
      console.log('Veri bulunamadı, boş bir şablon dönüyor...');
      // Boş bir şablon dön
      return NextResponse.json({ 
        title: "Hakkımızda", 
        content: "# Hakkımızda\n\nBuraya içeriğinizi ekleyin.",
        teamMembers: []
      });
    }
    
    console.log('Hakkımızda verisi başarıyla alındı');
    return NextResponse.json(aboutData.data);
  } catch (error) {
    console.error('Hakkımızda verisi yüklenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'Hakkımızda verisi yüklenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// Hakkımızda verilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    console.log('Hakkımızda verisi güncelleniyor...');
    
    // İsteği ayrıştır
    const requestText = await request.text();
    let data;
    
    try {
      data = JSON.parse(requestText);
      console.log('JSON verisi başarıyla ayrıştırıldı');
    } catch (parseError) {
      console.error('JSON ayrıştırma hatası:', parseError);
      return NextResponse.json(
        { error: 'Geçersiz JSON formatı', details: String(parseError) }, 
        { status: 400 }
      );
    }
    
    // Gerekli alanları kontrol et
    if (!data.title || !data.content) {
      console.error('Eksik alanlar:', { title: !data.title, content: !data.content });
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' }, 
        { status: 400 }
      );
    }
    
    // MongoDB'ye veri kaydet
    try {
      console.log('Veriler MongoDB\'ye kaydediliyor...');
      
      const result = await updateOne('content', { _id: 'about' }, { 
        data,
        updatedAt: new Date()
      });
      
      console.log('MongoDB güncelleme sonucu:', result);
      
      // Önbelleği temizle - sayfaları zorla yenile
      revalidatePath('/about');
      revalidatePath('/tr/about');
      revalidatePath('/en/about');
      revalidatePath('/ru/about');
      
      return NextResponse.json({ 
        success: true,
        message: 'Hakkımızda verisi başarıyla güncellendi',
        data
      });
    } catch (writeError) {
      console.error('MongoDB yazma hatası:', writeError);
      return NextResponse.json(
        { 
          error: 'Veritabanına yazılamadı',
          details: writeError instanceof Error ? writeError.message : String(writeError)
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Hakkımızda verisi güncellenirken genel hata:', error);
    return NextResponse.json(
      { 
        error: 'Hakkımızda verisi güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}