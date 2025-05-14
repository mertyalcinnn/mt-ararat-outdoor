#!/bin/bash
# Bu script, Next.js TypeScript hatalarını düzeltmek için uygulanacak değişiklikleri kaydeder ve uzak repoya gönderir.

echo "Mt. Ararat Outdoor TypeScript Hatası Düzeltme Script'i"
echo "======================================================"

# Mevcut branch'i al
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Mevcut Branch: $CURRENT_BRANCH"

# Değişiklikleri ekle
echo "Değişiklikleri ekliyor..."
git add .

# Değişiklikleri commit et
echo "Değişiklikleri commit ediyor..."
git commit -m "Fix TypeScript errors: Add proper type annotations and remove experimental serverActions"

# Uzak repoya push et
echo "Değişiklikleri push ediyor..."
git push origin $CURRENT_BRANCH

echo "İşlem tamamlandı! Şimdi Vercel deployment'i kontrol edebilirsiniz."
