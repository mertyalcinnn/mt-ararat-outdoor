"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export default function ImageUploader({
  onImageUpload,
  currentImageUrl = "",
  label = "Resim Yükle",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [clientReady, setClientReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client tarafında render edildiğinden emin ol
  useEffect(() => {
    setClientReady(true);
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        "Dosya boyutu çok büyük. Lütfen 10MB'dan küçük bir dosya seçin."
      );
      return;
    }

    // Önizleme oluştur
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);

    // Yükleme başlat
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Dosya yüklenemedi");
      }

      const data = await response.json();

      // URL'yi parent component'e bildir
      let imageUrl = data.url;

      // Blob URL'leri temizle
      if (imageUrl && imageUrl.includes("blob:")) {
        imageUrl = imageUrl.replace(/blob:[^/]+\//, "");
        console.log("Temizlenmiş URL:", imageUrl);
      }

      onImageUpload(imageUrl);
    } catch (error) {
      console.error("Yükleme hatası:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Dosya yüklenirken bir hata oluştu"
      );
      // Hata durumunda önizlemeyi kaldır
      if (!currentImageUrl) {
        setPreviewUrl("");
      } else {
        setPreviewUrl(currentImageUrl);
      }
    } finally {
      setIsUploading(false);
      // Input alanını temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Görüntü hata yakalama işleyicisi
  const handleImageError = () => {
    console.error("Görüntü yükleme hatası:", previewUrl);
    setUploadError("Görüntü gösterilirken hata oluştu");
    // Doğrudan state güncellemesi yerine timeout kullanarak
    // React işlem sırasını bozmamak için güvenli gecikme ekleyelim
    setTimeout(() => {
      setPreviewUrl("");
    }, 0);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Client tarafında render edilene kadar bekle
  if (!clientReady) {
    return (
      <div className="w-full h-28 bg-slate-100 rounded-lg animate-pulse"></div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <div className="flex flex-col items-center">
        {/* Önizleme alanı */}
        {previewUrl ? (
          <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
            <Image
              src={previewUrl}
              alt="Yüklenen Görsel"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              style={{ objectFit: "contain" }}
              className="rounded-lg"
              onError={handleImageError}
              loading="eager"
              unoptimized={
                previewUrl.startsWith("blob:") || previewUrl.startsWith("data:")
              }
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
            className={`mt-2 inline-flex items-center px-4 py-2 border border-slate-300 
              rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white 
              hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors
              ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
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
        {uploadError && (
          <p className="mt-2 text-sm text-red-600 w-full text-center">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {uploadError}
          </p>
        )}

        {/* Açıklama */}
        <p className="mt-2 text-xs text-slate-500 w-full text-center">
          PNG, JPG, WEBP veya GIF. Maksimum 10MB.
        </p>
      </div>
    </div>
  );
}
