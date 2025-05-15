import { MongoClient, Db, Collection } from 'mongodb';

// MongoDB URI kontrolü
let uri = '';
try {
  uri = process.env.MONGODB_URI || '';
  if (!uri) {
    console.warn('MONGODB_URI çevresel değişkeni ayarlanmadı, veritabanı işlemleri dosya sistem üzerinden yapılacak');
  } else {
    console.log('MongoDB URI bulundu, bağlantı kurulacak');
  }
} catch (error) {
  console.error('MONGODB_URI erişiminde hata:', error);
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Bağlantı başarısız olursa bile Promise döndüren fonksiyon
function createClientPromise() {
  try {
    if (!uri || uri.includes('sunucu.mongodb.net')) {
      console.warn('Geçerli bir MongoDB URI yok, dummy bir promise oluşturuluyor');
      client = new MongoClient('mongodb://localhost:27017', options);
      return Promise.resolve(client);
    }
    
    client = new MongoClient(uri, options);
    return client.connect().catch(err => {
      console.error('MongoDB bağlantı hatası, dosya sistemi geri dönüşüne geçiliyor:', err);
      return client;
    });
  } catch (error) {
    console.error('MongoDB client oluşturulurken hata:', error);
    client = new MongoClient('mongodb://localhost:27017', options);
    return Promise.resolve(client);
  }
}

// Geliştirme modunda global değişken kullanımı
if (process.env.NODE_ENV === 'development') {
  try {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = createClientPromise();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } catch (error) {
    console.error('MongoDB global değişken oluşturulurken hata:', error);
    clientPromise = createClientPromise();
  }
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createClientPromise();
}

// Helper function to get database instance
export async function getDb(): Promise<Db | null> {
  try {
    if (!uri || uri.includes('sunucu.mongodb.net')) {
      console.warn('Geçerli bir MongoDB URI yok, null döndürülüyor');
      return null;
    }
    
    const client = await clientPromise.catch(err => {
      console.error('MongoDB client alınamadı:', err);
      return null;
    });
    
    if (!client) return null;
    
    return client.db(process.env.MONGODB_DB || 'mt-ararat-outdoor');
  } catch (error) {
    console.error('MongoDB veritabanı bağlantısı kurulamadı:', error);
    return null;
  }
}

// Helper function to get collection
export async function getCollection(collectionName: string): Promise<Collection | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    
    return db.collection(collectionName);
  } catch (error) {
    console.error(`MongoDB koleksiyon alınırken hata: ${collectionName}`, error);
    return null;
  }
}

// Helper function to find one document
export async function findOne(collectionName: string, query: any) {
  try {
    const collection = await getCollection(collectionName);
    if (!collection) {
      console.warn(`MongoDB koleksiyonu yok: ${collectionName}, dosya sistemine geçiliyor`);
      return findOneFromFileSystem(collectionName, query);
    }
    
    try {
      return await collection.findOne(query);
    } catch (dbError) {
      console.error(`MongoDB find işlemi sırasında hata:`, dbError);
      return findOneFromFileSystem(collectionName, query);
    }
  } catch (error) {
    console.error(`MongoDB findOne hatası (${collectionName}):`, error);
    return findOneFromFileSystem(collectionName, query);
  }
}

// Helper function to find many documents
export async function find(collectionName: string, query: any = {}) {
  try {
    const collection = await getCollection(collectionName);
    if (!collection) {
      console.warn(`MongoDB koleksiyonu yok: ${collectionName}, dosya sistemine geçiliyor`);
      return findFromFileSystem(collectionName, query);
    }
    
    try {
      const results = await collection.find(query).toArray();
      return results;
    } catch (dbError) {
      console.error(`MongoDB find işlemi sırasında hata:`, dbError);
      return findFromFileSystem(collectionName, query);
    }
  } catch (error) {
    console.error(`MongoDB find hatası (${collectionName}):`, error);
    return findFromFileSystem(collectionName, query);
  }
}

// Helper function to update one document
export async function updateOne(collectionName: string, query: any, update: any, upsert = true) {
  try {
    const collection = await getCollection(collectionName);
    if (!collection) {
      console.warn(`MongoDB koleksiyonu yok: ${collectionName}, dosya sistemine geçiliyor`);
      return updateOneInFileSystem(collectionName, query, update, upsert);
    }
    
    try {
      const result = await collection.updateOne(query, { $set: update }, { upsert });
      return result;
    } catch (dbError) {
      console.error(`MongoDB updateOne işlemi sırasında hata:`, dbError);
      return updateOneInFileSystem(collectionName, query, update, upsert);
    }
  } catch (error) {
    console.error(`MongoDB updateOne hatası (${collectionName}):`, error);
    return updateOneInFileSystem(collectionName, query, update, upsert);
  }
}

