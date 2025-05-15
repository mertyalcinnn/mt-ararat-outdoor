// Sayfaların yeniden oluşturulmasını zorlamak için dinamik yapılandırma
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Tüm geçerli aktivite sluglarını getiren yardımcı fonksiyon
export async function generateStaticParams() {
  // Aktiviteleri getir
  try {
    // Statik slug'lar oluşturalım
    return [
      { slug: 'ski-touring' },
      { slug: 'climbing' },
      { slug: 'hiking' },
      { slug: 'sea-kayak-sup' },
      { slug: 'private-guidance' }
    ];
  } catch (error) {
    console.error('generateStaticParams için aktiviteler alınırken hata:', error);
    return [];
  }
}
