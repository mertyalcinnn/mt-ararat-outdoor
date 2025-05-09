import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Aktivite dosyalarını okuyun
    const activitiesDir = path.join(process.cwd(), 'data/activities');
    const fileNames = fs.readdirSync(activitiesDir);
    
    const activities = fileNames.map(fileName => {
      const filePath = path.join(activitiesDir, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContents);
    });
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Aktiviteleri yüklerken hata:', error);
    return NextResponse.json({ error: 'Aktiviteler yüklenirken hata oluştu' }, { status: 500 });
  }
}