#!/bin/bash
# Bu script, 500 Server hatalarını düzeltmek için uygulanacak değişiklikleri commit eder

echo "Mt. Ararat Outdoor 500 Server Hatası Düzeltme Script'i - Aşama 2"
echo "=========================================================="

# Mevcut branch'i al
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Mevcut Branch: $CURRENT_BRANCH"

# Değişiklikleri ekle
echo "Değişiklikleri ekliyor..."
git add .

# Değişiklikleri commit et
echo "Değişiklikleri commit ediyor..."
git commit -m "Fix 500 Server Error: Implement fallback data and robust error handling"

# Uzak repoya push et
echo "Değişiklikleri push ediyor..."
git push origin $CURRENT_BRANCH

echo "İşlem tamamlandı! Şimdi Vercel deployment'i kontrol edebilirsiniz."