#!/bin/bash
# Bu script, Next.js sunucu hatalarını düzeltmek için uygulanacak değişiklikleri kaydeder ve uzak repoya gönderir.

echo "Mt. Ararat Outdoor 500 Server Hatası Düzeltme Script'i"
echo "======================================================"

# Mevcut branch'i al
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Mevcut Branch: $CURRENT_BRANCH"

# Değişiklikleri ekle
echo "Değişiklikleri ekliyor..."
git add .

# Değişiklikleri commit et
echo "Değişiklikleri commit ediyor..."
git commit -m "Fix 500 server errors: Add robust error handling and force-dynamic exports"

# Uzak repoya push et
echo "Değişiklikleri push ediyor..."
git push origin $CURRENT_BRANCH

echo "İşlem tamamlandı! Şimdi Vercel deployment'i kontrol edebilirsiniz."
