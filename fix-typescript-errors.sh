#!/bin/bash
# Bu script, TypeScript hatalarını ve yapılandırma sorunlarını düzeltmek için uygulanacak değişiklikleri commit eder

echo "Mt. Ararat Outdoor TypeScript ve Yapılandırma Hatası Düzeltme Script'i"
echo "================================================================"

# Mevcut branch'i al
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Mevcut Branch: $CURRENT_BRANCH"

# Eksik tip tanımlamalarını düzelten fonksiyon
fix_typescript_errors() {
  echo "TypeScript hatalarını düzeltmeye çalışıyor..."
  
  # API rotalarındaki callback fonksiyonlarındaki parametre tiplerini düzelt
  find ./app/api -name "*.ts" -type f -exec sed -i 's/files\.filter(file => /files.filter((file: string) => /g' {} \;
  find ./app/api -name "*.ts" -type f -exec sed -i 's/jsonFiles\.map(file => /jsonFiles.map((file: string) => /g' {} \;
  
  # Dinamik rota yapılandırmalarını ekle
  find ./app/api -name "route.ts" -type f -exec sed -i '1s/^/export const dynamic = \'force-dynamic\';\nexport const revalidate = 0;\nexport const fetchCache = \'force-no-store\';\n\n/' {} \;
  
  # Tüm rotalar için generateStaticParams fonksiyonu ekle
  find ./app/api -name "route.ts" -type f -exec sed -i '/^export const dynamic/a\nexport async function generateStaticParams() {\n  return [];\n}\n' {} \;
  
  echo "TypeScript düzeltmeleri tamamlandı."
}

# next.config.js dosyasına output: 'standalone' ekleyen fonksiyon
fix_nextjs_config() {
  echo "Next.js yapılandırmasını düzeltmeye çalışıyor..."
  
  # output: 'standalone' ayarını ekle
  if ! grep -q "output:" ./next.config.js; then
    sed -i '/swcMinify: true,/a\  output: \'standalone\',\n' ./next.config.js
    echo "Next.js config dosyasına 'output: standalone' ayarı eklendi."
  else
    echo "Next.js config dosyası zaten güncel."
  fi
}

# Hata düzelticileri çalıştır
fix_typescript_errors
fix_nextjs_config

# Değişiklikleri ekle
echo "Değişiklikleri ekliyor..."
git add .

# Değişiklikleri commit et
echo "Değişiklikleri commit ediyor..."
git commit -m "Fix TypeScript and Next.js config errors: Add type annotations and dynamic API configurations"

# Uzak repoya push et
echo "Değişiklikleri push ediyor..."
git push origin $CURRENT_BRANCH

echo "İşlem tamamlandı! Şimdi Vercel deployment'i kontrol edebilirsiniz."