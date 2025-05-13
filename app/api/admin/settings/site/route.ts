import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Site ayarlarının yolu
const siteSettingsPath = path.join(process.cwd(), 'data', 'site-settings.json');

// Varsayılan site ayarları
const defaultSettings = {
  siteName: 'Mt. Ararat Outdoor Adventures',
  siteDescription: 'Ağrı Dağı\'nda Eşsiz Maceralar',
  logo: '/images/placeholder-image.svg',
  logoSmall: '/images/placeholder-image.svg',
  favicon: '/images/placeholder-image.svg',
  contactEmail: 'info@example.com',
  contactPhone: '+90 555 123 4567',
  socialMedia: {
    instagram: 'https://instagram.com/mtararatoutdoor',
    facebook: 'https://facebook.com/mtararatoutdoor',
    twitter: 'https://twitter.com/mtararatoutdoor'
  }
};

// Site ayarlarını okuma fonksiyonu
async function getSiteSettings() {
  try {
    await fs.access(siteSettingsPath);
    const data = await fs.readFile(siteSettingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Eğer dosya yoksa veya okuma hatası varsa varsayılan ayarları dön
    return defaultSettings;
  }
}

// Site ayarlarını kaydetme fonksiyonu
async function saveSiteSettings(settings: any) {
  // data klasörünün varlığını kontrol et, yoksa oluştur
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  await fs.writeFile(siteSettingsPath, JSON.stringify(settings, null, 2), 'utf8');
  return settings;
}

// GET - Site ayarlarını getir
export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Site ayarları okunamadı:', error);
    // Hata durumunda varsayılan ayarları dön
    return NextResponse.json(defaultSettings);
  }
}

// PUT - Site ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const currentSettings = await getSiteSettings();
    const updatedSettings = await request.json();
    
    console.log('Alınan ayarlar:', updatedSettings);
    
    // Sosyal medya nesnesini doğru şekilde iç içe birleştirmeyi garantileyelim
    const mergedSocialMedia = {
      ...currentSettings.socialMedia,
      ...updatedSettings.socialMedia
    };
    
    // Mevcut ayarlarla güncellenen ayarları birleştir
    const newSettings = {
      ...currentSettings,
      ...updatedSettings,
      socialMedia: mergedSocialMedia
    };
    
    console.log('Kaydedilecek ayarlar:', newSettings);
    
    await saveSiteSettings(newSettings);
    
    return NextResponse.json({ 
      success: true,
      settings: newSettings
    });
  } catch (error) {
    console.error('Site ayarları güncellenemedi:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Site ayarları güncellenemedi' },
      { status: 500 }
    );
  }
}