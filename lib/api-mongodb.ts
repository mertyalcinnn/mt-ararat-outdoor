import { MongoClient, Db, Collection, Document } from 'mongodb';

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'mt-ararat-outdoor';

// Bağlantı nesnesini önbelleğe alın (geliştirme ortamında sık hot-reload'lar için)
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI tanımlanmamış. Lütfen .env.local dosyasını kontrol edin.');
}

// MongoDB'ye bağlanma
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Önbellekteki bağlantıyı kullan
  if (cachedClient && cachedDb) {
    console.log('MongoDB önbellek bağlantısı kullanılıyor.');
    return { client: cachedClient, db: cachedDb };
  }

  // Yeni bağlantı oluştur
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    const client = new MongoClient(MONGODB_URI!);
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    // Bağlantıyı önbelleğe al
    cachedClient = client;
    cachedDb = db;
    
    console.log('MongoDB bağlantısı başarılı!');
    return { client, db };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw new Error(`MongoDB bağlantı hatası: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Generic arama fonksiyonu
export async function find<T extends Document>(
  collection: string,
  query = {},
  options = {}
): Promise<T[]> {
  try {
    const { db } = await connectToDatabase();
    return await db.collection<T>(collection).find(query, options).toArray();
  } catch (error) {
    console.error(`MongoDB ${collection} sorgu hatası:`, error);
    return [];
  }
}

// Tek bir döküman bul
export async function findOne<T extends Document>(
  collection: string,
  query = {}
): Promise<T | null> {
  try {
    const { db } = await connectToDatabase();
    return await db.collection<T>(collection).findOne(query);
  } catch (error) {
    console.error(`MongoDB ${collection} tek döküman sorgu hatası:`, error);
    return null;
  }
}

// Ekle veya güncelle
export async function updateOne<T extends Document>(
  collection: string,
  filter: object,
  document: T,
  options = { upsert: true }
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection<T>(collection).updateOne(filter, { $set: document }, options);
    return result.acknowledged;
  } catch (error) {
    console.error(`MongoDB ${collection} güncelleme hatası:`, error);
    return false;
  }
}

// Döküman sil
export async function deleteOne(
  collection: string,
  filter: object
): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection(collection).deleteOne(filter);
    return result.acknowledged && result.deletedCount > 0;
  } catch (error) {
    console.error(`MongoDB ${collection} silme hatası:`, error);
    return false;
  }
}

// MongoDB'den aktiviteleri getir
export async function getAllActivitiesFromDB() {
  try {
    console.log('MongoDB\'den tüm aktiviteler alınıyor...');
    return await find('activities');
  } catch (error) {
    console.error('MongoDB\'den aktiviteler alınamadı:', error);
    return [];
  }
}

// MongoDB'den slug'a göre aktivite getir
export async function getActivityBySlugFromDB(slug: string) {
  try {
    console.log(`MongoDB\'den ${slug} aktivitesi alınıyor...`);
    return await findOne('activities', { slug });
  } catch (error) {
    console.error(`MongoDB\'den ${slug} aktivitesi alınamadı:`, error);
    return null;
  }
}

// MongoDB'den hakkımızda verilerini getir
export async function getAboutData() {
  try {
    console.log('MongoDB\'den hakkımızda verileri alınıyor...');
    const aboutData = await findOne('about', {});
    if (aboutData) {
      console.log('MongoDB\'den hakkımızda verileri alındı.');
      return aboutData;
    } else {
      console.warn('MongoDB\'de hakkımızda verisi bulunamadı, JSON dosyasına geri dönülüyor.');
      // JSON dosyasından veri alma işlemi
      const fs = require('fs');
      const path = require('path');
      const aboutJsonPath = path.join(process.cwd(), 'about.json');
      
      if (fs.existsSync(aboutJsonPath)) {
        return JSON.parse(fs.readFileSync(aboutJsonPath, 'utf8'));
      } else {
        console.error('about.json dosyası bulunamadı!');
        return null;
      }
    }
  } catch (error) {
    console.error('MongoDB\'den hakkımızda verileri alınamadı:', error);
    // Hata durumunda fallback olarak JSON dosyasından veri almayı dene
    try {
      const fs = require('fs');
      const path = require('path');
      const aboutJsonPath = path.join(process.cwd(), 'about.json');
      
      if (fs.existsSync(aboutJsonPath)) {
        console.log('Hata sonrası JSON dosyasından hakkımızda verileri alınıyor...');
        return JSON.parse(fs.readFileSync(aboutJsonPath, 'utf8'));
      }
    } catch (jsonError) {
      console.error('JSON dosyasından hakkımızda verileri alınamadı:', jsonError);
    }
    
    return null;
  }
}
