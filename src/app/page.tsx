'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Zap, Receipt } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatCards } from '@/components/dashboard/StatCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RoomStatusPie } from '@/components/dashboard/RoomStatusPie';
import { OverdueRoomsAlert } from '@/components/dashboard/OverdueRoomsAlert';
import { ExpiringContractsAlert } from '@/components/dashboard/ExpiringContractsAlert';
import { UrgentTicketsAlert } from '@/components/dashboard/UrgentTicketsAlert';

export default function DashboardPage() {
  const { selectedProperty } = useApp();

  return (
    <div className="space-y-2 pb-6">
      {/* Light ERP Page Header */}
      <div className="bg-white p-2.5 sm:p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-950 tracking-normal">
            {selectedProperty ? selectedProperty.name : 'Tổng Quan Chuỗi Nhà Trọ & Căn Hộ'}
          </h1>
          <span className="px-2 py-0.5 rounded-xs bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300">
            Kỳ 09/2026
          </span>
          {selectedProperty && (
            <span className="text-xs text-slate-600 hidden md:inline">
              ({selectedProperty.address})
            </span>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/utilities"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Chốt điện nước</span>
          </Link>

          <Link
            href="/invoices"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Receipt className="w-3.5 h-3.5 text-blue-700" />
            <span>Thu tiền (VietQR)</span>
          </Link>

          <Link
            href="/rooms"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <Building2 className="w-3.5 h-3.5 text-white" />
            <span>Sơ đồ phòng</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <StatCards />

      {/* Overdue Receivables Alert */}
      <OverdueRoomsAlert />

      {/* Charts Row: Stacked Bar 6 months + Donut status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <RoomStatusPie />
        </div>
      </div>

      {/* Actionable Alerts Row: Expiring contracts + Maintenance tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <ExpiringContractsAlert />
        <UrgentTicketsAlert />
      </div>
    </div>
  );
}
