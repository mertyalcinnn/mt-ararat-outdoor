"use server";

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { defaultSettings } from '@/lib/settings';

// Site ayarlarının yolu
const siteSettingsPath = path.join(process.cwd(), 'data', 'site-settings.json');

// GET - Site ayarlarını getir
export async function GET() {
  try {
    try {
      await fs.access(siteSettingsPath);
      const data = await fs.readFile(siteSettingsPath, 'utf8');
      
      // JSON parsing hatalarına karşı try-catch
      try {
        const settings = JSON.parse(data);
        return NextResponse.json(settings);
      } catch (parseError) {
        console.error('JSON parse hatası:', parseError);
        return NextResponse.json(defaultSettings);
      }
    } catch (error) {
      // Dosya bulunamadı veya okunamadı, varsayılan ayarları dön
      console.log('Ayar dosyası bulunamadı, varsayılan ayarlar kullanılıyor');
      return NextResponse.json(defaultSettings);
    }
  } catch (error) {
    console.error('Site ayarları okunamadı:', error);
    return NextResponse.json(
      { error: 'Site ayarları okunamadı' },
      { status: 500 }
    );
  }
}