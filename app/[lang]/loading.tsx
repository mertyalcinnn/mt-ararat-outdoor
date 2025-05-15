"use client";

// Dil sayfaları için loading component'i
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Yükleniyor...</h2>
        <p className="text-gray-500">Lütfen bekleyin, sayfanız hazırlanıyor</p>
      </div>
    </div>
  );
}