// Helper function to insert one document
export async function insertOne(collectionName: string, document: any) {
  try {
    const collection = await getCollection(collectionName);
    if (!collection) {
      console.warn(`MongoDB koleksiyonu yok: ${collectionName}, dosya sistemine geçiliyor`);
      return insertOneToFileSystem(collectionName, document);
    }
    
    try {
      return await collection.insertOne(document);
    } catch (dbError) {
      console.error(`MongoDB insertOne işlemi sırasında hata:`, dbError);
      return insertOneToFileSystem(collectionName, document);
    }
  } catch (error) {
    console.error(`MongoDB insertOne hatası (${collectionName}):`, error);
    return insertOneToFileSystem(collectionName, document);
  }
}

// Helper function to delete one document
export async function deleteOne(collectionName: string, query: any) {
  try {
    const collection = await getCollection(collectionName);
    if (!collection) {
      console.warn(`MongoDB koleksiyonu yok: ${collectionName}, dosya sistemine geçiliyor`);
      return deleteOneFromFileSystem(collectionName, query);
    }
    
    try {
      const result = await collection.deleteOne(query);
      return result;
    } catch (dbError) {
      console.error(`MongoDB deleteOne işlemi sırasında hata:`, dbError);
      return deleteOneFromFileSystem(collectionName, query);
    }
  } catch (error) {
    console.error(`MongoDB deleteOne hatası (${collectionName}):`, error);
    return deleteOneFromFileSystem(collectionName, query);
  }
}

// ==== DOSYA SİSTEMİ GERI DÖNÜŞ FONKSİYONLARI ====

// Dosya sisteminden tek bir aktiviteyi bul
async function findOneFromFileSystem(collectionName: string, query: any) {
  console.log(`Dosya sisteminden bul: ${collectionName}`, query);
  
  if (collectionName === 'activities' && query && query.slug) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Dizinin var olduğundan emin ol
      const dataDir = path.join(process.cwd(), 'data');
      const activitiesDir = path.join(dataDir, 'activities');
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      if (!fs.existsSync(activitiesDir)) {
        fs.mkdirSync(activitiesDir, { recursive: true });
      }
      
      const filePath = path.join(activitiesDir, `${query.slug}.json`);
      
      // Dosya var mı kontrol et
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent);
      }
      
      // Kök dizindeki activities.json'dan kontrol et
      const rootActivitiesPath = path.join(process.cwd(), 'activities.json');
      if (fs.existsSync(rootActivitiesPath)) {
        const rootActivities = JSON.parse(fs.readFileSync(rootActivitiesPath, 'utf8'));
        const activity = rootActivities.find((a: any) => a.slug === query.slug);
        
        if (activity) {
          // Bulunan aktiviteyi data/activities dizinine kaydet
          fs.writeFileSync(filePath, JSON.stringify(activity, null, 2), 'utf8');
          return activity;
        }
      }
    } catch (error) {
      console.error('Dosya sisteminden aktivite arama hatası:', error);
    }
  }
  
  return null;
}

