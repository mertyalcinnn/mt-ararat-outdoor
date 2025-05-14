// Bu dosya API route'larının nasıl işleneceğini yapılandırır
export const dynamic = 'force-dynamic'; // API route'ları her zaman dinamik işlenir
export const revalidate = 0; // Her istek için yeniden doğrulama yap
export const fetchCache = 'force-no-store'; // Önbellekleme yok