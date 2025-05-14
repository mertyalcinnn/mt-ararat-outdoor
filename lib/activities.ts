'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Aktivitelerin yolları
const contentDir = path.join(process.cwd(), 'content', 'activities');
const dataDir = path.join(process.cwd(), 'data', 'activities');

// Kök 'activities' dizinindeki aktiviteleri oku
export async function getRootActivities() {
  try {
    const activitiesDir = path.join(process.cwd(), 'activities');
    if (!fs.existsSync(activitiesDir)) {
      console.log(`'activities' kök dizini bulunamadı!`);
      return [];
    }

    console.log(`Kök 'activities' dizininden aktiviteler okunuyor...`);
    
    // Dosyaları oku
    const fileNames = fs.readdirSync(activitiesDir);
    const jsonFiles = fileNames.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log(`Kök 'activities' dizininde JSON dosyası bulunamadı`);
      return [];
    }
    
    console.log(`Kök dizinden ${jsonFiles.length} JSON aktivite dosyası bulundu.`);
    
    const activities = jsonFiles.map(fileName => {
      try {
        const filePath = path.join(activitiesDir, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        const data = JSON.parse(fileContents);
        return data;
      } catch (error) {
        console.error(`${fileName} dosyası JSON olarak ayrıştırılamadı:`, error);
        return null;
      }
    });
    
    const validActivities = activities.filter(Boolean);
    console.log(`Kök 'activities' dizininden ${validActivities.length} geçerli JSON aktivite bulundu.`);
    return validActivities;
  } catch (error) {
    console.error(`'activities' kök dizininden aktiviteler okunurken hata:`, error);
    return [];
  }
}

// Markdown aktiviteleri oku
export async function getAllMarkdownActivities() {
  try {
    // Dizinin var olduğundan emin ol
    if (!fs.existsSync(contentDir)) {
      try {
        fs.mkdirSync(contentDir, { recursive: true });
        console.log('Markdown aktiviteleri dizini oluşturuldu:', contentDir);
      } catch (error) {
        console.error('Aktivite dizini oluşturulamadı:', error);
        return [];
      }
    }

    // Dosyaları oku
    const fileNames = fs.readdirSync(contentDir);
    const mdFiles = fileNames.filter(file => file.endsWith('.md'));
    
    if (mdFiles.length === 0) {
      console.log('Hiç markdown aktivite dosyası bulunamadı.');
      return [];
    }
    
    const activities = mdFiles.map(fileName => {
      try {
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
      } catch (error) {
        console.error(`${fileName} dosyası okunurken hata:`, error);
        return null;
      }
    });
    
    return activities.filter(Boolean);
  } catch (error) {
    console.error('Markdown aktiviteleri okunurken genel hata:', error);
    return [];
  }
}

// JSON aktivitelerini oku
export async function getAllJsonActivities() {
  try {
    // Dizinin var olduğundan emin ol
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('JSON aktiviteleri dizini oluşturuldu:', dataDir);
      } catch (error) {
        console.error('Aktivite dizini oluşturulamadı:', error);
        return [];
      }
    }

    // 'activities' dizini var mı kontrol et
    const activitiesDir = path.join(process.cwd(), 'activities');
    if (fs.existsSync(activitiesDir)) {
      console.log(`'activities' dizininden JSON dosyaları da kontrol ediliyor...`);
      try {
        const rootFileNames = fs.readdirSync(activitiesDir);
        const rootJsonFiles = rootFileNames.filter(file => file.endsWith('.json'));
        if (rootJsonFiles.length > 0) {
          console.log(`'activities' dizininde ${rootJsonFiles.length} JSON aktivite bulundu.`);
        }
      } catch (rootError) {
        console.error(`'activities' dizini okunamadı:`, rootError);
      }
    }

    // Dosyaları oku
    const fileNames = fs.readdirSync(dataDir);
    const jsonFiles = fileNames.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('Hiç JSON aktivite dosyası bulunamadı.');
      return [];
    }
    
    console.log(`${jsonFiles.length} JSON aktivite dosyası bulundu.`);
    
    const activities = jsonFiles.map(fileName => {
      try {
        const filePath = path.join(dataDir, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        const data = JSON.parse(fileContents);
        return data;
      } catch (error) {
        console.error(`${fileName} dosyası JSON olarak ayrıştırılamadı:`, error);
        return null;
      }
    });
    
    const validActivities = activities.filter(Boolean);
    console.log(`${validActivities.length} geçerli JSON aktivite bulundu.`);
    return validActivities;
  } catch (error) {
    console.error('JSON aktiviteleri okunurken genel hata:', error);
    return [];
  }
}