// Dosya sisteminden çoklu doküman bul
async function findFromFileSystem(collectionName: string, query: any = {}) {
  console.log(`Dosya sisteminden çoklu bul: ${collectionName}`);
  
  if (collectionName === 'activities') {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Dizinin var olduğundan emin ol
      const dataDir = path.join(process.cwd(), 'data');
      const activitiesDir = path.join(dataDir, 'activities');
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      if (!fs.existsSync(activitiesDir)) {
        fs.mkdirSync(activitiesDir, { recursive: true });
      }
      
      // Önce data/activities dizinini kontrol et
      if (fs.existsSync(activitiesDir)) {
        const files = fs.readdirSync(activitiesDir);
        const jsonFiles = files.filter((file: string) => file.endsWith('.json'));
        
        if (jsonFiles.length > 0) {
          const activities = [];
          
          for (const file of jsonFiles) {
            try {
              const filePath = path.join(activitiesDir, file);
              const fileContent = fs.readFileSync(filePath, 'utf8');
              activities.push(JSON.parse(fileContent));
            } catch (fileError) {
              console.error(`${file} dosyası okunamadı:`, fileError);
            }
          }
          
          return activities;
        }
      }
      
      // Dosya bulunamadıysa kök dizindeki activities.json'ı kontrol et
      const rootActivitiesPath = path.join(process.cwd(), 'activities.json');
      if (fs.existsSync(rootActivitiesPath)) {
        const rootActivities = JSON.parse(fs.readFileSync(rootActivitiesPath, 'utf8'));
        
        // Bu aktiviteleri data/activities dizinine kaydet
        if (!fs.existsSync(activitiesDir)) {
          fs.mkdirSync(activitiesDir, { recursive: true });
        }
        
        for (const activity of rootActivities) {
          if (activity && activity.slug) {
            const filePath = path.join(activitiesDir, `${activity.slug}.json`);
            fs.writeFileSync(filePath, JSON.stringify(activity, null, 2), 'utf8');
          }
        }
        
        return rootActivities;
      }
      
      // Fallback olarak varsayılan örnek aktiviteler
      return [
        {
          title: "Örnek Aktivite",
          slug: "ornek-aktivite",
          description: "Bu bir örnek aktivitedir. MongoDB veya dosya sisteminden veri bulunamadı.",
          content: "# Örnek Aktivite\n\nBu bir örnek aktivitedir. Gerçek veriler yüklenemedi.",
          coverImage: "/images/placeholder.jpg",
          gallery: ["/images/placeholder.jpg"],
          duration: "1 gün",
          difficultyLevel: "Orta",
          includedServices: ["Örnek hizmet"],
          featured: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Dosya sisteminden aktiviteleri okuma hatası:', error);
      return [];
    }
  }
  
  return [];
}

// Dosya sisteminde dökümanı güncelle
async function updateOneInFileSystem(collectionName: string, query: any, update: any, upsert = true) {
  console.log(`Dosya sisteminde güncelle: ${collectionName}`, query);
  
  if (collectionName === 'activities' && update) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Dizinin var olduğundan emin ol
      const dataDir = path.join(process.cwd(), 'data');
      const activitiesDir = path.join(dataDir, 'activities');
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      if (!fs.existsSync(activitiesDir)) {
        fs.mkdirSync(activitiesDir, { recursive: true });
      }
      
      // Slug değişimi durumunu kontrol et
      const originalSlug = query.slug;
      const newSlug = update.slug;
      
      if (originalSlug && newSlug && originalSlug !== newSlug) {
        // Eski dosyayı kontrol et ve sil
        const oldFilePath = path.join(activitiesDir, `${originalSlug}.json`);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Yeni dosyayı kaydet
      const slug = newSlug || originalSlug;
      if (slug) {
        const filePath = path.join(activitiesDir, `${slug}.json`);
        
        // Mevcut içeriği kontrol et
        let existingData = {};
        if (fs.existsSync(filePath)) {
          try {
            existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          } catch (parseError) {
            console.error(`Mevcut dosya ayrıştırılamadı: ${filePath}`, parseError);
          }
        }
        
        // Veriyi birleştir ve kaydet
        const updatedData = { 
          ...existingData, 
          ...update,
          updatedAt: new Date() 
        };
        
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
        
        return {
          acknowledged: true,
          modifiedCount: 1,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: 1,
          source: 'filesystem'
        };
      }
    } catch (error) {
      console.error('Dosya sisteminde güncelleme hatası:', error);
    }
  }
  
  return {
    acknowledged: false,
    modifiedCount: 0,
    upsertedId: null,
    upsertedCount: 0,
    matchedCount: 0,
    source: 'filesystem',
    error: 'Güncellenemedi'
  };
}

// Dosya sistemine döküman ekle
async function insertOneToFileSystem(collectionName: string, document: any) {
  console.log(`Dosya sistemine ekle: ${collectionName}`);
  
  if (collectionName === 'activities' && document) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Dizinin var olduğundan emin ol
      const dataDir = path.join(process.cwd(), 'data');
      const activitiesDir = path.join(dataDir, 'activities');
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      if (!fs.existsSync(activitiesDir)) {
        fs.mkdirSync(activitiesDir, { recursive: true });
      }
      
      // Slug kontrolü
      if (document.slug) {
        const filePath = path.join(activitiesDir, `${document.slug}.json`);
        
        // Tarih alanlarını ekle
        const documentWithDates = {
          ...document,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Dosyayı kaydet
        fs.writeFileSync(filePath, JSON.stringify(documentWithDates, null, 2), 'utf8');
        
        return {
          acknowledged: true,
          insertedId: document.slug,
          source: 'filesystem'
        };
      }
    } catch (error) {
      console.error('Dosya sistemine ekleme hatası:', error);
    }
  }
  
  return {
    acknowledged: false,
    insertedId: null,
    source: 'filesystem',
    error: 'Eklenemedi'
  };
}

// Dosya sisteminden döküman sil
async function deleteOneFromFileSystem(collectionName: string, query: any) {
  console.log(`Dosya sisteminden sil: ${collectionName}`, query);
  
  if (collectionName === 'activities' && query && query.slug) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const activitiesDir = path.join(process.cwd(), 'data', 'activities');
      const filePath = path.join(activitiesDir, `${query.slug}.json`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        
        return {
          acknowledged: true,
          deletedCount: 1,
          source: 'filesystem'
        };
      } else {
        return {
          acknowledged: true,
          deletedCount: 0,
          source: 'filesystem',
          error: 'Dosya bulunamadı'
        };
      }
    } catch (error) {
      console.error('Dosya sisteminden silme hatası:', error);
    }
  }
  
  return {
    acknowledged: false,
    deletedCount: 0,
    source: 'filesystem',
    error: 'Silinemedi'
  };
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;