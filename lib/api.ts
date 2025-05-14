import fs from 'fs';
import { join } from 'path';
import { getAllActivities as getActivitiesFromFile, getActivityBySlug as getActivityDetailFromFile } from './activities';
import { getAllActivitiesFromDB, getActivityBySlugFromDB } from './api-mongodb';

// JSON dosyalarını okuma
export function getJsonData(filePath: string) {
  const fullPath = join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Dosya bulunamadı: ${fullPath}`);
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  try {
    return JSON.parse(fileContents);
  } catch (e) {
    console.error(`Error parsing JSON at ${filePath}:`, e);
    return null;
  }
}

// Homepage verilerini getir
export function getHomepageData() {
  return getJsonData('data/homepage.json');
}

// Tüm aktiviteleri getir - MongoDB'den alma işlemi ekle
export async function getAllActivities() {
  try {
    // NO-STORE özelliği - her istekte yeni veri al
    const cacheHeaders = { cache: 'no-store' };
    
    console.log('getAllActivities: Aktiviteler alınıyor...');
    
    // Her iki kaynaktan da aktiviteleri al ve birleştir
    let mongoActivities: any[] = [];
    let fileActivities: any[] = [];
    
    // MongoDB'den veri al
    try {
      console.log('MongoDB\'den veri alınıyor...');
      mongoActivities = await getAllActivitiesFromDB();
      console.log(`MongoDB'den ${mongoActivities.length} aktivite alındı.`);
    } catch (mongoErr) {
      console.error('MongoDB veri alımında hata:', mongoErr);
    }
    
    // Dosya sisteminden veri al
    try {
      console.log('Dosya sisteminden veri alınıyor...');
      fileActivities = getActivitiesFromFile();
      console.log(`Dosya sisteminden ${fileActivities.length} aktivite alındı.`);
    } catch (fileErr) {
      console.error('Dosya sistemi veri alımında hata:', fileErr);
    }
    
    // İki kaynaktan da veri alınamadıysa boş dizi döndür
    if (!mongoActivities.length && !fileActivities.length) {
      console.warn('Hiçbir kaynaktan veri alınamadı!');
      return [];
    }
    
    // MongoDB verileri önceliklidir, ancak her ikisini de birleştir
    if (mongoActivities.length) {
      console.log('MongoDB verileri kullanılıyor...');
      return mongoActivities;
    } else {
      console.log('Dosya sistemi verileri kullanılıyor...');
      return fileActivities;
    }
    
  } catch (error) {
    console.error('Aktiviteleri alırken genel hata:', error);
    return [];
  }
}

// Slug'a göre aktivite getir - MongoDB'den alma işlemi ekle
export async function getActivityBySlug(slug: string) {
  try {
    console.log(`getActivityBySlug: ${slug} aktivitesi alınıyor...`);
    let activity = null;
    
    // İlk olarak MongoDB'den aktiviteyi almayı dene
    try {
      activity = await getActivityBySlugFromDB(slug);
      if (activity) {
        console.log(`${slug} aktivitesi MongoDB'den alındı.`);
        return activity;
      }
    } catch (mongoErr) {
      console.error(`MongoDB'den ${slug} aktivitesi alınamadı:`, mongoErr);
    }
    
    // MongoDB'den alınamazsa dosya sisteminden oku
    try {
      activity = getActivityDetailFromFile(slug);
      if (activity) {
        console.log(`${slug} aktivitesi dosya sisteminden alındı.`);
        return activity;
      }
    } catch (fileErr) {
      console.error(`Dosya sisteminden ${slug} aktivitesi alınamadı:`, fileErr);
    }
    
    console.warn(`${slug} aktivitesi hiçbir kaynakta bulunamadı!`);
    return null;
    
  } catch (error) {
    console.error(`${slug} aktivitesini alırken genel hata:`, error);
    return null;
  }
}

// Hakkımızda verilerini getir
export function getAboutData() {
  return getJsonData('data/about.json');
}

// İletişim verilerini getir
export function getContactData() {
  return getJsonData('data/contact.json');
}

// Müşteri yorumlarını getir
export function getTestimonials() {
  return getJsonData('data/testimonials.json');
}