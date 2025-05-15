"use server";

import { NextResponse } from 'next/server';
import clientPromise, { getDb, find } from '@/lib/mongodb';

export async function GET() {
  try {
    // MongoDB bağlantı testi
    console.log('MongoDB bağlantı testi başlatılıyor...');
    
    // 1. MongoDB bağlantı kontrolü
    const client = await clientPromise;
    console.log('MongoDB bağlantısı kuruldu');
    
    // 2. Veritabanına erişim kontrolü
    const db = await getDb();
    
    // Check if db is null before proceeding
    if (!db) {
      throw new Error('Veritabanı bağlantısı kurulamadı - db null');
    }
    
    console.log('Veritabanına erişim sağlandı');
    
    // 3. Kullanılabilir koleksiyonları listeleme
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Mevcut koleksiyonlar:', collectionNames);
    
    // 4. Aktiviteler koleksiyonunu test etme
    let activityResults = [];
    let error = null;
    
    try {
      activityResults = await find('activities');
      console.log(`Aktiviteler koleksiyonunda ${activityResults.length} öğe bulundu`);
    } catch (e) {
      console.error('Aktiviteler koleksiyonu testi başarısız:', e);
      error = e instanceof Error ? e.message : String(e);
    }
    
    // Başarılı sonuç dön
    return NextResponse.json({
      status: 'success',
      connectionStatus: 'connected',
      collections: collectionNames,
      databaseName: db.databaseName,
      activityCount: activityResults.length,
      mongoConnectionString: process.env.MONGODB_URI?.replace(/\w+:\w+@/, '***:***@') // Güvenlik için kimlik bilgilerini gizle
    });
  } catch (error) {
    console.error('MongoDB bağlantı testi sırasında hata:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      mongoConnectionString: process.env.MONGODB_URI?.replace(/\w+:\w+@/, '***:***@') // Güvenlik için kimlik bilgilerini gizle
    }, { status: 500 });
  }
}