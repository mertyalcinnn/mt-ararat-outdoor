'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Kullanıcının giriş yapmış olup olmadığını kontrol et
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    
    // Eğer giriş yapmışsa dashboard'a, yapmamışsa login sayfasına yönlendir
    if (isLoggedIn === 'true') {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100">
      <div className="flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
      <h2 className="text-xl font-medium text-slate-700 mb-2">Mt. Ararat Admin</h2>
      <p className="text-slate-500">Yönlendiriliyor...</p>
    </div>
  );
}
