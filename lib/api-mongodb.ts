'use server';

import { MongoClient, Db, Collection, Document, WithId } from 'mongodb';

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || 'mt-ararat-outdoor';

// Bağlantı nesnesi önbelleğe alın (geliştirme ortamında sık hot-reload'lar için)
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// MongoDB bağlantıyı atlamak için bayrak
const SKIP_MONGODB = process.env.SKIP_MONGODB === 'true';

// MongoDB'ye bağlanma - zaman aşımı kontrolü ile
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // MongoDB'yi atla
  if (SKIP_MONGODB) {
    console.log('SKIP_MONGODB=true olduğu için MongoDB bağlantısı atlanıyor');
    throw new Error('MongoDB connection skipped by configuration');
  }
  
  // Önbellekteki bağlantıyı kullan
  if (cachedClient && cachedDb) {
    console.log('MongoDB önbellek bağlantısı kullanılıyor.');
    return { client: cachedClient, db: cachedDb };
  }

  // MONGODB_URI kontrolü
  if (!MONGODB_URI) {
    console.error('MongoDB URI tanımlanmamış.');
    throw new Error('MongoDB URI missing');
  }

  try {
    // Daha kısa bir zaman aşımı kullan - 3 saniye (daha önce 5 idi)
    const timeoutMs = 3000;
    
    console.log(`MongoDB bağlantısı kuruluyor (${timeoutMs}ms timeout)...`);
    
    // Promise oluştur ve race ile zaman aşımı kontrolü yap
    const client = new MongoClient(MONGODB_URI!);
    
    const connectPromise = client.connect();
    const timeoutPromise = new Promise<MongoClient>((_, reject) => {
      setTimeout(() => reject(new Error('MongoDB bağlantı zaman aşımı')), timeoutMs);
    });
    
    // Hangisi önce tamamlanırsa (ya bağlantı ya da zaman aşımı)
    const connectedClient = await Promise.race([connectPromise, timeoutPromise]);
    
    // Zaman aşımı olmadan bağlantı başarılı olduysa, db'ye erişmeyi dene
    const db = client.db(MONGODB_DB);
    
    // Basit bir ping komutu ile bağlantıyı test et
    await db.command({ ping: 1 });
    
    // Bağlantı başarılı, önbelleğe al
    cachedClient = client;
    cachedDb = db;
    
    console.log('MongoDB bağlantısı başarılı!');
    return { client, db };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    // Bağlantı başarısız, önbelleği temizle
    cachedClient = null;
    cachedDb = null;
    throw error; // Hatayı yukarı fırlat
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
    
    // db null kontrolü
    if (!db) {
      console.error(`MongoDB ${collection} collection erişimi başarısız - db null`);
      return [];
    }
    
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
    
    // db null kontrolü
    if (!db) {
      console.error(`MongoDB ${collection} collection erişimi başarısız - db null`);
      return null;
    }
    
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
  'use server';
  
  try {
    console.log('MongoDB\'den hakkımızda verileri alınıyor...');
    
    // MongoDB bağlantısını kontrol et - zaman aşımı için Promise.race kullan
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('getAboutData zaman aşımı')), 2000);
    });
    
    try {
      // Hızlı zaman aşımı için race kullan
      const aboutDataPromise = findOne('about', {});
      const result = await Promise.race([aboutDataPromise, timeoutPromise]);
      
      if (result) {
        console.log('MongoDB\'den hakkımızda verileri alındı.');
        // _id alanını JSON serileştirmede sorun yaratmaması için temizle
        const { _id, ...cleanData } = result;
        return cleanData;
      } else {
        console.warn('MongoDB\'de hakkımızda verisi bulunamadı, JSON dosyasına geri dönülüyor.');
        return null;
      }
    } catch (findError) {
      console.error('MongoDB about sorgusu başarısız:', findError);
      return null;
    }
  } catch (error) {
    console.error('MongoDB\'den hakkımızda verileri alınamadı:', error);
    return null;
  }
}
