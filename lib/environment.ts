/**
 * Vercel ortamını ve üretim ortamını algılayan yardımcı fonksiyonlar
 */

/**
 * Vercel ortamında çalışıp çalışmadığımızı kontrol eder
 * @returns Vercel ortamında çalışıyorsa true
 */
export function isVercelEnvironment(): boolean {
  return process.env.VERCEL === '1';
}

/**
 * Geliştirme ortamında çalışıp çalışmadığımızı kontrol eder
 * @returns Geliştirme ortamında çalışıyorsa true
 */
export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Üretim ortamında çalışıp çalışmadığımızı kontrol eder
 * @returns Üretim ortamında çalışıyorsa true
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Vercel üretim ortamında çalışıp çalışmadığımızı kontrol eder
 * @returns Vercel üretim ortamında çalışıyorsa true
 */
export function isVercelProduction(): boolean {
  return isVercelEnvironment() && isProductionEnvironment();
}

/**
 * Yerel geliştirme ortamında çalışıp çalışmadığımızı kontrol eder
 * @returns Yerel geliştirme ortamında çalışıyorsa true
 */
export function isLocalDevelopment(): boolean {
  return !isVercelEnvironment() && isDevelopmentEnvironment();
}
