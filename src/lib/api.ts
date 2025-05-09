import fs from 'fs';
import { join } from 'path';
import { getAllActivities as getActivities, getActivityBySlug as getActivityDetail } from './activities';

// JSON dosyalarını okuma
export function getJsonData(filePath: string) {
  const fullPath = join(process.cwd(), filePath);
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

// Tüm aktiviteleri getir
export function getAllActivities() {
  return getActivities();
}

// Slug'a göre aktivite getir
export function getActivityBySlug(slug: string) {
  return getActivityDetail(slug);
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