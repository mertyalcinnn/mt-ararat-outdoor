import { redirect } from 'next/navigation';

// Bu sayfa, hakkımızda dizini (about/) için bir yönlendirme sağlar
export default function AboutRedirectPage() {
  // Kullanıcıyı varsayılan dil olan tr'nin hakkımızda sayfasına yönlendir
  redirect('/tr/about');
  
  // Not: Bu return ifadesi asla çalışmayacak çünkü redirect işlevi sayfayı hemen yönlendirir
  return null;
}