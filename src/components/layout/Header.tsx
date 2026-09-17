'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, RefreshCw, Plus, Building2, Check, Menu } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { properties, selectedPropertyId, setSelectedPropertyId, selectedProperty } = useApp();
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  // Derive module title from pathname
  const getBreadcrumb = () => {
    switch (pathname) {
      case '/':
        return { parent: 'Tổng quan', current: 'Báo cáo KPI' };
      case '/rooms':
        return { parent: 'Phòng trọ', current: 'Danh sách' };
      case '/tenants':
        return { parent: 'Khách hàng', current: 'Danh sách' };
      case '/contracts':
        return { parent: 'Hợp đồng', current: 'Danh sách' };
      case '/utilities':
        return { parent: 'Điện nước', current: 'Chốt chỉ số' };
      case '/invoices':
        return { parent: 'Hóa đơn & Thu tiền', current: 'Danh sách' };
      case '/maintenance':
        return { parent: 'Bảo trì sự cố', current: 'Danh sách' };
      case '/cashbook':
        return { parent: 'Sổ quỹ', current: 'Thu chi' };
      case '/settings':
        return { parent: 'Hệ thống', current: 'Cấu hình cơ sở' };
      default:
        return { parent: 'Hệ thống', current: 'Danh sách' };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Hamburger (Mobile) + Breadcrumb with dropdown */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="Mở danh mục menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-slate-400 text-xs font-normal hidden sm:inline">{breadcrumb.parent} /</span>

        {/* Dropdown for Branch Selection */}
        <div className="relative min-w-0">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer max-w-[150px] sm:max-w-[240px] md:max-w-none"
          >
            <span className="truncate">{selectedProperty ? selectedProperty.name : 'Tất cả cơ sở'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isBranchDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsBranchDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-md shadow-lg border border-slate-200 z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-75">
                <button
                  onClick={() => {
                    setSelectedPropertyId(null);
                    setIsBranchDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded text-left cursor-pointer ${
                    selectedPropertyId === null
                      ? 'bg-slate-100 font-bold text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Toàn bộ cơ sở (Toàn chuỗi)</span>
                  {selectedPropertyId === null && <Check className="w-3.5 h-3.5 text-slate-900" />}
                </button>

                <div className="border-t border-slate-100 my-1 pt-1">
                  {properties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => {
                        setSelectedPropertyId(prop.id);
                        setIsBranchDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded text-left cursor-pointer ${
                        selectedPropertyId === prop.id
                          ? 'bg-slate-100 font-bold text-slate-900'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-800">{prop.name}</div>
                        <div className="text-[10px] text-slate-400">{prop.totalRooms} phòng • {prop.city}</div>
                      </div>
                      {selectedPropertyId === prop.id && <Check className="w-3.5 h-3.5 text-slate-900" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Actions: Sync & "+ Tạo" Button (Matching AnViet CRM) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          title="Đồng bộ dữ liệu"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Đồng bộ</span>
        </button>

        {/* Global "+ Tạo" black button */}
        <button
          onClick={() => {
            if (pathname === '/tenants') {
              window.dispatchEvent(new CustomEvent('open-add-tenant-modal'));
            } else if (pathname === '/rooms') {
              window.dispatchEvent(new CustomEvent('open-add-room-modal'));
            } else if (pathname === '/utilities') {
              window.dispatchEvent(new CustomEvent('generate-invoices-event'));
            } else if (pathname === '/invoices') {
              window.dispatchEvent(new CustomEvent('generate-invoices-event'));
            } else if (pathname === '/maintenance') {
              window.dispatchEvent(new CustomEvent('open-add-ticket-modal'));
            } else {
              router.push('/tenants');
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo</span>
        </button>
      </div>
    </header>
  );
}
