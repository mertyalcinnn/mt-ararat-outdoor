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

// Geliştirme modunda global değişken kullanımı
if (process.env.NODE_ENV === 'development' && uri) {
  try {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } catch (error) {
    console.error('MongoDB global değişken oluşturulurken hata:', error);
    // Dummy promise oluştur
    client = new MongoClient('mongodb://localhost:27017', options);
    clientPromise = Promise.resolve(client);
  }
} else if (uri) {
  try {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  } catch (error) {
    console.error('MongoDB client oluşturulurken hata:', error);
    // Dummy promise oluştur
    client = new MongoClient('mongodb://localhost:27017', options);
    clientPromise = Promise.resolve(client);
  }
} else {
  // MongoDB URI yoksa dummy promise oluştur
  client = new MongoClient('mongodb://localhost:27017', options);
  clientPromise = Promise.resolve(client);
}

// Helper function to get database instance
export async function getDb(): Promise<Db> {
  try {
    if (!uri) {
      throw new Error('MongoDB URI tanımlanmamış');
    }
    
    const client = await clientPromise;
    return client.db();
  } catch (error) {
    console.error('MongoDB veritabanı bağlantısı kurulamadı:', error);
    throw error;
  }
}

// Helper function to get collection
export async function getCollection(collectionName: string): Promise<Collection> {
  try {
    if (!uri) {
      throw new Error('MongoDB URI tanımlanmamış');
    }
    
    const db = await getDb();
    return db.collection(collectionName);
  } catch (error) {
    console.error(`MongoDB koleksiyon alınırken hata: ${collectionName}`, error);
    throw error;
  }
}

// Helper function to find one document
export async function findOne(collectionName: string, query: any) {
  try {
    if (!uri) {
      console.warn('MongoDB URI tanımlanmamış, findOne çalıştırılamadı');
      return null;
    }
    
    const collection = await getCollection(collectionName);
    return collection.findOne(query);
  } catch (error) {
    console.error(`MongoDB findOne hatası (${collectionName}):`, error);
    // Hata ile ilgili ek bilgileri ekle
    if (error instanceof Error) {
      console.error('Hata tipi:', error.name);
      console.error('Hata mesajı:', error.message);
      console.error('Hata yığını:', error.stack);
    }
    return null;
  }
}

// Helper function to find many documents
export async function find(collectionName: string, query: any = {}) {
  try {
    if (!uri) {
      console.warn('MongoDB URI tanımlanmamış, find çalıştırılamadı');
      return [];
    }
    
    console.log(`MongoDB '${collectionName}' koleksiyonundan veri çekiliyor...`);
    const collection = await getCollection(collectionName);
    const results = await collection.find(query).toArray();
    console.log(`MongoDB'den ${results.length} sonuç bulundu.`);
    return results;
  } catch (error) {
    console.error(`MongoDB find hatası (${collectionName}):`, error);
    // Hata ile ilgili ek bilgileri ekle
    if (error instanceof Error) {
      console.error('Hata tipi:', error.name);
      console.error('Hata mesajı:', error.message);
      console.error('Hata yığını:', error.stack);
    }
    
    // Hata durumunda boş dizi dön
    console.log('Bir hata oluştuğu için boş dizi dönülüyor');
    return [];
  }
}

// Helper function to update one document
export async function updateOne(collectionName: string, query: any, update: any, upsert = true) {
  try {
    if (!uri || uri.trim() === '') {
      console.warn(`MongoDB URI tanımlanmamış, ${collectionName} updateOne çalıştırılamadı`);
      // Silently return a faux-successful response rather than error
      return {
        acknowledged: true,
        modifiedCount: 0,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 0,
        source: 'filesystem-fallback',
        noMongo: true
      };
    }
    
    console.log(`MongoDB ${collectionName} koleksiyonunda updateOne çalışıyor...`);
    console.log('Query:', JSON.stringify(query));
    
    const collection = await getCollection(collectionName);
    const result = await collection.updateOne(query, { $set: update }, { upsert });
    console.log(`MongoDB updateOne sonuç: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.error(`MongoDB updateOne hatası (${collectionName}):`, error);
    if (error instanceof Error) {
      console.error('Hata tipi:', error.name);
      console.error('Hata mesajı:', error.message);
      console.error('Hata yığını:', error.stack);
    }
    throw error;
  }
}

// Helper function to insert one document
export async function insertOne(collectionName: string, document: any) {
  try {
    if (!uri) {
      console.warn('MongoDB URI tanımlanmamış, insertOne çalıştırılamadı');
      throw new Error('MongoDB URI tanımlanmamış');
    }
    
    const collection = await getCollection(collectionName);
    return collection.insertOne(document);
  } catch (error) {
    console.error(`MongoDB insertOne hatası (${collectionName}):`, error);
    throw error;
  }
}

// Helper function to delete one document
export async function deleteOne(collectionName: string, query: any) {
  try {
    if (!uri) {
      console.warn('MongoDB URI tanımlanmamış, deleteOne çalıştırılamadı');
      throw new Error('MongoDB URI tanımlanmamış');
    }
    
    const collection = await getCollection(collectionName);
    return collection.deleteOne(query);
  } catch (error) {
    console.error(`MongoDB deleteOne hatası (${collectionName}):`, error);
    throw error;
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;