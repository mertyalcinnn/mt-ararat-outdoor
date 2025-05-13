#!/usr/bin/env node
/**
 * Uygulama güncellemelerinden sonra otomatik olarak önbelleği temizleyen script
 * Bu script, aktivite veya içerik dosyalarında değişiklik olduğunda Next.js önbelleğini temizler
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execSync } = require('child_process');

// İzlenecek klasörler
const watchDirs = [
  path.join(process.cwd(), 'data'),
  path.join(process.cwd(), 'content')
];

// Log dosyası
const logPath = path.join(process.cwd(), 'cache-clear.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(logPath, logMessage);
}

// Önbellek temizleme işlevi
function clearCache() {
  log('Önbellek temizleme işlemi başlatılıyor...');
  
  try {
    // .next/cache dizinini temizle
    const cacheDir = path.join(process.cwd(), '.next', 'cache');
    if (fs.existsSync(cacheDir)) {
      execSync(`rm -rf ${cacheDir}`);
      log('.next/cache dizini temizlendi.');
    }
    
    // .contentlayer önbelleğini temizle
    const contentLayerDir = path.join(process.cwd(), '.contentlayer');
    if (fs.existsSync(contentLayerDir)) {
      execSync(`rm -rf ${contentLayerDir}`);
      log('.contentlayer dizini temizlendi.');
    }
    
    log('Önbellek temizleme işlemi başarıyla tamamlandı.');
    
    // Opsiyonel: Geliştirme sunucusunu yeniden başlat
    // execSync('npm run dev', { stdio: 'inherit' });
    
  } catch (error) {
    log(`Önbellek temizleme hatası: ${error.message}`);
  }
}

// Dosya değişiklik izleyicisini başlat
log('Dosya değişiklik izleyicisi başlatılıyor...');

// İzleme seçenekleri
const watchOptions = {
  ignored: /(^|[\/\\])\../, // Gizli dosyaları görmezden gel
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
};

// İzleyici oluştur
const watcher = chokidar.watch(watchDirs, watchOptions);

// Değişken - son önbellek temizleme zamanı
let lastClearTime = 0;
const THROTTLE_TIME = 10000; // En az 10 saniye aralıklarla temizle

// Event listenerları
watcher
  .on('add', filePath => {
    log(`Yeni dosya eklendi: ${filePath}`);
    throttledClearCache();
  })
  .on('change', filePath => {
    log(`Dosya değişti: ${filePath}`);
    throttledClearCache();
  })
  .on('unlink', filePath => {
    log(`Dosya silindi: ${filePath}`);
    throttledClearCache();
  });

// Throttled önbellek temizleme - çok sık çalışmasını engelle
function throttledClearCache() {
  const now = Date.now();
  if (now - lastClearTime > THROTTLE_TIME) {
    lastClearTime = now;
    clearCache();
  } else {
    log(`Önbellek temizleme ertelendi (son temizlemeden ${Math.round((now - lastClearTime)/1000)} saniye geçti)`);
  }
}

log('Otomatik önbellek temizleme sistemi çalışıyor. Değişiklikler izleniyor...');

// Pencerenin kapatılması durumunda temiz bir çıkış
process.on('SIGINT', () => {
  watcher.close();
  log('Dosya izleyici kapatıldı.');
  process.exit(0);
});
