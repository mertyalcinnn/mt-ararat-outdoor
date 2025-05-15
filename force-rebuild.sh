#!/bin/bash
# Bu script, Next.js uygulamasını yeniden derler ve önbelleği temizler

echo "Mt Ararat Outdoor - Site Yeniden Derleme Aracı"
echo "----------------------------------------------"

# Önbelleği temizle
echo "Önbellek temizleniyor..."
rm -rf .next/cache

# Next.js uygulamasını yeniden derle
echo "Proje yeniden derleniyor..."
npm run build

# Sunucuyu yeniden başlat
echo "Sunucu yeniden başlatılıyor..."
touch .next/REVISION_ID

echo "İşlem tamamlandı! Site yeniden oluşturuldu."
