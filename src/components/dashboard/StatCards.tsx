'use client';

import React from 'react';
import { DollarSign, Building, AlertTriangle, Wallet } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/formatters';

export function StatCards() {
  const { dashboardStats } = useApp();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {/* 1. Revenue Card */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Doanh Thu Đã Thu
          </span>
          <div className="w-6 h-6 rounded-xs bg-blue-50 text-blue-800 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-1.5">
          <div className="text-xl font-bold text-slate-950">
            {formatCurrency(dashboardStats.monthlyCollectedRevenue)}
          </div>
          <div className="mt-0.5 flex items-center justify-between text-xs text-slate-700">
            <span>Dự kiến: {formatCurrency(dashboardStats.monthlyExpectedRevenue)}</span>
            <span className="font-bold text-emerald-800">
              {dashboardStats.collectionRate}%
            </span>
          </div>
        </div>

        <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-xs overflow-hidden">
          <div
            className="bg-blue-700 h-full"
            style={{ width: `${Math.min(100, dashboardStats.collectionRate)}%` }}
          />
        </div>
      </div>

      {/* 2. Occupancy Rate */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Tỷ Lệ Lấp Đầy
          </span>
          <div className="w-6 h-6 rounded-xs bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Building className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-1.5">
          <div className="text-xl font-bold text-slate-950 flex items-baseline gap-1.5">
            <span>{dashboardStats.occupancyRate}%</span>
            <span className="text-xs font-semibold text-slate-700">
              ({dashboardStats.occupiedRooms + dashboardStats.overdueRooms}/{dashboardStats.totalRooms} phòng)
            </span>
          </div>

          <div className="mt-0.5 flex items-center gap-2 text-xs font-medium">
            <span className="text-emerald-800">● {dashboardStats.occupiedRooms} đang ở</span>
            <span className="text-slate-700">○ {dashboardStats.vacantRooms} trống</span>
            {dashboardStats.reservedRooms > 0 && (
              <span className="text-amber-800">● {dashboardStats.reservedRooms} cọc</span>
            )}
          </div>
        </div>

        <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-xs overflow-hidden">
          <div
            className="bg-emerald-700 h-full"
            style={{ width: `${Math.min(100, dashboardStats.occupancyRate)}%` }}
          />
        </div>
      </div>

      {/* 3. Overdue Receivables */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
            Công Nợ Quá Hạn
          </span>
          <div className="w-6 h-6 rounded-xs bg-rose-50 text-rose-800 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-1.5">
          <div className="text-xl font-bold text-rose-700">
            {formatCurrency(dashboardStats.overdueAmount)}
          </div>
          <div className="mt-0.5 flex items-center justify-between text-xs">
            <span className="font-bold text-rose-800">
              {dashboardStats.overdueRooms} phòng chưa thanh toán
            </span>
          </div>
        </div>

        <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-xs overflow-hidden">
          <div
            className="bg-rose-700 h-full"
            style={{
              width: `${
                dashboardStats.monthlyExpectedRevenue > 0
                  ? Math.min(100, (dashboardStats.overdueAmount / dashboardStats.monthlyExpectedRevenue) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* 4. Net Operating Profit */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Lợi Nhuận Ròng
          </span>
          <div className="w-6 h-6 rounded-xs bg-indigo-50 text-indigo-800 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-1.5">
          <div className="text-xl font-bold text-slate-950">
            {formatCurrency(dashboardStats.netProfit)}
          </div>
          <div className="mt-0.5 text-xs text-slate-700">
            Chi phí: {formatCurrency(dashboardStats.monthlyOperatingExpenses)}
          </div>
        </div>

        <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-xs overflow-hidden">
          <div className="bg-indigo-700 h-full w-[85%]" />
        </div>
      </div>
    </div>
  );
}
