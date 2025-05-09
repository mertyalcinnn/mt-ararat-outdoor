"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface SimpleImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export default function SimpleImageUploader({
  onImageUpload,
  currentImageUrl = "",
  label = "Resim Yükle",
}: SimpleImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client tarafında render edildiğinden emin ol
  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  // Görüntü önişleme işlemi - burada kullanıcı bir dosya seçtiğinde çağrılır
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      setError("Dosya boyutu çok büyük. Lütfen 1MB'dan küçük bir dosya seçin.");
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Input değerini temizle
      }
      return;
    }

    setIsUploading(true);
    setError(null);

    // Aşağıdaki işlemi try-catch içine alarak olası hataları yakala
    try {
      // Dosyayı Base64'e çevir
      const base64String = await readFileAsBase64(file);

      // Önce state güncellemelerini tamamla
      setPreviewUrl(base64String);

      // Sonra dış fonksiyonu çağır, React render döngüsünü bozmamak için
      // bir timeout ile sar
      setTimeout(() => {
        onImageUpload(base64String);
      }, 0);
    } catch (error) {
      console.error("Dosya okuma/dönüştürme hatası:", error);
      setError("Dosya işlenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
      // Input alanını temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Dosyayı Base64'e çeviren yardımcı fonksiyon
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== "string") {
          return reject(new Error("Dosya okunamadı"));
        }
        resolve(event.target.result);
      };
      reader.onerror = () => {
        reject(new Error("Dosya okunamadı"));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    // Görüntü yüklenirken hata oluşursa
    if (e.currentTarget.src) {
      console.warn("Görüntü yüklenirken sorun oluştu", {
        src: e.currentTarget.src,
      });
    }

    // Hata mesajı göster
    setError("Görüntü yüklenemiyor. Farklı bir dosya deneyin.");

    // Önce URL'yi temizle
    setPreviewUrl("");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <div className="flex flex-col items-center">
        {/* Önizleme alanı */}
        {previewUrl ? (
          <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
            <img
              src={previewUrl}
              alt="Yüklenen Görsel"
              className="w-full h-full object-contain rounded-lg"
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className="relative w-full h-36 mb-3 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50">
            <div className="text-center p-4">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-1 text-sm text-slate-500">Görüntü yüklenmedi</p>
            </div>
          </div>
        )}

        {/* Yükleme butonu */}
        <div className="flex justify-center w-full">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />

          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="mt-2 inline-flex items-center px-4 py-2 border border-slate-300 
              rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white 
              hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors
              disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Yükleniyor...
              </>
            ) : (
              <>
                <svg
                  className="-ml-1 mr-2 h-5 w-5 text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {previewUrl ? "Resmi Değiştir" : "Resim Yükle"}
              </>
            )}
          </button>
        </div>

        {/* Hata mesajı */}
        {error && (
          <p className="mt-2 text-sm text-red-600 w-full text-center">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {error}
          </p>
        )}

        {/* Açıklama */}
        <p className="mt-2 text-xs text-slate-500 w-full text-center">
          PNG, JPG, WEBP veya GIF. Maksimum 1MB.
        </p>
      </div>
    </div>
  );
}
