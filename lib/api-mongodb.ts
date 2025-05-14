'use server';

import { MongoClient, Db, Collection, Document, WithId } from 'mongodb';

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || 'mt-ararat-outdoor';

// Bağlantı nesnesini önbelleğe alın (geliştirme ortamında sık hot-reload'lar için)
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// MONGODB_URI olmasa bile hatayı göğüsle ve devam et
if (!MONGODB_URI) {
  console.warn('MongoDB URI tanımlanmamış. Lütfen .env.local dosyasını kontrol edin.');
}

// MongoDB'ye bağlanma
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Önbellekteki bağlantıyı kullan
  if (cachedClient && cachedDb) {
    console.log('MongoDB önbellek bağlantısı kullanılıyor.');
    return { client: cachedClient, db: cachedDb };
  }

  // MONGODB_URI kontrolü
  if (!MONGODB_URI) {
    console.error('MongoDB URI tanımlanmamış. Varsayılan DB kullanılacak.');
    // Boş başarısız bağlantı döndür
    return { client: null as any, db: null as any };
  }

  // Yeni bağlantı oluştur
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    const client = new MongoClient(MONGODB_URI!);
    
    // 5 saniye timeout ile bağlantı kur
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('MongoDB bağlantı zaman aşımı')), 5000);
    });
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    const db = client.db(MONGODB_DB);
    
    // Basit kontrol yap - db erişilebilir mi
    await db.command({ ping: 1 });
    
    // Bağlantıyı önbelleğe al
    cachedClient = client;
    cachedDb = db;
    
    console.log('MongoDB bağlantısı başarılı!');
    return { client, db };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    // Hata durumunda boş nesneler döndür, böylece uygulama çökmez
    cachedClient = null;
    cachedDb = null;
    return { client: null as any, db: null as any };
  }
}

// Generic arama fonksiyonu
export async function find<T extends Document>(
  collection: string,
  query = {},
  options = {}
): Promise<WithId<T>[]> {
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
): Promise<WithId<T> | null> {
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
    
    // GEÇİCİ ÇÖZÜM: MongoDB'yi atlayıp direkt boş dizi döndür
    // Sebebi: MongoDB ile ilgili olası sorunları bypass etmek
    console.warn('MongoDB atlanıyor. 500 hatası tespit için boş dizi döndürülüyor');
    return [];
    
    /* MongoDB kodunu devre dışı bırakıyoruz
    const { db } = await connectToDatabase();
    
    // db nesnesi null ise, bağlantı başarısız olmuş demektir
    if (!db) {
      console.warn('MongoDB bağlantısı kurulamadı, boş dizi döndürülüyor');
      return [];
    }
    
    // Boş koleksiyon oluşturma sorgusu
    try {
      const collections = await db.listCollections({ name: 'activities' }).toArray();
      if (collections.length === 0) {
        console.log('activities koleksiyonu bulunamadı, oluşturuluyor...');
        await db.createCollection('activities');
      }
    } catch (collErr) {
      console.error('Koleksiyon kontrolu sırasında hata:', collErr);
    }
    
    const activities = await find('activities');
    // _id alanını JSON serileştirmede sorun yaratmaması için temizle
    return activities.map(activity => {
      const { _id, ...rest } = activity;
      return rest;
    });
    */
  } catch (error) {
    console.error('MongoDB\'den aktiviteler alınamadı:', error);
    return [];
  }
}

// MongoDB'den slug'a göre aktivite getir
export async function getActivityBySlugFromDB(slug: string) {
  try {
    console.log(`MongoDB\'den ${slug} aktivitesi alınıyor...`);
    const activity = await findOne('activities', { slug });
    
    if (activity) {
      // _id alanını JSON serileştirmede sorun yaratmaması için temizle
      const { _id, ...rest } = activity;
      return rest;
    }
    
    return null;
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
