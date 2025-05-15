'use server';

import fs from 'fs';
import { join } from 'path';
import { Activity } from './types';
import { getAllActivities as getActivitiesFromFile, getActivityBySlug as getActivityDetailFromFile } from './activities';
import { getAllActivitiesFromDB, getActivityBySlugFromDB } from './api-mongodb';

// JSON dosyalarını okuma
export async function getJsonData(filePath: string) {
  'use server';
  
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
  'use server';
  
  return await getJsonData('data/homepage.json');
}

// Tüm aktiviteleri getir - MongoDB'den alma işlemi ekle
export async function getAllActivities(): Promise<Activity[]> {
  try {
    // MongoDB'den veri al
    const mongoActivities = await getAllActivitiesFromDB();
    if (mongoActivities && mongoActivities.length > 0) {
      return mongoActivities;
    }

    // Dosya sisteminden veri al
    const fileActivities = await getActivitiesFromFile();
    if (fileActivities && fileActivities.length > 0) {
      return fileActivities;
    }

    // Varsayılan aktiviteleri kullan (boş dizi)
    return [];
  } catch (error) {
    console.error('Aktiviteler alınırken hata:', error);
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
  'use server';
  
  try {
    console.log('getAboutData: Hakkımızda verileri alınıyor...');
    
    // ÖNEMLİ: İlk önce MongoDB'den almayı dene (getAboutData), hata varsa JSON dosyasına geri dön
    try {
      const { getAboutData: getAboutDataFromDB } = await import('./api-mongodb');
      const mongoData = await getAboutDataFromDB();
      
      if (mongoData) {
        console.log('MongoDB\'den hakkımızda verileri başarıyla alındı.');
        return mongoData;
      } else {
        console.log('MongoDB\'den veri alınamadı, JSON dosyasına geçiliyor...');
      }
    } catch (mongoError) {
      console.error('MongoDB hakkımızda verileri alınamadı:', mongoError);
      console.log('JSON dosyasına geri dönülüyor...');
    }
    
    // JSON dosyasından oku
    console.log('JSON dosyasından hakkımızda verileri okunuyor...');
    const jsonData = await getJsonData('data/about.json');
    
    if (jsonData) {
      console.log('JSON dosyasından hakkımızda verileri başarıyla alındı.');
      return jsonData;
    }
    
    // Varsayılan veri - son çare
    console.warn('Hiçbir kaynaktan hakkımızda verisi alınamadı! Varsayılan veri döndürülüyor.');
    return {
      title: "Hakkımızda",
      content: "Mt.Ararat Outdoor Adventures, Türkiye'nin en yüksek dağı olan Ağrı Dağı ve çevresinde profesyonel outdoor aktiviteleri sunan bir ekiptir.",
      teamMembers: []
    };
  } catch (error) {
    console.error('getAboutData genel hata:', error);
    // Varsayılan veri döndür
    return {
      title: "Hakkımızda",
      content: "Mt.Ararat Outdoor Adventures, Türkiye'nin en yüksek dağı olan Ağrı Dağı ve çevresinde profesyonel outdoor aktiviteleri sunan bir ekiptir.",
      teamMembers: []
    };
  }
}

// İletişim verilerini getir
export async function getContactData() {
  'use server';
  
  try {
    console.log('getContactData: İletişim verileri alınıyor...');
    
    // JSON dosyasından oku
    console.log('JSON dosyasından iletişim verileri okunuyor...');
    const jsonData = await getJsonData('data/contact.json');
    
    if (jsonData) {
      console.log('JSON dosyasından iletişim verileri başarıyla alındı.');
      return jsonData;
    }
    
    // Varsayılan veri - son çare
    console.warn('Hiçbir kaynaktan iletişim verisi alınamadı! Varsayılan veri döndürülüyor.');
    return {
      title: "İletişim",
      address: "Ağrı Dağı Etekleri, Doğubayazıt, Ağrı, Türkiye",
      email: "info@mtararatoutdoor.com",
      phone: "+90 555 123 4567",
      content: "Bize ulaşın"
    };
  } catch (error) {
    console.error('getContactData genel hata:', error);
    // Varsayılan veri döndür
    return {
      title: "İletişim",
      address: "Ağrı Dağı Etekleri, Doğubayazıt, Ağrı, Türkiye",
      email: "info@mtararatoutdoor.com",
      phone: "+90 555 123 4567",
      content: "Bize ulaşın"
    };
  }
}

// Müşteri yorumlarını getir
export async function getTestimonials() {
  'use server';
  
  return await getJsonData('data/testimonials.json');
}