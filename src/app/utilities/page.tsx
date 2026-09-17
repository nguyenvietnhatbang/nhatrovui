'use client';

import React, { useState } from 'react';
import { Zap, Calendar, DollarSign, Info, Droplets } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MeterReadingTable } from '@/components/utilities/MeterReadingTable';
import { formatCurrency } from '@/lib/formatters';

export default function UtilitiesPage() {
  const { selectedProperty, properties } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  const activeProperty = selectedProperty || properties[0];

  return (
    <div className="space-y-3 pb-12">
      {/* Header */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Chốt Chỉ Số Điện - Nước & Dịch Vụ
            </h1>
            <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-amber-100 text-amber-850 border border-amber-300">
              Kỳ {selectedMonth}
            </span>
          </div>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-sm border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Kỳ chốt:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-bold text-blue-700 bg-transparent focus:outline-hidden cursor-pointer"
          >
            <option value="2026-09">Tháng 09/2026</option>
            <option value="2026-08">Tháng 08/2026</option>
            <option value="2026-07">Tháng 07/2026</option>
          </select>
        </div>
      </div>

      {/* Pricing rates banner */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Đơn giá áp dụng ({activeProperty.name}):</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-medium text-slate-600">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Điện: <strong className="text-slate-900">{formatCurrency(activeProperty.defaultRates.electricPrice)}/kWh</strong></span>
          </div>

          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-600" />
            <span>Nước: <strong className="text-slate-900">{formatCurrency(activeProperty.defaultRates.waterPrice)}/m³</strong></span>
          </div>

          <div>
            <span>Wifi: <strong className="text-slate-900">{formatCurrency(activeProperty.defaultRates.internetFee)}/phòng</strong></span>
          </div>

          <div>
            <span>Rác & VS: <strong className="text-slate-900">{formatCurrency(activeProperty.defaultRates.garbageFee)}/phòng</strong></span>
          </div>

          <div>
            <span>Gửi xe máy: <strong className="text-slate-900">{formatCurrency(activeProperty.defaultRates.parkingMotorbikeFee)}/chiếc</strong></span>
          </div>
        </div>
      </div>

      {/* Meter reading editable table */}
      <MeterReadingTable month={selectedMonth} />
    </div>
  );
}