// Aktiviteyi JSON'a dönüştür ve kaydet
export async function syncActivityToJson(activity: any) {
  try {
    // Dizinin var olduğundan emin ol
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('JSON aktiviteleri dizini oluşturuldu:', dataDir);
      } catch (dirError) {
        console.error('Aktivite dizini oluşturulamadı:', dirError);
        return null;
      }
    }
    
    // Slug kontrolü
    if (!activity || !activity.slug) {
      console.error('Aktivitenin slug değeri yok, kaydedilemez:', activity);
      return null;
    }
    
    // JS nesnesini JSON'a dönüştürmeyi dene (hatalar için)
    try {
      const jsonStr = JSON.stringify(activity, null, 2);
      if (!jsonStr) {
        throw new Error('JSON dönüştürme başarısız oldu');
      }
      
      // JSON dosyasını oluştur
      const filePath = path.join(dataDir, `${activity.slug}.json`);
      fs.writeFileSync(filePath, jsonStr, 'utf8');
      
      // Dosyanın var olduğunu kontrol et
      if (!fs.existsSync(filePath)) {
        throw new Error(`Dosya yazıldı ama oluşturulmadı: ${filePath}`);
      }
      
      console.log(`Aktivite '${activity.slug}' başarıyla JSON dosyasına yazıldı: ${filePath}`);
      return activity;
    } catch (jsonError) {
      console.error('JSON dönüştürme veya yazma hatası:', jsonError);
      throw jsonError;
    }
  } catch (error) {
    console.error('Aktivite JSON dosyasına yazılırken genel hata:', error);
    throw error;
  }
}

// Aktivite JSON dosyasını sil
export async function deleteActivityJson(slug: string) {
  try {
    if (!slug) {
      console.error('Silinecek aktivitenin slug değeri belirtilmemiş!');
      return false;
    }
    
    const filePath = path.join(dataDir, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`${slug}.json dosyası silindi.`);
      return true;
    } else {
      console.log(`${slug}.json dosyası bulunamadı.`);
      return false;
    }
  } catch (error) {
    console.error(`Aktivite JSON dosyası silinirken hata: ${slug}`, error);
    return false;
  }
}

// Tüm markdown aktiviteleri JSON'a senkronize et
export async function syncAllActivities() {
  try {
    console.log('syncAllActivities: Tüm aktiviteler senkronize ediliyor...');
    const markdownActivities = getAllMarkdownActivities();
    
    if (markdownActivities.length === 0) {
      console.log('Senkronize edilecek markdown aktivite bulunamadı.');
    } else {
      console.log(`${markdownActivities.length} markdown aktivite JSON'a senkronize ediliyor...`);
      
      let successCount = 0;
      markdownActivities.forEach(activity => {
        if (syncActivityToJson(activity)) {
          successCount++;
        }
      });
      
      console.log(`${successCount}/${markdownActivities.length} aktivite başarıyla senkronize edildi.`);
    }
    
    return markdownActivities;
  } catch (error) {
    console.error('Aktivitelerin senkronizasyonunda genel hata:', error);
    return [];
  }
}

// Tüm aktiviteleri getir
export async function getAllActivities() {
  try {
    console.log('activities.ts: getAllActivities fonksiyonu çağrılıyor...');
    
    // Önce kök activities dizininden okumayı dene
    try {
      console.log('Kök activities dizininden JSON aktiviteler okunuyor...');
      const rootActivities = getRootActivities();
      if (rootActivities && rootActivities.length > 0) {
        console.log(`Kök dizinden ${rootActivities.length} aktivite başarıyla okundu.`);
        return rootActivities;
      }
    } catch (rootError) {
      console.error('Kök activities dizini okuma hatası:', rootError);
    }
    
    // Sonra data/activities dizininden oku
    try {
      console.log('data/activities dizininden JSON aktiviteler okunuyor...');
      const activities = getAllJsonActivities();
      
      // Dizi kontrolü
      if (!Array.isArray(activities)) {
        console.error('getAllJsonActivities bir dizi döndürmedi:', activities);
        return [];
      }
      
      console.log(`data/activities dizininden ${activities.length} aktivite okundu`);
      return activities;
    } catch (readError) {
      console.error('JSON aktiviteleri okuma hatası:', readError);
      return [];
    }
  } catch (error) {
    console.error('getAllActivities fonksiyonunda genel hata:', error);
    return [];
  }
}

// Slug'a göre aktivite getir
export async function getActivityBySlug(slug: string) {
  try {
    console.log(`activities.ts: getActivityBySlug("${slug}") fonksiyonu çağrılıyor...`);
    
    if (!slug) {
      console.error('Alınacak aktivitenin slug değeri belirtilmemiş!');
      return null;
    }
    
    // JSON dosyalarından oku
    const activities = getAllJsonActivities();
    const activity = activities.find(activity => activity.slug === slug);
    
    if (activity) {
      console.log(`${slug} aktivitesi JSON dosyasından başarıyla alındı.`);
    } else {
      console.log(`${slug} aktivitesi JSON dosyaları arasında bulunamadı.`);
    }
    
    return activity;
  } catch (error) {
    console.error(`${slug} aktivitesini alırken hata:`, error);
    return null;
  }
}