#!/bin/bash
# Bu script, globalErrorComponent hatasını çözmek için statik export kullanacak güncellemeler yapar

echo "Mt. Ararat Outdoor globalErrorComponent Hatası Düzeltme Script'i"
echo "========================================================"

# Mevcut branch'i al
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Mevcut Branch: $CURRENT_BRANCH"

# Değişiklikleri ekle
echo "Değişiklikleri ekliyor..."
git add .

# Değişiklikleri commit et
echo "Değişiklikleri commit ediyor..."
git commit -m "Fix globalErrorComponent error: Switch to static export mode"

# Uzak repoya push et
echo "Değişiklikleri push ediyor..."
git push origin $CURRENT_BRANCH

echo "İşlem tamamlandı! Şimdi Vercel deployment'i kontrol edebilirsiniz."