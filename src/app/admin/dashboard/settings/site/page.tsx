"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SimpleImageUploader from "@/components/SimpleImageUploader";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  logoSmall: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  // Ayarları yükle
  useEffect(() => {
    // Admin girişini kontrol et
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      router.push("/admin/login");
      return;
    }

    // Site ayarlarını yükle - daha güvenli hata işleme
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/settings/site");

        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();
        console.log("Yüklenen ayarlar:", data);

        // Eğer data null veya undefined ise varsayılan bir obje kullan
        if (!data) {
          setSaveMessage({
            type: "error",
            text: "Ayarlar yüklenemedi. Varsayılan ayarlar kullanılıyor.",
          });
          return;
        }

        setSettings(data);
      } catch (err) {
        console.error("Site ayarları yüklenirken hata:", err);
        setSaveMessage({
          type: "error",
          text: "Site ayarları yüklenirken bir hata oluştu. Sayfayı yenilemeyi deneyin.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  const handleInputChange = (field: keyof SiteSettings, value: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSocialMediaChange = (
    platform: keyof SiteSettings["socialMedia"],
    value: string
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      socialMedia: {
        ...settings.socialMedia,
        [platform]: value,
      },
    });
  };

  const handleLogoUpload = (imageUrl: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      logo: imageUrl,
    });
  };

  const handleSmallLogoUpload = (imageUrl: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      logoSmall: imageUrl,
    });
  };

  const handleFaviconUpload = (imageUrl: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      favicon: imageUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setSaveMessage(null);

    // Logo ve logoSmall değerlerini kontrol edelim
    const updatedSettings = { ...settings };

    if (
      !updatedSettings.logo ||
      updatedSettings.logo === "/images/logo-small.png"
    ) {
      updatedSettings.logo = "/images/placeholder-image.jpg";
    }

    if (
      !updatedSettings.logoSmall ||
      updatedSettings.logoSmall === "/images/logo-small.png"
    ) {
      updatedSettings.logoSmall = "/images/placeholder-image.jpg";
    }

    // Favicon kontrolü
    if (!updatedSettings.favicon) {
      updatedSettings.favicon = "/favicon.ico";
    }

    console.log("Kaydedilecek ayarlar:", updatedSettings);

    try {
      console.log("Gönderilen ayarlar:", updatedSettings);

      const response = await fetch("/api/admin/settings/site", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });

      const result = await response.json();
      console.log("API yanıtı:", result);

      if (response.ok) {
        // Başarı mesajını göster
        setSaveMessage({
          type: "success",
          text: "Site ayarları başarıyla kaydedildi!",
        });

        // Kısa bir süre bekle ve sayfayı yenile (JavaScript yönlendirmesi yerine)
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 1500);
      } else {
        setSaveMessage({
          type: "error",
          text: `Hata: ${result.error || "Bilinmeyen bir hata oluştu"}`,
        });
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      setSaveMessage({
        type: "error",
        text: "Bağlantı hatası! Lütfen internet bağlantınızı kontrol edin.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
        <h2 className="text-xl font-medium text-slate-700 mb-2">
          Yükleniyor...
        </h2>
        <p className="text-slate-500">Lütfen bekleyin, ayarlar yükleniyor.</p>
      </div>
    );
  }

  // Eğer settings yoksa default bir obje oluştur
  if (!settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-slate-100 p-8">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center rounded-full bg-red-100 p-3 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Hata: Ayarlar Yüklenemedi
            </h1>
            <p className="text-slate-600 mb-4">
              Site ayarları yüklenirken bir sorun oluştu. Aşağıdaki seçenekleri
              deneyebilirsiniz:
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Sayfayı Yenile
            </button>

            <button
              onClick={() => router.push("/admin/dashboard")}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Dashboard'a Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <i className="fas fa-cog text-teal-500 mr-3"></i>
            Site Ayarları
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Genel site bilgilerini ve sosyal medya hesaplarını yönetin
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-md text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm transition-colors"
          >
            <i className="fas fa-arrow-left mr-1.5"></i> Dashboard
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        key="settings-form"
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Temel Bilgiler */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center">
              <i className="fas fa-info-circle text-teal-500 mr-2"></i>
              Temel Bilgiler
            </h2>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Site Adı
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-globe text-slate-400"></i>
                </div>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    handleInputChange("siteName", e.target.value)
                  }
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-slate-300 rounded-md"
                  placeholder="Site adını girin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Site Açıklaması
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                  <i className="fas fa-quote-left text-slate-400"></i>
                </div>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) =>
                    handleInputChange("siteDescription", e.target.value)
                  }
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-slate-300 rounded-md"
                  rows={2}
                  placeholder="Site açıklamasını girin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                İletişim E-posta
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-slate-400"></i>
                </div>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    handleInputChange("contactEmail", e.target.value)
                  }
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-slate-300 rounded-md"
                  placeholder="info@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                İletişim Telefon
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-phone text-slate-400"></i>
                </div>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    handleInputChange("contactPhone", e.target.value)
                  }
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-slate-300 rounded-md"
                  placeholder="+90 555 123 4567"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sosyal Medya */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center">
              <i className="fas fa-share-alt text-emerald-500 mr-2"></i>
              Sosyal Medya
            </h2>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Instagram
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fab fa-instagram text-slate-400"></i>
                </div>
                <input
                  type="url"
                  value={settings.socialMedia.instagram}
                  onChange={(e) =>
                    handleSocialMediaChange("instagram", e.target.value)
                  }
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-slate-300 rounded-md"
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Facebook
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fab fa-facebook text-slate-400"></i>
                </div>
                <input
                  type="url"
                  value={settings.socialMedia.facebook}
                  onChange={(e) =>
                    handleSocialMediaChange("facebook", e.target.value)
                  }
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-slate-300 rounded-md"
                  placeholder="https://facebook.com/pagename"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Twitter
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fab fa-twitter text-slate-400"></i>
                </div>
                <input
                  type="url"
                  value={settings.socialMedia.twitter}
                  onChange={(e) =>
                    handleSocialMediaChange("twitter", e.target.value)
                  }
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-slate-300 rounded-md"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logolar bölümü */}
        <div className="p-6 pt-0 mt-5 border-t border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <i className="fas fa-image text-amber-500 mr-2"></i>
            Logo ve Favicon
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <SimpleImageUploader
                onImageUpload={handleLogoUpload}
                currentImageUrl={settings.logo}
                label="Ana Logo"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <SimpleImageUploader
                onImageUpload={handleSmallLogoUpload}
                currentImageUrl={settings.logoSmall}
                label="Küçük Logo (Mobil)"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <SimpleImageUploader
                onImageUpload={handleFaviconUpload}
                currentImageUrl={settings.favicon}
                label="Favicon"
              />
            </div>
          </div>
        </div>

        {/* Kaydet butonu */}
        <div className="p-6 bg-slate-50 flex items-center justify-between border-t border-slate-200">
          {saveMessage && (
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-md shadow-sm ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <i
                className={`fas ${
                  saveMessage.type === "success"
                    ? "fa-check-circle text-green-500"
                    : "fa-exclamation-circle text-red-500"
                } mr-1.5`}
              ></i>
              <span>{saveMessage.text}</span>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="inline-flex justify-center py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors
                ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
