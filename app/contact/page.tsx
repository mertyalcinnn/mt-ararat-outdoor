import { redirect } from 'next/navigation';

// Bu sayfa, iletişim dizini (contact/) için bir yönlendirme sağlar
export default function ContactRedirectPage() {
  // Kullanıcıyı varsayılan dil olan tr'nin iletişim sayfasına yönlendir
  redirect('/tr/contact');
  
  // Not: Bu return ifadesi asla çalışmayacak çünkü redirect işlevi sayfayı hemen yönlendirir
  return null;
}