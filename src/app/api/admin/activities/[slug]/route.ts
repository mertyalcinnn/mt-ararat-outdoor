import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest, 
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const activitiesDir = path.join(process.cwd(), 'data/activities');
    
    // Slug'a göre dosyayı bulun
    const filePath = path.join(activitiesDir, `${slug}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `${slug} aktivitesi bulunamadı` }, 
        { status: 404 }
      );
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error('Aktivite yüklerken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite bulunamadı veya yüklenirken hata oluştu' }, 
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
    const activitiesDir = path.join(process.cwd(), 'data/activities');
    const filePath = path.join(activitiesDir, `${slug}.json`);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `${slug} aktivitesi bulunamadı` }, 
        { status: 404 }
      );
    }
    
    // İstek gövdesinden güncellenmiş verileri alın
    const data = await request.json();
    
    // Veriyi doğrula
    if (!data.title || !data.slug || !data.description) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' }, 
        { status: 400 }
      );
    }
    
    // Dosyaya yazın
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    // Eğer slug değiştiyse, dosya adını da değiştir
    if (slug !== data.slug) {
      const newFilePath = path.join(activitiesDir, `${data.slug}.json`);
      fs.renameSync(filePath, newFilePath);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Aktivite başarıyla güncellendi',
      data
    });
  } catch (error) {
    console.error('Aktivite güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite güncellenirken hata oluştu' }, 
      { status: 500 }
    );
  }
}