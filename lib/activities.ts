import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Aktivitelerin yolları
const contentDir = path.join(process.cwd(), 'content', 'activities');
const dataDir = path.join(process.cwd(), 'data', 'activities');

// Kök 'activities' dizinindeki aktiviteleri oku
export async function getRootActivities() {
  'use server';
  
  try {
    const activitiesDir = path.join(process.cwd(), 'activities');
    if (!fs.existsSync(activitiesDir)) {
      console.log(`'activities' kök dizini bulunamadı!`);
      return [];
    }

    console.log(`Kök 'activities' dizininden aktiviteler okunuyor...`);
    
    // Dosyaları oku
    const fileNames = fs.readdirSync(activitiesDir);
    const jsonFiles = fileNames.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log(`Kök 'activities' dizininde JSON dosyası bulunamadı`);
      return [];
    }
    
    console.log(`Kök dizinden ${jsonFiles.length} JSON aktivite dosyası bulundu.`);
    
    const activities = jsonFiles.map(fileName => {
      try {
        const filePath = path.join(activitiesDir, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        const data = JSON.parse(fileContents);
        return data;
      } catch (error) {
        console.error(`${fileName} dosyası JSON olarak ayrıştırılamadı:`, error);
        return null;
      }
    });
    
    const validActivities = activities.filter(Boolean);
    console.log(`Kök 'activities' dizininden ${validActivities.length} geçerli JSON aktivite bulundu.`);
    return validActivities;
  } catch (error) {
    console.error(`'activities' kök dizininden aktiviteler okunurken hata:`, error);
    return [];
  }
}

// Markdown aktiviteleri oku
export async function getAllMarkdownActivities() {
  'use server';
  
  try {
    // Dizinin var olduğundan emin ol
    if (!fs.existsSync(contentDir)) {
      try {
        fs.mkdirSync(contentDir, { recursive: true });
        console.log('Markdown aktiviteleri dizini oluşturuldu:', contentDir);
      } catch (error) {
        console.error('Aktivite dizini oluşturulamadı:', error);
        return [];
      }
    }

    // Dosyaları oku
    const fileNames = fs.readdirSync(contentDir);
    const mdFiles = fileNames.filter(file => file.endsWith('.md'));
    
    if (mdFiles.length === 0) {
      console.log('Hiç markdown aktivite dosyası bulunamadı.');
      return [];
    }
    
    const activities = mdFiles.map(fileName => {
      try {
        const filePath = path.join(contentDir, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        // Markdown içeriğini ve frontmatter'ı ayrıştır
        const { data, content } = matter(fileContents);
        
        // Aktivite nesnesini döndür
        return {
          ...data,
          content,
          slug: data.slug || fileName.replace(/\.md$/, '')
        };
      } catch (error) {
        console.error(`${fileName} dosyası okunurken hata:`, error);
        return null;
      }
    });
    
    return activities.filter(Boolean);
  } catch (error) {
    console.error('Markdown aktiviteleri okunurken genel hata:', error);
    return [];
  }
}

// JSON aktivitelerini oku
export async function getAllJsonActivities() {
  'use server';
  
  try {
    console.log('getAllJsonActivities: data/activities dizininden aktiviteler okunuyor...');
    
    // Dizinin var olduğundan emin ol
    const dataDir = path.join(process.cwd(), 'data', 'activities');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('JSON aktiviteleri dizini oluşturuldu:', dataDir);
      } catch (error) {
        console.error('Aktivite dizini oluşturulamadı:', error);
        return [];
      }
    }

    // Dosyaları oku
    const fileNames = fs.readdirSync(dataDir);
    const jsonFiles = fileNames.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('data/activities dizininde hiç JSON aktivite dosyası bulunamadı.');
      return [];
    }
    
    console.log(`data/activities dizininde ${jsonFiles.length} JSON aktivite dosyası bulundu.`);
    
    const activities = jsonFiles.map(fileName => {
      try {
        const filePath = path.join(dataDir, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        const data = JSON.parse(fileContents);
        console.log(`Başarıyla yüklendi: ${fileName}`);
        return data;
      } catch (error) {
        console.error(`${fileName} dosyası JSON olarak ayrıştırılamadı:`, error);
        return null;
      }
    });
    
    const validActivities = activities.filter(Boolean);
    console.log(`${validActivities.length} geçerli JSON aktivite bulundu.`);
    return validActivities;
  } catch (error) {
    console.error('JSON aktiviteleri okunurken genel hata:', error);
    return [];
  }
}

