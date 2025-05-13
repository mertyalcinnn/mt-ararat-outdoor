// MongoDB'den tüm aktiviteleri alıp JSON dosyalarına senkronize eden script
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const dataDir = path.join(process.cwd(), 'data', 'activities');

// MongoDB bağlantısı
async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MongoDB URI tanımlanmamış!');
    process.exit(1);
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB\'ye başarıyla bağlandı.');
    return client;
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
}

// JSON dosyalarını temizleme
function cleanJsonFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Aktiviteler dizini oluşturuldu.');
  } else {
    // Mevcut JSON dosyalarını temizle
    const files = fs.readdirSync(dataDir);
    let count = 0;
    for (const file of files) {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(dataDir, file));
        count++;
      }
    }
    console.log(`${count} JSON dosyası temizlendi.`);
  }
}

// MongoDB'den aktiviteleri alıp JSON olarak kaydetme
async function syncActivities() {
  const client = await connectToMongoDB();
  
  try {
    const db = client.db();
    const collection = db.collection('activities');
    
    // Tüm aktiviteleri getir
    const activities = await collection.find({}).toArray();
    console.log(`MongoDB'den ${activities.length} aktivite alındı.`);
    
    // Önce JSON dosyalarını temizle
    cleanJsonFiles();
    
    // Her aktiviteyi JSON dosyasına kaydet
    let count = 0;
    for (const activity of activities) {
      const { _id, ...activityData } = activity;
      
      // JSON dosyasını yaz
      const filePath = path.join(dataDir, `${activity.slug}.json`);
      fs.writeFileSync(filePath, JSON.stringify(activityData, null, 2), 'utf8');
      count++;
    }
    
    console.log(`${count} aktivite JSON dosyası olarak kaydedildi.`);
  } catch (error) {
    console.error('Senkronizasyon hatası:', error);
  } finally {
    await client.close();
    console.log('MongoDB bağlantısı kapatıldı.');
  }
}

// Script'i çalıştır
(async () => {
  console.log('MongoDB-JSON senkronizasyonu başlatılıyor...');
  await syncActivities();
  console.log('Senkronizasyon tamamlandı.');
})();
