// scripts/migrate-data.js
require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');

// MONGODB_URI çevresel değişkenini kontrol edin
if (!process.env.MONGODB_URI) {
  console.error('Lütfen MONGODB_URI çevresel değişkenini ayarlayın');
  console.error('mongodb+srv://mtararat-admin:YgvdQMCAqIYP4uX5@cluster0.ub0rqa1.mongodb.net/mtararat-db?retryWrites=true&w=majority&appName=Cluster0');
  process.exit(1);
}

async function migrateData() {
  console.log('Veri taşıma işlemi başlatılıyor...');
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('MongoDB bağlantısı kuruldu');
    
    const db = client.db();
    
    // Hakkımızda verisini taşı
    try {
      const aboutPath = path.join(process.cwd(), 'data/about.json');
      console.log(`Hakkımızda verisi okunuyor: ${aboutPath}`);
      
      if (await fileExists(aboutPath)) {
        const aboutData = JSON.parse(await fs.readFile(aboutPath, 'utf8'));
        
        await db.collection('content').updateOne(
          { _id: 'about' },
          { $set: { 
            data: aboutData,
            updatedAt: new Date()
          }},
          { upsert: true }
        );
        
        console.log('Hakkımızda verisi başarıyla taşındı');
      } else {
        console.log('Hakkımızda dosyası bulunamadı');
      }
    } catch (aboutError) {
      console.error('Hakkımızda verisi taşınırken hata:', aboutError);
    }
    
    // Aktiviteleri taşı
    try {
      const activitiesDir = path.join(process.cwd(), 'data/activities');
      console.log(`Aktiviteler dizini kontrol ediliyor: ${activitiesDir}`);
      
      if (await fileExists(activitiesDir)) {
        const files = await fs.readdir(activitiesDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        console.log(`${jsonFiles.length} adet JSON dosyası bulundu`);
        
        for (const file of jsonFiles) {
          const filePath = path.join(activitiesDir, file);
          const activityData = JSON.parse(await fs.readFile(filePath, 'utf8'));
          
          await db.collection('activities').updateOne(
            { slug: activityData.slug },
            { $set: {
              ...activityData,
              updatedAt: new Date()
            }},
            { upsert: true }
          );
          
          console.log(`Aktivite taşındı: ${activityData.title}`);
        }
        
        console.log(`Toplam ${jsonFiles.length} aktivite başarıyla taşındı`);
      } else {
        console.log('Aktiviteler dizini bulunamadı');
      }
    } catch (activitiesError) {
      console.error('Aktiviteler taşınırken hata:', activitiesError);
    }
    
    // Veritabanındaki koleksiyonları listele
    const collections = await db.listCollections().toArray();
    console.log('Veritabanındaki koleksiyonlar:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    console.log('Veri taşıma işlemi tamamlandı');
  } catch (error) {
    console.error('Veri taşıma sırasında hata:', error);
  } finally {
    await client.close();
  }
}

// Dosya veya dizin var mı kontrol et
async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

// Scripti çalıştır
migrateData().catch(console.error);