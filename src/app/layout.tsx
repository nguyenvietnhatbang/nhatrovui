import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TroMaster PMS - Quản Lý Nhà Trọ & Căn Hộ Dịch Vụ',
  description: 'Nền tảng quản lý vận hành chuỗi nhà trọ, căn hộ dịch vụ, sinh mã VietQR Napas 247 tự động.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`h-full antialiased ${inter.variable}`}>
      <body className="h-full overflow-hidden text-slate-900 bg-slate-100 font-sans">
        <AppProvider>
          <AppLayout>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  );
}
