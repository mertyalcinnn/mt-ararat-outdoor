'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Admin paneli ana sayfasından login sayfasına yönlendir
    router.push('/admin/login');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-3">Yönlendiriliyor...</p>
    </div>
  );
}
