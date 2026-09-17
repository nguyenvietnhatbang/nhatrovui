'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Users,
  FileText,
  Zap,
  Receipt,
  Wrench,
  BookOpen,
  Settings,
  LayoutDashboard,
  LogOut,
  X,
  PanelLeftClose,
} from 'lucide-react';

interface NavGroup {
  groupName: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }[];
}

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      groupName: 'KINH DOANH',
      items: [
        { label: 'Tổng quan', href: '/', icon: LayoutDashboard },
        { label: 'Danh sách phòng', href: '/rooms', icon: Building2 },
        { label: 'Khách thuê', href: '/tenants', icon: Users },
        { label: 'Hợp đồng', href: '/contracts', icon: FileText },
      ],
    },
    {
      groupName: 'VẬN HÀNH',
      items: [
        { label: 'Chốt điện nước', href: '/utilities', icon: Zap },
        { label: 'Sự cố & Bảo trì', href: '/maintenance', icon: Wrench },
      ],
    },
    {
      groupName: 'TÀI CHÍNH & BÁO CÁO',
      items: [
        { label: 'Hóa đơn & VietQR', href: '/invoices', icon: Receipt },
        { label: 'Sổ quỹ thu chi', href: '/cashbook', icon: BookOpen },
      ],
    },
    {
      groupName: 'HỆ THỐNG',
      items: [
        { label: 'Quản trị cơ sở', href: '/settings', icon: Settings },
      ],
    },
  ];

  const renderNavContent = (isMobile = false) => (
    <>
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight text-sm leading-none">
              TroCloud ERP
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">trocloud.vn</div>
          </div>
        </div>

        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            title="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button className="text-slate-400 hover:text-slate-600 p-1" title="Thu gọn">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Menu Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.groupName}>
            <div className="px-2.5 mb-1.5 text-[10px] font-bold text-slate-400 tracking-wider">
              {group.groupName}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isMobile && onCloseMobile) onCloseMobile();
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 md:py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-950 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer (Matching Reference Image) */}
      <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
            AD
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 leading-tight">Admin</div>
            <div className="text-[10px] text-slate-400">Super admin</div>
          </div>
        </div>

        <Link
          href="/login"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('trocloud_auth');
              sessionStorage.removeItem('trocloud_auth');
            }
            if (isMobile && onCloseMobile) onCloseMobile();
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-slate-200 flex-col shrink-0 select-none text-[13px] text-slate-700 h-screen">
        {renderNavContent(false)}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />

          {/* Drawer sidebar */}
          <aside className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 select-none">
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
