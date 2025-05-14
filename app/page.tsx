import { redirect } from 'next/navigation';

// Bu sayfa, kök dizin (/) için bir yönlendirme sağlar
export default function RootPage() {
  // Kullanıcıyı varsayılan dil olan tr'ye yönlendir
  redirect('/tr');
  
  // Not: Bu return ifadesi asla çalışmayacak çünkü redirect işlevi sayfayı hemen yönlendirir
  // Vercel serverless yapısı için ise null yerine bunu ekleyelim
  return (
    <div>
      <h1>Yönlendiriliyor...</h1>
      <p>Lütfen bekleyin, varsayılan dil sayfasına yönlendiriliyorsunuz.</p>
    </div>
  );
}