// Aktiviteyi JSON'a dönüştür ve kaydet
export async function syncActivityToJson(activity: any): Promise<any> {
  'use server';
  
  try {
    // Dizinin var olduğundan emin ol
    const dataDir = path.join(process.cwd(), 'data', 'activities');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('JSON aktiviteleri dizini oluşturuldu:', dataDir);
      } catch (dirError) {
        console.error('Aktivite dizini oluşturulamadı:', dirError);
        return null;
      }
    }
    
    // Slug kontrolü
    if (!activity || !activity.slug) {
      console.error('Aktivitenin slug değeri yok, kaydedilemez:', activity);
      return null;
    }
    
    // JS nesnesini JSON'a dönüştürmeyi dene (hatalar için)
    try {
      const jsonStr = JSON.stringify(activity, null, 2);
      if (!jsonStr) {
        throw new Error('JSON dönüştürme başarısız oldu');
      }
      
      // JSON dosyasını oluştur
      const filePath = path.join(dataDir, `${activity.slug}.json`);
      console.log(`${activity.slug}.json dosyası yazılıyor...`);
      
      fs.writeFileSync(filePath, jsonStr, 'utf8');
      
      // Dosyanın var olduğunu kontrol et
      if (!fs.existsSync(filePath)) {
        throw new Error(`Dosya yazıldı ama oluşturulmadı: ${filePath}`);
      }
      
      console.log(`Aktivite '${activity.slug}' başarıyla JSON dosyasına yazıldı: ${filePath}`);
      
      // Aktivite, kök "activities" klasöründe varsa kaldır (eski yerlerdeki aktiviteleri temizle)
      try {
        const rootActivitiesPath = path.join(process.cwd(), 'activities', `${activity.slug}.json`);
        if (fs.existsSync(rootActivitiesPath)) {
          console.log(`Kök dizindeki eski aktivite dosyası siliniyor: ${rootActivitiesPath}`);
          fs.unlinkSync(rootActivitiesPath);
        }
      } catch (rootDeleteError) {
        console.error('Kök dizindeki aktivite dosyası silinirken hata:', rootDeleteError);
      }
      
      return activity;
    } catch (jsonError) {
      console.error('JSON dönüştürme veya yazma hatası:', jsonError);
      throw jsonError;
    }
  } catch (error) {
    console.error('Aktivite JSON dosyasına yazılırken genel hata:', error);
    throw error;
  }
}

// Aktivite JSON dosyasını sil
export async function deleteActivityJson(slug: string): Promise<boolean> {
  'use server';
  
  try {
    if (!slug) {
      console.error('Silinecek aktivitenin slug değeri belirtilmemiş!');
      return false;
    }
    
    const filePath = path.join(dataDir, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`${slug}.json dosyası silindi.`);
      return true;
    } else {
      console.log(`${slug}.json dosyası bulunamadı.`);
      return false;
    }
  } catch (error) {
    console.error(`Aktivite JSON dosyası silinirken hata: ${slug}`, error);
    return false;
  }
}

    // Tüm markdown aktiviteleri JSON'a senkronize et
export async function syncAllActivities() {
  'use server';
  
  try {
    console.log('syncAllActivities: Tüm aktiviteler senkronize ediliyor...');
    const markdownActivities = await getAllMarkdownActivities();
    
    if (markdownActivities.length === 0) {
      console.log('Senkronize edilecek markdown aktivite bulunamadı.');
    } else {
      console.log(`${markdownActivities.length} markdown aktivite JSON'a senkronize ediliyor...`);
      
      let successCount = 0;
      for (const activity of markdownActivities) {
        if (await syncActivityToJson(activity)) {
          successCount++;
        }
      }
      
      console.log(`${successCount}/${markdownActivities.length} aktivite başarıyla senkronize edildi.`);
    }
    
    return markdownActivities;
  } catch (error) {
    console.error('Aktivitelerin senkronizasyonunda genel hata:', error);
    return [];
  }
}

// Tüm aktiviteleri getir
export async function getAllActivities() {
  'use server';
  
  try {
    console.log('activities.ts: getAllActivities fonksiyonu çağrılıyor...');
    
    // Önbellek devre dışı bırak - her zaman güncel veri al
    const cacheHeader = { 'Cache-Control': 'no-cache, no-store, must-revalidate' };
    
    // ÖNEMLİ: İlk önce data/activities dizini (admin paneli tarafından güncellenen) kontrol edilmeli
    try {
      console.log('İlk önce data/activities dizininden JSON aktiviteler okunuyor...');
      const activities = await getAllJsonActivities();
      
      // Dizi kontrolü
      if (Array.isArray(activities) && activities.length > 0) {
        console.log(`data/activities dizininden ${activities.length} aktivite okundu - BUNLARI KULLANIYORUZ`);
        return activities;
      } else {
        console.log('data/activities dizininde geçerli aktivite bulunamadı.');
      }
    } catch (readError) {
      console.error('data/activities dizininden JSON aktiviteleri okuma hatası:', readError);
    }
    
    // Sonra kök activities dizininden oku (eski yöntem, sadece yedek olarak)
    try {
      console.log('Kök activities dizininden JSON aktiviteler okunuyor...');
      const rootActivities = await getRootActivities();
      if (rootActivities && Array.isArray(rootActivities) && rootActivities.length > 0) {
        console.log(`Kök dizinden ${rootActivities.length} aktivite başarıyla okundu - BUNLARI KULLANIYORUZ`);
        return rootActivities;
      } else {
        console.log('Kök dizinde geçerli aktivite bulunamadı.');
      }
    } catch (rootError) {
      console.error('Kök activities dizini okuma hatası:', rootError);
    }
    
    // Hiçbir kaynak çalışmazsa varsayılan verileri kullan
    console.log('Hiçbir kaynak çalışmadı - varsayılan aktiviteleri kullanıyoruz.');
    return getFallbackActivities();
  } catch (error) {
    console.error('getAllActivities fonksiyonunda genel hata:', error);
    // Son çare olarak varsayılan veri döndür
    return getFallbackActivities();
  }
}

