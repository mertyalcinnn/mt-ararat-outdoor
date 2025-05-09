#!/bin/bash

# CMS dosyalarını geçici olarak yedekleyelim
mv cms.config.ts cms.config.ts.disabled 2>/dev/null || true
mv contentlayer.config.ts contentlayer.config.ts.disabled 2>/dev/null || true

# GitHub'a yükleyelim
git add .
git commit -m "İlk versiyon: Mt.Ararat Outdoor Adventures sitesi"

# Burada GitHub repo URL'nizi ekleyin
echo "GitHub repository URL'nizi girin: "
read repo_url
git remote add origin $repo_url

# Ana brancha push yapalım
git push -u origin main

# Dosyaları geri yükleyelim
mv cms.config.ts.disabled cms.config.ts 2>/dev/null || true
mv contentlayer.config.ts.disabled contentlayer.config.ts 2>/dev/null || true

echo "İşlem tamamlandı!"
