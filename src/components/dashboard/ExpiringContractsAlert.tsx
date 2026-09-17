'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Calendar, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDate, formatCurrency } from '@/lib/formatters';

export function ExpiringContractsAlert() {
  const { filteredContracts, renewContract } = useApp();

  const expiringContracts = filteredContracts.filter((c) => c.status === 'EXPIRING_SOON');

  if (expiringContracts.length === 0) {
    return null;
  }

  const handleRenew = (contractId: string, tenantName: string) => {
    const newEnd = prompt(`Nhập ngày kết thúc mới cho hợp đồng của ${tenantName} (YYYY-MM-DD):`, '2027-09-01');
    if (newEnd) {
      renewContract(contractId, newEnd);
      alert(`Đã gia hạn hợp đồng thành công đến ${newEnd}!`);
    }
  };

  return (
    <div className="bg-white p-3 rounded-md border border-amber-300 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-xs bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
            Hợp Đồng Sắp Hết Hạn ({expiringContracts.length})
          </h3>
        </div>

        <Link
          href="/contracts"
          className="text-xs font-bold text-blue-700 hover:underline"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="space-y-1.5 text-xs">
        {expiringContracts.map((c) => (
          <div
            key={c.id}
            className="p-2 rounded-xs bg-amber-50 border border-amber-200 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-950">{c.tenantName}</span>
              <span className="text-slate-600 font-medium">({formatCurrency(c.rentPrice)}/th)</span>
              <span className="text-amber-950 font-semibold">Hết hạn: {formatDate(c.endDate)}</span>
            </div>

            <button
              onClick={() => handleRenew(c.id, c.tenantName)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-xs text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tái ký</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
