'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If login page, don't show sidebar and header
  if (pathname === '/login') {
    return <main className="min-h-screen w-full bg-slate-100">{children}</main>;
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
