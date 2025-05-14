'use server';

import fs from 'fs';
import { join } from 'path';
import { getAllActivities as getActivitiesFromFile, getActivityBySlug as getActivityDetailFromFile } from './activities';
import { getAllActivitiesFromDB, getActivityBySlugFromDB } from './api-mongodb';

// JSON dosyalarını okuma
export async function getJsonData(filePath: string) {
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
export async function getHomepageData() {
  return await getJsonData('data/homepage.json');
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
      // Hata durumunda boş dizi kullan
      mongoActivities = [];
    }
    
    // Dosya sisteminden veri al
    try {
      console.log('Dosya sisteminden veri alınıyor...');
      fileActivities = await getActivitiesFromFile();
      console.log(`Dosya sisteminden ${fileActivities.length} aktivite alındı.`);
    } catch (fileErr) {
      console.error('Dosya sistemi veri alımında hata:', fileErr);
      // Hata durumunda boş dizi kullan
      fileActivities = [];
    }
    
    // Üç farklı durum için farklı davranış
    // 1. Her iki kaynaktan da veri alabildiysek, MongoDB verileri öncelikli
    if (mongoActivities.length > 0) {
      console.log('MongoDB verileri kullanılıyor...');
      return mongoActivities;
    } 
    // 2. Sadece dosya sisteminden veri alabildiysek
    else if (fileActivities.length > 0) {
      console.log('Dosya sistemi verileri kullanılıyor...');
      return fileActivities;
    }
    // 3. Hiçbir yerden veri alamadıysak - varsayılan boş veri döndür
    else {
      console.warn('Hiçbir kaynaktan veri alınamadı! Varsayılan boş aktivite listesi döndürülüyor.');
      return [];
    }
    
  } catch (error) {
    console.error('Aktiviteleri alırken genel hata:', error);
    // Genel hata durumunda boş dizi döndür
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
      activity = await getActivityDetailFromFile(slug);
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
export async function getAboutData() {
  return await getJsonData('data/about.json');
}

// İletişim verilerini getir
export async function getContactData() {
  return await getJsonData('data/contact.json');
}

// Müşteri yorumlarını getir
export async function getTestimonials() {
  return await getJsonData('data/testimonials.json');
}