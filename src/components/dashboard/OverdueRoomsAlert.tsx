'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Send, QrCode, Phone, Check, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/formatters';

export function OverdueRoomsAlert() {
  const { filteredInvoices, markInvoicePaid } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const overdueInvoices = filteredInvoices.filter((inv) => inv.status === 'OVERDUE');

  const handleCopyZaloMessage = (inv: (typeof overdueInvoices)[0]) => {
    const text = `Dạ chào bạn ${inv.tenantName} (phòng ${inv.roomNumber}), chủ nhà gửi bạn hóa đơn tiền phòng kỳ ${inv.month} là ${formatCurrency(
      inv.totalAmount - inv.paidAmount
    )}. Do kỳ hạn thanh toán là ngày ${inv.dueDate} đã quá hạn, bạn vui lòng chuyển khoản theo mã VietQR hoặc STK của nhà trọ giúp mình nhé! Cảm ơn bạn.`;

    navigator.clipboard.writeText(text);
    setCopiedId(inv.id);
    alert(`Đã copy nội dung nhắc nợ phòng ${inv.roomNumber}!`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  if (overdueInvoices.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-3 rounded-md border border-rose-300 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-xs bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
            Phòng Quá Hạn Chưa Đóng Tiền ({overdueInvoices.length})
          </h3>
          <span className="text-xs font-bold text-rose-700">
            Tổng nợ: {formatCurrency(overdueInvoices.reduce((a, b) => a + (b.totalAmount - b.paidAmount), 0))}
          </span>
        </div>

        <Link
          href="/invoices"
          className="text-xs font-bold text-blue-700 hover:underline"
        >
          Xem hóa đơn →
        </Link>
      </div>

      <div className="space-y-1.5">
        {overdueInvoices.map((inv) => {
          const remaining = inv.totalAmount - inv.paidAmount;
          return (
            <div
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xs bg-rose-50 border border-rose-200 gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded-xs font-bold text-xs bg-white text-rose-900 border border-rose-300 shrink-0">
                  P.{inv.roomNumber}
                </span>

                <span className="font-bold text-slate-900">{inv.tenantName}</span>
                <span className="text-slate-600 font-mono">({inv.tenantPhone})</span>
                <span className="text-rose-900 font-bold ml-1">{formatCurrency(remaining)}</span>
                <span className="text-slate-600">(Hạn: {inv.dueDate})</span>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  onClick={() => handleCopyZaloMessage(inv)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-xs font-semibold bg-white text-blue-800 border border-slate-300 hover:bg-slate-50 cursor-pointer text-xs"
                  title="Copy tin nhắn Zalo"
                >
                  <Send className="w-3 h-3 text-blue-600" />
                  <span>{copiedId === inv.id ? 'Đã copy' : 'Nhắc Zalo'}</span>
                </button>

                <Link
                  href="/invoices"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-xs font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <QrCode className="w-3 h-3 text-emerald-600" />
                  <span>VietQR</span>
                </Link>

                <button
                  onClick={() => {
                    if (confirm(`Xác nhận đã thu ${formatCurrency(remaining)} phòng ${inv.roomNumber}?`)) {
                      markInvoicePaid(inv.id, 'VIETQR');
                    }
                  }}
                  className="px-2 py-0.5 rounded-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer text-xs"
                >
                  Đã thu
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
