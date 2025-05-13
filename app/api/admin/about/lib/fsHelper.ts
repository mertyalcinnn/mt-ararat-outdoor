import fs from 'fs';
import path from 'path';

// Dosya ve dizinlerle ilgili yardımcı fonksiyonlar
export const fsHelper = {
  // Dizin oluşturma (yoksa)
  ensureDirectory: (dirPath: string): boolean => {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
        console.log(`Dizin oluşturuldu: ${dirPath}`);
      }
      return true;
    } catch (error) {
      console.error(`Dizin oluşturma hatası (${dirPath}):`, error);
      return false;
    }
  },
  
  // Dosya yazma (izin sorunlarına karşı güvenli)
  writeFileSafe: (filePath: string, data: string): boolean => {
    try {
      // Önce dizinin varlığını kontrol et
      const dirPath = path.dirname(filePath);
      fsHelper.ensureDirectory(dirPath);
      
      // Eğer dosya varsa ve yazılabilir değilse, silmeyi dene
      if (fs.existsSync(filePath)) {
        try {
          fs.accessSync(filePath, fs.constants.W_OK);
        } catch (accessError) {
          console.log(`Dosya yazılabilir değil, siliniyor: ${filePath}`);
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error(`Dosya silinemedi: ${filePath}`, unlinkError);
            return false;
          }
        }
      }
      
      // Dosyayı yaz
      fs.writeFileSync(filePath, data, 'utf8');
      console.log(`Dosya başarıyla yazıldı: ${filePath}`);
      
      // Dosya izinlerini ayarla (Unix sistemlerde)
      if (process.platform !== 'win32') {
        fs.chmodSync(filePath, 0o644);
      }
      
      return true;
    } catch (error) {
      console.error(`Dosya yazma hatası (${filePath}):`, error);
      return false;
    }
  },
  
  // Dizin izinlerini kontrol et
  checkDirectoryPermissions: (dirPath: string): boolean => {
    try {
      if (!fs.existsSync(dirPath)) {
        return false;
      }
      
      // Dizin mi?
      const stats = fs.statSync(dirPath);
      if (!stats.isDirectory()) {
        return false;
      }
      
      // Yazma izni var mı?
      try {
        fs.accessSync(dirPath, fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    } catch (error) {
      console.error(`Dizin izinleri kontrol hatası (${dirPath}):`, error);
      return false;
    }
  }
};
