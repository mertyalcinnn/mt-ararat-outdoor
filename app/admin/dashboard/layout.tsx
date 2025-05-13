'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Oturum kontrolü
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    setIsLoggedIn(adminLoggedIn);
    
    if (!adminLoggedIn) {
      router.push('/admin/login');
    }
  }, [router]);

  // Oturum durumu belirlenmeden önce loading göster
  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Yükleniyor...</p>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa, çocuk bileşenleri render etme
  if (!isLoggedIn) {
    return null;
  }

  // Aktif menü öğesi kontrolü
  const isLinkActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    router.push('/admin/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white shadow rounded-r-xl overflow-hidden">
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-teal-600 to-teal-700">
            <h2 className="text-lg font-bold text-white">Mt.Ararat Admin</h2>
          </div>
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
            <nav className="flex-1 px-2 bg-white space-y-1">
              <Link 
                href="/admin/dashboard" 
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === '/admin/dashboard' ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fas fa-tachometer-alt mr-3 text-lg ${
                  pathname === '/admin/dashboard' ? 'text-teal-500' : 'text-slate-400'
                }`}></i>
                Dashboard
              </Link>
              
              <Link 
                href="/admin/dashboard/activities" 
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isLinkActive('/admin/dashboard/activities') ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fas fa-hiking mr-3 text-lg ${
                  isLinkActive('/admin/dashboard/activities') ? 'text-teal-500' : 'text-slate-400'
                }`}></i>
                Aktiviteler
              </Link>
              
              <Link 
                href="/admin/dashboard/about" 
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isLinkActive('/admin/dashboard/about') ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fas fa-info-circle mr-3 text-lg ${
                  isLinkActive('/admin/dashboard/about') ? 'text-teal-500' : 'text-slate-400'
                }`}></i>
                Hakkımızda
              </Link>
              
              <Link 
                href="/admin/dashboard/testimonials" 
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isLinkActive('/admin/dashboard/testimonials') ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fas fa-comments mr-3 text-lg ${
                  isLinkActive('/admin/dashboard/testimonials') ? 'text-teal-500' : 'text-slate-400'
                }`}></i>
                Yorumlar
              </Link>
              
              <Link 
                href="/admin/dashboard/contact" 
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isLinkActive('/admin/dashboard/contact') ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fas fa-address-card mr-3 text-lg ${
                  isLinkActive('/admin/dashboard/contact') ? 'text-teal-500' : 'text-slate-400'
                }`}></i>
                İletişim
              </Link>
              
              <Link 
                href="/admin/dashboard/media" 
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isLinkActive('/admin/dashboard/media') ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fas fa-images mr-3 text-lg ${
                  isLinkActive('/admin/dashboard/media') ? 'text-teal-500' : 'text-slate-400'
                }`}></i>
                Medya
              </Link>
              
              <Link 
                href="/admin/dashboard/settings/site" 
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isLinkActive('/admin/dashboard/settings') ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fas fa-cog mr-3 text-lg ${
                  isLinkActive('/admin/dashboard/settings') ? 'text-teal-500' : 'text-slate-400'
                }`}></i>
                Ayarlar
              </Link>
              
              <hr className="my-2 border-slate-200" />
              
              <button 
                onClick={handleLogout}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-rose-600 hover:bg-rose-50 hover:text-rose-900 w-full text-left"
              >
                <i className="fas fa-sign-out-alt mr-3 text-lg text-rose-400"></i>
                Çıkış Yap
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden">
          <div className="flex items-center justify-between bg-white shadow h-16 px-4">
            <h2 className="text-lg font-bold text-teal-600">Mt.Ararat Admin</h2>
            <button className="text-slate-600 focus:outline-none">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}