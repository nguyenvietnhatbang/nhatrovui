'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Zap, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

  // Close mobile sidebar whenever pathname changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

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
      {/* Crisp enterprise sidebar (Static on desktop, Drawer on mobile) */}
      <Sidebar
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100 relative">
        <Header onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)} />

        <main className="flex-1 overflow-y-auto bg-slate-100 p-2 sm:p-2.5 pb-20 md:pb-2.5">
          <div className="max-w-[1700px] mx-auto space-y-2">{children}</div>
        </main>

        {/* Mobile Bottom Navigation Bar (Phone Only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around text-[10px] font-semibold text-slate-600 shadow-lg">
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-sm transition-colors ${
              pathname === '/' ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tổng quan</span>
          </Link>

          <Link
            href="/rooms"
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-sm transition-colors ${
              pathname.startsWith('/rooms') ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Phòng</span>
          </Link>

          <Link
            href="/tenants"
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-sm transition-colors ${
              pathname.startsWith('/tenants') ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Khách</span>
          </Link>

          <Link
            href="/utilities"
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-sm transition-colors ${
              pathname === '/utilities' ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Điện nước</span>
          </Link>

          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-sm transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Thêm</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
