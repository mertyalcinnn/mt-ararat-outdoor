/**
 * Uygulama için gerekli olan tüm ortam değişkenlerini kontrol eden script
 * Bu script, eksik veya hatalı ayarları tespit eder ve düzeltme önerileri sunar
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('Mt. Ararat Outdoor - Sistem Konfigürasyon Kontrolü\n');

// Ortam değişkenlerini yükle
const envPath = path.join(process.cwd(), '.env.local');
let envConfig = {};

// .env.local dosyasını kontrol et
if (fs.existsSync(envPath)) {
  console.log('.env.local dosyası bulundu, içeriği kontrol ediliyor...');
  envConfig = dotenv.parse(fs.readFileSync(envPath));
} else {
  console.warn('UYARI: .env.local dosyası bulunamadı, yeni bir dosya oluşturulacak.');
  envConfig = {};
}

// Gerekli ortam değişkenleri ve açıklamaları
const requiredEnvVars = [
  {
    key: 'MONGODB_URI',
    description: 'MongoDB bağlantı adresi',
    example: 'mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority',
    required: true
  },
  {
    key: 'MONGODB_DB',
    description: 'MongoDB veritabanı adı',
    example: 'mt-ararat-outdoor',
    required: true
  },
  {
    key: 'ADMIN_USERNAME',
    description: 'Admin paneli kullanıcı adı',
    example: 'admin',
    required: true
  },
  {
    key: 'ADMIN_PASSWORD',
    description: 'Admin paneli şifresi',
    example: 'güçlü-şifre-buraya',
    required: true
  },
  {
    key: 'NEXTAUTH_SECRET',
    description: 'NextAuth güvenlik anahtarı',
    example: 'bu_çok_gizli_bir_anahtar_oluşturun',
    required: true
  },
  {
    key: 'NEXTAUTH_URL',
    description: 'Kimlik doğrulama URL adresi',
    example: 'http://localhost:3000',
    required: false
  }
];

// Eksik veya hatalı değişkenleri kontrol et
const missingVars = [];
const validVars = [];

for (const envVar of requiredEnvVars) {
  const value = envConfig[envVar.key] || process.env[envVar.key];
  
  if (!value && envVar.required) {
    missingVars.push(envVar);
  } else if (value) {
    validVars.push({...envVar, value});
  }
}

// Sonuçları göster
console.log('\n--- Konfigürasyon Durumu ---');

if (validVars.length > 0) {
  console.log('\n✅ Ayarlanan ortam değişkenleri:');
  for (const validVar of validVars) {
    const maskedValue = validVar.key.includes('PASSWORD') || validVar.key.includes('SECRET') 
      ? '*'.repeat(8) 
      : validVar.value;
    console.log(`  - ${validVar.key}: ${maskedValue}`);
  }
}

if (missingVars.length > 0) {
  console.log('\n❌ Eksik veya hatalı ortam değişkenleri:');
  for (const missingVar of missingVars) {
    console.log(`  - ${missingVar.key}: ${missingVar.description}`);
    console.log(`    Örnek: ${missingVar.example}`);
  }
  
  // Yeni .env.local içeriği oluştur
  let newEnvContent = '';
  
  // Mevcut değerleri koru
  for (const key in envConfig) {
    newEnvContent += `${key}=${envConfig[key]}\n`;
  }
  
  // Eksik değerleri ekle
  for (const missingVar of missingVars) {
    if (!envConfig[missingVar.key]) {
      newEnvContent += `${missingVar.key}=\n`;
    }
  }
  
  // Yeni .env.local dosyasını yaz
  fs.writeFileSync(envPath, newEnvContent);
  console.log(`\nYeni .env.local dosyası oluşturuldu. Lütfen eksik değerleri doldurun:\n${envPath}`);
} else {
  console.log('\n✅ Tüm gerekli ortam değişkenleri tanımlanmış! Sistem kullanıma hazır.');
}

// MongoDB test bağlantısı
if (envConfig.MONGODB_URI) {
  console.log('\n--- MongoDB Bağlantı Testi ---');
  const { MongoClient } = require('mongodb');
  
  async function testMongoConnection() {
    const client = new MongoClient(envConfig.MONGODB_URI);
    try {
      console.log('MongoDB bağlantısı test ediliyor...');
      await client.connect();
      console.log('✅ MongoDB bağlantısı başarılı!');
      
      // Veritabanı varlığını kontrol et
      const dbName = envConfig.MONGODB_DB || 'mt-ararat-outdoor';
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      console.log(`✅ "${dbName}" veritabanında ${collections.length} koleksiyon bulundu:`);
      for (const collection of collections) {
        console.log(`  - ${collection.name}`);
      }
      
    } catch (err) {
      console.error('❌ MongoDB bağlantı hatası:', err.message);
      console.log('Lütfen MONGODB_URI değerini kontrol edin.');
    } finally {
      await client.close();
    }
  }
  
  testMongoConnection().catch(console.error);
}
