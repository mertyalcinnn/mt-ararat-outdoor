#!/bin/bash
# Bu script, TypeScript hatalarını ve yapılandırma sorunlarını düzeltmek için uygulanacak değişiklikleri commit eder

echo "Mt. Ararat Outdoor TypeScript ve Yapılandırma Hatası Düzeltme Script'i"
echo "================================================================"

# Mevcut branch'i al
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Mevcut Branch: $CURRENT_BRANCH"

# Değişiklikleri ekle
echo "Değişiklikleri ekliyor..."
git add .

# Değişiklikleri commit et
echo "Değişiklikleri commit ediyor..."
git commit -m "Fix TypeScript and Next.js config errors: Add type annotations and remove invalid runtime config"

# Uzak repoya push et
echo "Değişiklikleri push ediyor..."
git push origin $CURRENT_BRANCH

echo "İşlem tamamlandı! Şimdi Vercel deployment'i kontrol edebilirsiniz."