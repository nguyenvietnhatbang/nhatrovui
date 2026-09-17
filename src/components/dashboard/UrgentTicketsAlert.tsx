'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function UrgentTicketsAlert() {
  const { filteredTickets, updateMaintenanceStatus } = useApp();

  const pendingTickets = filteredTickets.filter(
    (t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS'
  );

  if (pendingTickets.length === 0) return null;

  return (
    <div className="bg-white p-3 rounded-md border border-slate-300 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-xs bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wide">
            Sự Cố Đang Xử Lý ({pendingTickets.length})
          </h3>
        </div>

        <Link
          href="/maintenance"
          className="text-xs font-bold text-blue-700 hover:underline"
        >
          Quản lý bảo trì →
        </Link>
      </div>

      <div className="space-y-1.5 text-xs">
        {pendingTickets.slice(0, 3).map((t) => (
          <div
            key={t.id}
            className="p-2 rounded-xs bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded-xs text-[11px] font-bold bg-white text-slate-900 border border-slate-300 shrink-0">
                P.{t.roomNumber}
              </span>
              <span className="font-bold text-slate-950">{t.title}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-1.5 py-0.5 rounded-xs text-[11px] font-bold ${
                  t.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-950 border border-blue-300'
                    : 'bg-amber-100 text-amber-950 border border-amber-300'
                }`}
              >
                {t.status === 'IN_PROGRESS' ? 'Đang sửa' : 'Chờ thợ'}
              </span>

              <button
                onClick={() => {
                  const costStr = prompt('Nhập chi phí sửa chữa (VND):', '150000');
                  const cost = costStr ? parseInt(costStr, 10) : 0;
                  updateMaintenanceStatus(t.id, 'RESOLVED', cost);
                  alert('Đã hoàn tất nghiệm thu!');
                }}
                className="px-2 py-0.5 rounded-xs bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold cursor-pointer"
              >
                Nghiệm thu
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
