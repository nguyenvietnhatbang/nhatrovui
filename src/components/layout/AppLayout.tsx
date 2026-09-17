'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const isAuth =
      localStorage.getItem('trocloud_auth') === 'true' ||
      sessionStorage.getItem('trocloud_auth') === 'true';

    if (!isAuth && pathname !== '/login') {
      setIsAuthenticated(false);
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  // If login page, don't show sidebar and header
  if (pathname === '/login') {
    return <main className="min-h-screen w-full bg-slate-100">{children}</main>;
  }

  // Prevent flash of dashboard if redirecting to login
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 text-xs text-slate-500 font-medium">
        Đang chuyển hướng đến trang đăng nhập...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-900 font-sans">
      {/* Crisp enterprise sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-100 p-2 sm:p-2.5">
          <div className="max-w-[1700px] mx-auto space-y-2">{children}</div>
        </main>
      </div>
    </div>
  );
}
