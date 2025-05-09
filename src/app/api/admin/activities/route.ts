import { NextResponse } from 'next/server';
import { getAllActivities, syncAllActivities } from '@/lib/activities';

export async function GET() {
  try {
    // Önce tüm markdown aktiviteleri JSON'a senkronize et
    syncAllActivities();
    
    // Sonra JSON dosyalarından tüm aktiviteleri oku
    const activities = getAllActivities();
    
    console.log(`${activities.length} aktivite yüklendi`);
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Aktiviteleri yüklerken hata:', error);
    return NextResponse.json({ 
      error: 'Aktiviteler yüklenirken hata oluştu', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}