import { redirect } from 'next/navigation';

// Bu sayfa, aktiviteler dizini (activities/) için bir yönlendirme sağlar
export default function ActivitiesRedirectPage() {
  // Kullanıcıyı varsayılan dil olan tr'nin aktiviteler sayfasına yönlendir
  redirect('/tr/activities');
  
  // Not: Bu return ifadesi asla çalışmayacak çünkü redirect işlevi sayfayı hemen yönlendirir
  return null;
}