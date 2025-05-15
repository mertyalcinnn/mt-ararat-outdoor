"use client";

import { useState, useRef, useEffect } from "react";

import OptimizedImage from "./OptimizedImage";

// Görsel önizleme bileşeni
const ImagePreview = ({ imageUrl }: { imageUrl: string }) => {
  if (!imageUrl) return null;

  return (
    <div className="px-4 pt-4">
      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
        <OptimizedImage
          src={imageUrl}
          alt="Seçilen Görsel"
          width={300}
          height={200}
          className="w-full h-full object-contain rounded-lg"
          objectFit="contain"
        />

        {/* URL bilgisi göster */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
          {imageUrl}
        </div>
      </div>
    </div>
  );
};

type MediaItem = {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  type: string;
};

interface AdvancedImageUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  currentImageUrl?: string;
  label?: string;
}

export default function AdvancedImageUploader({
  onImageSelect,
  currentImageUrl = "",
  label = "Görsel Ekle",
}: AdvancedImageUploaderProps) {
  // Tab ve seçili resim state'leri
  const [activeTab, setActiveTab] = useState<"upload" | "url" | "gallery">(
    "upload"
  );
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<MediaItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Sürükle-bırak durumunu takip etmek için
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Client tarafında render edildiğinden emin ol
  useEffect(() => {
    setClientReady(true);
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  // Galeri sekmesi açıldığında resimleri yükle
  useEffect(() => {
    if (activeTab === "gallery" && galleryImages.length === 0) {
      loadGalleryImages();
    }
  }, [activeTab]);

  // Sürükle-bırak olay yöneticileri
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Otomatik olarak upload sekmesine geç
    setActiveTab("upload");

    // Dosyayı al
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Dosya türünü kontrol et
      if (!file.type.startsWith("image/")) {
        setError("Lütfen sadece görsel dosyası yüleyin (jpeg, png, gif, vb.).");
        return;
      }

      // Dosya boyutunu kontrol et
      if (file.size > 10 * 1024 * 1024) {
        setError(
          "Dosya boyutu çok büyük. Lütfen 10MB'dan küçük bir dosya seçin."
        );
        return;
      }

      // Dosyayı yükle
      uploadFile(file);
    }
  };

  // Galeri resimlerini yükle
  const loadGalleryImages = async () => {
    setIsLoadingGallery(true);
    setError(null);

    try {
      console.log("Galeri resimleri için API isteği yapılıyor");
      const response = await fetch("/api/admin/media", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      // Yanıtın içeriğini text olarak al
      const responseText = await response.text();

      // JSON olarak ayrıştırmayı dene
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "API yanıtı JSON değil:",
          responseText.slice(0, 100) + "..."
        );
        throw new Error(
          `Galeri için geçersiz yanıt: ${responseText.slice(0, 50)}...`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: Galeri resimleri yüklenemedi`
        );
      }

      console.log("Galeri resimleri başarıyla yüklendi:", data.length);
      setGalleryImages(data);
    } catch (err) {
      console.error("Galeri resimleri yüklenirken hata (detaylı):", err);
      setError(
        err instanceof Error
          ? err.message
          : "Galeri resimleri yüklenemedi. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setIsLoadingGallery(false);
    }
  };

  // Dosya yükleme fonksiyonu (hem sürükle-bırak hem de seçim için)
  const uploadFile = async (file: File) => {
    // Geçici önizleme
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);

    // Yükleme başlat
    setIsUploading(true);
    setError(null);

    try {
      console.log(
        "Dosya yükleniyor:",
        file.name,
        file.type,
        `${(file.size / 1024).toFixed(2)}KB`
      );

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      // HTTP durum kodunu kontrol et
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Dosya boyutu çok büyük.");
        }

        // Yanıtın içeriğini text olarak al
        const responseText = await response.text();
        console.error("API yanıtı (hata):", responseText);

        try {
          const errorData = JSON.parse(responseText);
          throw new Error(
            errorData.error || `HTTP ${response.status}: Dosya yüklenemedi`
          );
        } catch (jsonError) {
          throw new Error(
            `HTTP ${response.status}: Sunucudan geçersiz yanıt alındı`
          );
        }
      }

      // Yanıtın içeriğini text olarak al
      const responseText = await response.text();

      // JSON olarak ayrıştırmayı dene
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Yükleme başarılı, sunucu yanıtı:", data);
      } catch (parseError) {
        console.error(
          "API yanıtı JSON değil:",
          responseText.slice(0, 100) + "..."
        );
        throw new Error(
          `API geçersiz yanıt döndürdü: ${responseText.slice(0, 50)}...`
        );
      }

      // URL'yi parent component'e bildir
      if (data.fullUrl) {
        // API tam URL döndürüyorsa, onu kullan (Next.js 13+ için daha güvenli)
        const imageUrl = data.fullUrl;
        console.log("Tam URL kullanılıyor:", imageUrl);

        // URL'deki blob: önekini temizleyelim
        if (imageUrl.includes("blob:")) {
          const cleanUrl = imageUrl.replace(/blob:[^/]+\//, "");
          console.log("Temizlenmiş URL:", cleanUrl);
          onImageSelect(cleanUrl);
          setPreviewUrl(cleanUrl);
        } else {
          onImageSelect(imageUrl);
          setPreviewUrl(imageUrl);
        }
      } else if (data.url) {
        // Göreli URL'yi kullan
        const imageUrl = data.url;
        console.log("Göreli URL kullanılıyor:", imageUrl);

        // URL'deki blob: önekini temizleyelim
        if (imageUrl.includes("blob:")) {
          const cleanUrl = imageUrl.replace(/blob:[^/]+\//, "");
          console.log("Temizlenmiş URL:", cleanUrl);
          onImageSelect(cleanUrl);
          setPreviewUrl(cleanUrl);
        } else {
          onImageSelect(imageUrl);
          setPreviewUrl(imageUrl);
        }
      } else {
        throw new Error("Sunucu geçerli bir URL döndürmedi");
      }
    } catch (error) {
      console.error("Yükleme hatası (detaylı):", error);
      setError(
        error instanceof Error
          ? error.message
          : "Dosya yüklenirken bir hata oluştu"
      );
      // Hata durumunda önizlemeyi kaldır veya eski haline getir
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

  // PC'den dosya yükleme
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Dosya boyutu çok büyük. Lütfen 10MB'dan küçük bir dosya seçin."
      );
      return;
    }

    // Dosyayı yükleme fonksiyonuna gönder
    uploadFile(file);
  };

  // URL ile resim ekleme
  const handleUrlSubmit = async () => {
    if (!imageUrl) {
      setError("Lütfen bir URL girin");
      return;
    }

    setError(null);
    setIsUploading(true); // Yükleme durumunu başlat

    try {
      // URL formatını kontrol et
      const url = new URL(imageUrl);

      // Görsel var mı kontrol et - bir resim yüklemeyi dene
      console.log("URL ile görsel erişimi kontrol ediliyor:", imageUrl);

      // Görsel ön yükleme yaparak kontrol etmeye çalış
      const img = new Image();

      // Bir Promise ile resmin yüklenip yüklenmediğini kontrol edelim
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log("Görsel başarıyla yüklendi");
          resolve("success");
        };

        img.onerror = () => {
          reject(new Error("Görsele erişilemedi veya geçersiz görsel formatı"));
        };

        // Src ataması en son yapılmalı, önce event listener'lar tanımlanmalı
        img.src = imageUrl;
      });

      // Başarılıysa URL'yi parent component'e bildir
      onImageSelect(imageUrl);
      setPreviewUrl(imageUrl);
    } catch (error) {
      console.error("URL görsel hatası:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Geçersiz URL formatı. Lütfen tam URL adresini girin (örn: https://example.com/image.jpg)"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Galeriden resim seçme
  const handleGallerySelect = (image: MediaItem) => {
    onImageSelect(image.url);
    setPreviewUrl(image.url);
  };

  // Dosya seçme dialog'unu aç
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Görsel hata yakalama işleyicisi
  const handleImageError = () => {
    console.error("Görüntü yükleme hatası:", previewUrl);

    // Hata mesajı göster
    setError(
      `Görüntü yüklenemedi: ${previewUrl}. Bu sorun, yükleme işlemi sırasında oluşmuş olabilir.`
    );

    // Görseli temizleme işlemi
    if (previewUrl && previewUrl !== currentImageUrl) {
      setPreviewUrl("");
      // onImageSelect('');  // Bunu kapatıyoruz çünkü kullanıcı formunu boşaltır
    } else if (currentImageUrl) {
      setPreviewUrl(currentImageUrl); // Mevcut bir görsel varsa koru
    } else {
      setPreviewUrl("");
    }
  };

  // Client tarafında render edilene kadar bekle
  if (!clientReady) {
    return (
      <div className="w-full h-28 bg-gray-100 rounded-lg animate-pulse"></div>
    );
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Sekme Başlıkları */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === "upload"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          Bilgisayardan
        </button>

        <button
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === "url"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("url")}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            ></path>
          </svg>
          URL ile
        </button>

        <button
          className={`px-4 py-2 text-sm font-medium flex items-center ${
            activeTab === "gallery"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("gallery")}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          Galeriden
        </button>
      </div>

      {/* Önizleme Alanı */}
      {previewUrl && <ImagePreview imageUrl={previewUrl} />}

      {/* Tab İçerikleri */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{label}</h3>

        {/* Bilgisayardan Yükleme */}
        {activeTab === "upload" && (
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              ref={fileInputRef}
            />

            {/* Sürükle-Bırak Alanı */}
            <div
              ref={dropAreaRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer mb-3 transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
              onClick={triggerFileInput}
            >
              <svg
                className="w-10 h-10 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="text-sm text-gray-600">
                {isDragging
                  ? "Görseli Buraya Bırakın"
                  : "Görsel Seçmek İçin Tıklayın veya Sürükleyin"}
              </p>
            </div>

            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 
                rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white 
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-500"
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
                    className="w-5 h-5 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  Dosya Seç
                </>
              )}
            </button>

            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG, WEBP, GIF veya SVG. Maksimum 10MB.
            </p>
          </div>
        )}

        {/* URL ile Ekleme */}
        {activeTab === "url" && (
          <div>
            <div className="flex">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 border border-gray-300 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Ekle
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Tam URL adresini girin. Görsel erişilebilir olmalıdır.
            </p>
          </div>
        )}

        {/* Galeriden Seçme */}
        {activeTab === "gallery" && (
          <div>
            {isLoadingGallery ? (
              <div className="flex justify-center py-8">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500"
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
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Henüz yüklenmiş görsel bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative border rounded overflow-hidden cursor-pointer ${
                      previewUrl === image.url
                        ? "ring-2 ring-blue-500"
                        : "hover:opacity-80"
                    }`}
                    onClick={() => handleGallerySelect(image)}
                  >
                    <div className="aspect-square relative">
                      {/* Next.js Image yerine normal img kullanalım */}
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(
                            `Failed to load gallery image: ${image.url}`
                          );
                          e.currentTarget.src = "/images/placeholder-image.jpg";
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={loadGalleryImages}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Galeriyi Yenile
            </button>
          </div>
        )}

        {/* Hata Mesajı */}
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}
