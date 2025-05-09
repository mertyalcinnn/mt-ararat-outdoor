#!/bin/bash

echo "Paketleri temizleme..."
rm -rf node_modules
rm -rf .next

echo "Paketleri yeniden yükleme..."
npm install

echo "Build başlatılıyor..."
npm run build

# Build başarılı ise
if [ $? -eq 0 ]; then
  echo "Build başarılı! Projeyi çalıştırma..."
  npm run start
else
  echo "Build başarısız. Hataları kontrol edin."
fi 