const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// İzlenecek klasörler
const dataDir = path.join(process.cwd(), 'data', 'activities');
const jsonFiles = [];

console.log(`JSON aktivite dosyaları izleniyor: ${dataDir}`);

// Klasörleri oluştur (eğer yoksa)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Klasör oluşturuldu: ${dataDir}`);
}

// Dosya değişikliklerini izle
const watcher = chokidar.watch(dataDir, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: false,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

// Dosya değişikliklerinin kaydedildiği bir log dosyası
const logPath = path.join(process.cwd(), 'activity-changes.log');

function logChange(event, path) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${event}: ${path}\n`;
  console.log(message);
  
  // Log dosyasına yaz
  fs.appendFileSync(logPath, message);
}

// Event listenerları
watcher
  .on('add', path => {
    logChange('Dosya eklendi', path);
    if (path.endsWith('.json')) {
      jsonFiles.push(path);
    }
  })
  .on('change', path => {
    logChange('Dosya değişti', path);
  })
  .on('unlink', path => {
    logChange('Dosya silindi', path);
    const index = jsonFiles.indexOf(path);
    if (index > -1) {
      jsonFiles.splice(index, 1);
    }
  });

console.log('Dosya izleyici başlatıldı. Değişiklikler izleniyor...');

// Dosya listesini konsola düzenli olarak yazdır
setInterval(() => {
  console.log(`Toplam ${jsonFiles.length} JSON dosyası izleniyor.`);
}, 60000);

// Pencerenin kapatılması durumunda temiz bir çıkış
process.on('SIGINT', () => {
  watcher.close();
  console.log('Dosya izleyici kapatıldı.');
  process.exit(0);
});
