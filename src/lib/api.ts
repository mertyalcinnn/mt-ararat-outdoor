import fs from 'fs';
import { join } from 'path';

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
  const activitiesDirectory = join(process.cwd(), 'data/activities');
  const filenames = fs.readdirSync(activitiesDirectory);
  
  const activities = filenames.map(filename => {
    const filePath = join(activitiesDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    try {
      return JSON.parse(fileContents);
    } catch (e) {
      console.error(`Error parsing JSON at ${filePath}:`, e);
      return null;
    }
  });
  
  return activities.filter(Boolean);
}

// Slug'a göre aktivite getir
export function getActivityBySlug(slug: string) {
  const activities = getAllActivities();
  return activities.find(activity => activity.slug === slug);
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