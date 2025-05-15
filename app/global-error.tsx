'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Hata bilgisini konsola yazdır
  console.error('Global Error Handler:', error);
  
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Bir Sorun Oluştu</h2>
            <p className="text-gray-700 mb-4">Mt. Ararat Outdoor web sitesi şu anda bakım modunda. Çok kısa süre içerisinde tekrar hizmetinizde olacağız.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
                <p className="font-mono text-sm text-gray-800">{error.message}</p>
                {error.stack && (
                  <pre className="font-mono text-xs text-gray-700 mt-2 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
                {error.digest && <p className="font-mono text-sm text-gray-600 mt-2">Digest: {error.digest}</p>}
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Ana Sayfaya Dön
              </button>
              <button
                onClick={() => reset()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}