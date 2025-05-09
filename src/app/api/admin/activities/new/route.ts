import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import { syncMarkdownToJson } from '@/lib/activities';

// Aktivitelerin yolu
const activitiesDir = path.join(process.cwd(), 'content', 'activities');

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
    // Tüm aktivite dosyalarını al
    const files = await fs.readdir(activitiesDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    // Slug ile eşleşen dosyayı kontrol et
    for (const file of mdFiles) {
      const filePath = path.join(activitiesDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const { data } = matter(content);
      
      if (data.slug === slug) {
        return false;
      }
    }
    
    return true;
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

// Aktiviteyi kaydet
async function saveActivity(activity: any) {
  try {
    // content/activities klasörünün varlığını kontrol et, yoksa oluştur
    try {
      await fs.access(activitiesDir);
    } catch {
      await fs.mkdir(activitiesDir, { recursive: true });
    }
    
    // Frontmatter ve içerik oluştur
    const frontmatter = {
      title: activity.title,
      slug: activity.slug,
      description: activity.description,
      coverImage: activity.coverImage,
      gallery: activity.gallery || [],
      duration: activity.duration,
      difficultyLevel: activity.difficultyLevel,
      includedServices: activity.includedServices || [],
      contactWhatsapp: activity.contactWhatsapp || '',
      featured: activity.featured || false,
      date: new Date().toISOString()
    };
    
    const fileContent = matter.stringify(activity.content || '', frontmatter);
    
    // Markdown dosyasını kaydet
    const filePath = path.join(activitiesDir, `${activity.slug}.md`);
    await fs.writeFile(filePath, fileContent, 'utf8');
    
    // JSON dosyasını da kaydet
    const activityData = {
      ...frontmatter,
      content: activity.content
    };
    syncMarkdownToJson(activityData);
    
    return activity;
  } catch (error) {
    console.error('Aktivite kaydedilirken hata:', error);
    throw error;
  }
}

// POST - Yeni aktivite oluştur
export async function POST(request: NextRequest) {
  try {
    const activityData = await request.json();
    
    // Slug oluştur veya gelen değeri kullan
    const slug = activityData.slug ? 
      await generateUniqueSlug(activityData.slug) : 
      await generateUniqueSlug(activityData.title);
    
    const newActivity = {
      ...activityData,
      slug,
      // Eksik alanları varsayılan değerlerle doldur
      gallery: activityData.gallery || [],
      includedServices: activityData.includedServices || [],
      contactWhatsapp: activityData.contactWhatsapp || '',
      featured: activityData.featured || false,
      content: activityData.content || ''
    };
    
    await saveActivity(newActivity);
    
    return NextResponse.json({ 
      success: true,
      activity: newActivity
    });
    
  } catch (error) {
    console.error('Yeni aktivite oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Aktivite oluşturulamadı' },
      { status: 500 }
    );
  }
}