// Bir hata durumunda göstermek için varsayılan aktiviteler
function getFallbackActivities() {
  console.log('FALLBACK: Varsayılan aktivite verileri kullanılıyor!');
  return [
    {
      id: 'hiking-example',
      title: 'Yürüyüş Turları',
      slug: 'hiking-tours',
      description: 'Dağlarda ve doğada yürüyüş turları ile doğanın güzelliklerini keşfedin.',
      coverImage: '/images/hiking.jpg',
      featured: true,
      difficultyLevel: 'Orta',
      duration: '3-5 saat',
      content: 'Bu aktivite hakkında daha fazla bilgi bulunmamaktadır.',
      includedServices: ['Rehberlik', 'Ara Öğün', 'Ekipman'],
      gallery: [
        '/images/placeholder-image.jpg',
        '/images/placeholder-image.jpg',
      ]
    },
    {
      id: 'climbing-example',
      title: 'Kaya Tırmanışı',
      slug: 'rock-climbing',
      description: 'Kaya tırmanışı ile adrenalin dolu bir deneyim yaşayın.',
      coverImage: '/images/placeholder-image.jpg',
      featured: true,
      difficultyLevel: 'Zor',
      duration: '4-6 saat',
      content: 'Bu aktivite hakkında daha fazla bilgi bulunmamaktadır.',
      includedServices: ['Rehberlik', 'Güvenlik Ekipmanı', 'Eğitim'],
      gallery: [
        '/images/placeholder-image.jpg',
        '/images/placeholder-image.jpg',
      ]
    },
  ];
}

// Slug'a göre aktivite getir
export async function getActivityBySlug(slug: string) {
  'use server';
  
  try {
    console.log(`activities.ts: getActivityBySlug("${slug}") fonksiyonu çağrılıyor...`);
    
    if (!slug) {
      console.error('Alınacak aktivitenin slug değeri belirtilmemiş!');
      return null;
    }
    
    // Önbellek devre dışı bırak - her zaman güncel veri al
    const cacheHeader = { 'Cache-Control': 'no-cache, no-store, must-revalidate' };
    
    // İlk önce data/activities dizininden oku (admin paneli dosyaları)
    try {
      console.log(`İlk önce data/activities dizininde "${slug}" aktivitesi aranıyor...`);
      const dataDir = path.join(process.cwd(), 'data', 'activities');
      
      if (fs.existsSync(dataDir)) {
        const filePath = path.join(dataDir, `${slug}.json`);
        
        if (fs.existsSync(filePath)) {
          console.log(`"${slug}" aktivitesi data/activities dizininde bulundu`);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const activity = JSON.parse(fileContent);
          return activity;
        } else {
          console.log(`"${slug}" aktivitesi data/activities dizininde bulunamadı`);
        }
      } else {
        console.log('data/activities dizini bulunamadı');
      }
    } catch (dataError) {
      console.error(`data/activities'den aktivite alınırken hata:`, dataError);
    }
    
    // Bulunamadıysa kök activities dizinine bak
    try {
      console.log(`Kök activities dizininde "${slug}" aktivitesi aranıyor...`);
      const rootDir = path.join(process.cwd(), 'activities');
      
      if (fs.existsSync(rootDir)) {
        const filePath = path.join(rootDir, `${slug}.json`);
        
        if (fs.existsSync(filePath)) {
          console.log(`"${slug}" aktivitesi kök activities dizininde bulundu`);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const activity = JSON.parse(fileContent);
          return activity;
        } else {
          console.log(`"${slug}" aktivitesi kök activities dizininde bulunamadı`);
        }
      } else {
        console.log('Kök activities dizini bulunamadı');
      }
    } catch (rootError) {
      console.error(`Kök dizinden aktivite alınırken hata:`, rootError);
    }
    
    // Bulunamadıysa önce tüm aktiviteleri yükle ve ara (hızlı bir arama olacak)
    console.log(`"${slug}" aktivitesi tek tek dosyalarda bulunamadı, tüm aktiviteler yükleniyor...`);
    const activities = await getAllActivities();
    const activity = activities.find(activity => activity.slug === slug);
    
    if (activity) {
      console.log(`"${slug}" aktivitesi tüm aktiviteler içinde bulundu`);
      return activity;
    }
    
    console.log(`"${slug}" aktivitesi hiçbir kaynakta bulunamadı`);
    // Fallback aktivitelerde arama yapmayı düşünebiliriz
    return getFallbackActivities().find(act => act.slug === slug) || null;
  } catch (error) {
    console.error(`${slug} aktivitesini alırken hata:`, error);
    // Fallback aktivitelerde arama
    return getFallbackActivities().find(act => act.slug === slug) || null;
  }
}