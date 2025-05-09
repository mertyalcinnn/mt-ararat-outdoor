import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest, 
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log(`Slug için aktivite alınıyor: ${slug}`);
    
    const activitiesDir = path.join(process.cwd(), 'data/activities');
    
    // Dizin var mı kontrol et
    if (!fs.existsSync(activitiesDir)) {
      console.error(`Dizin bulunamadı: ${activitiesDir}`);
      return NextResponse.json({ error: 'Aktivite dizini bulunamadı' }, { status: 404 });
    }
    
    // Slug'a göre dosyayı bulun
    const filePath = path.join(activitiesDir, `${slug}.json`);
    console.log(`Dosya yolu: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Dosya bulunamadı: ${filePath}`);
      return NextResponse.json(
        { error: `${slug} aktivitesi bulunamadı` }, 
        { status: 404 }
      );
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const activityData = JSON.parse(fileContents);
    
    console.log(`Aktivite başarıyla alındı: ${activityData.title}`);
    return NextResponse.json(activityData);
  } catch (error) {
    console.error('Aktivite yüklerken hata:', error);
    return NextResponse.json(
      { 
        error: 'Aktivite bulunamadı veya yüklenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error),
        slug: params.slug
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log(`Aktivite güncelleniyor: ${slug}`);
    
    const activitiesDir = path.join(process.cwd(), 'data/activities');
    
    // Dizin var mı kontrol et
    if (!fs.existsSync(activitiesDir)) {
      console.error(`Dizin bulunamadı: ${activitiesDir}`);
      return NextResponse.json({ error: 'Aktivite dizini bulunamadı' }, { status: 404 });
    }
    
    const filePath = path.join(activitiesDir, `${slug}.json`);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      console.error(`Dosya bulunamadı: ${filePath}`);
      return NextResponse.json(
        { error: `${slug} aktivitesi bulunamadı` }, 
        { status: 404 }
      );
    }
    
    // İstek gövdesinden güncellenmiş verileri alın
    const requestText = await request.text();
    console.log('Güncellenen veriler:', requestText.substring(0, 200) + '...');
    
    let data;
    try {
      data = JSON.parse(requestText);
    } catch (parseError) {
      console.error('JSON ayrıştırma hatası:', parseError);
      return NextResponse.json(
        { error: 'Geçersiz JSON formatı', details: String(parseError) }, 
        { status: 400 }
      );
    }
    
    // Veriyi doğrula
    if (!data.title || !data.slug || !data.description) {
      console.error('Eksik alanlar:', { title: !data.title, slug: !data.slug, description: !data.description });
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' }, 
        { status: 400 }
      );
    }
    
    // Dosyaya yazın
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Aktivite güncellendi: ${filePath}`);
    
    // Eğer slug değiştiyse, dosya adını da değiştir
    if (slug !== data.slug) {
      const newFilePath = path.join(activitiesDir, `${data.slug}.json`);
      fs.renameSync(filePath, newFilePath);
      console.log(`Dosya adı değiştirildi: ${filePath} -> ${newFilePath}`);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Aktivite başarıyla güncellendi',
      data
    });
  } catch (error) {
    console.error('Aktivite güncellenirken hata:', error);
    return NextResponse.json(
      { 
        error: 'Aktivite güncellenirken hata oluştu',
        details: error instanceof Error ? error.message : String(error),
        slug: params.slug
      }, 
      { status: 500 }
    );
  }
}