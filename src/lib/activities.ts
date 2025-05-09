import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Aktivitelerin yolları
const contentDir = path.join(process.cwd(), 'content', 'activities');
const dataDir = path.join(process.cwd(), 'data', 'activities');

// Markdown aktiviteleri oku
export function getAllMarkdownActivities() {
  // Dizinin var olduğundan emin ol
  if (!fs.existsSync(contentDir)) {
    try {
      fs.mkdirSync(contentDir, { recursive: true });
    } catch (error) {
      console.error('Aktivite dizini oluşturulamadı:', error);
      return [];
    }
  }

  // Dosyaları oku
  const fileNames = fs.readdirSync(contentDir);
  const mdFiles = fileNames.filter(file => file.endsWith('.md'));
  
  const activities = mdFiles.map(fileName => {
    const filePath = path.join(contentDir, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Markdown içeriğini ve frontmatter'ı ayrıştır
    const { data, content } = matter(fileContents);
    
    // Aktivite nesnesini döndür
    return {
      ...data,
      content,
      slug: data.slug || fileName.replace(/\.md$/, '')
    };
  });
  
  return activities;
}

// JSON aktivitelerini oku
export function getAllJsonActivities() {
  // Dizinin var olduğundan emin ol
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (error) {
      console.error('Aktivite dizini oluşturulamadı:', error);
      return [];
    }
  }

  // Dosyaları oku
  const fileNames = fs.readdirSync(dataDir);
  const jsonFiles = fileNames.filter(file => file.endsWith('.json'));
  
  const activities = jsonFiles.map(fileName => {
    const filePath = path.join(dataDir, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    try {
      return JSON.parse(fileContents);
    } catch (e) {
      console.error(`${fileName} dosyası JSON olarak ayrıştırılamadı:`, e);
      return null;
    }
  });
  
  return activities.filter(Boolean);
}

// Markdown aktiviteyi JSON'a dönüştür ve kaydet
export function syncMarkdownToJson(activity: any) {
  // Dizinin var olduğundan emin ol
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // JSON dosyasını oluştur
  const filePath = path.join(dataDir, `${activity.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(activity, null, 2), 'utf8');
  
  return activity;
}

// Tüm markdown aktiviteleri JSON'a senkronize et
export function syncAllActivities() {
  const markdownActivities = getAllMarkdownActivities();
  
  markdownActivities.forEach(activity => {
    syncMarkdownToJson(activity);
  });
  
  return markdownActivities;
}

// Tüm aktiviteleri getir (önce senkronize et)
export function getAllActivities() {
  // Önce senkronize et
  syncAllActivities();
  
  // Sonra JSON dosyalarından oku
  return getAllJsonActivities();
}

// Slug'a göre aktivite getir
export function getActivityBySlug(slug: string) {
  // Önce senkronize et
  syncAllActivities();
  
  // Sonra JSON dosyalarından oku
  const activities = getAllJsonActivities();
  return activities.find(activity => activity.slug === slug);
}