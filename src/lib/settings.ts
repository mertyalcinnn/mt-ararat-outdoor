// Varsayılan site ayarları
export const defaultSettings = {
  siteName: 'LikyaClimbings',
  siteDescription: 'Eşsiz Maceralar',
  logo: '/images/logo.svg',
  logoSmall: '/images/placeholder-image.svg',
  favicon: '/favicon.ico',
  contactEmail: 'info@example.com',
  contactPhone: '+90 555 123 4567',
  socialMedia: {
    instagram: 'https://instagram.com/mtararatoutdoor',
    facebook: 'https://facebook.com/mtararatoutdoor',
    twitter: 'https://twitter.com/mtararatoutdoor'
  }
};

// Ayarları API endpoint üzerinden getiren fonksiyon
export async function fetchSiteSettings() {
  try {
    const response = await fetch('/api/settings/site', { 
      cache: 'no-store', // Önbelleği kullanma - her seferinde yeniden getir
      next: { revalidate: 0 } // Revalidation için 0 - her istekte yeni veri al
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Site settings could not be fetched:', error);
    return defaultSettings;
  }
}
