'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Send,
  Download,
  Building,
  Phone,
  Zap,
  Droplets,
  Receipt,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Invoice } from '@/types';
import { formatCurrency, formatDate, INVOICE_STATUS_CONFIG } from '@/lib/formatters';
import { useApp } from '@/context/AppContext';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  const { markInvoicePaid, properties } = useApp();
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!invoice) return null;

  const property = properties.find((p) => p.id === invoice.propertyId);
  const statusCfg = INVOICE_STATUS_CONFIG[invoice.status];
  const remainingAmount = invoice.totalAmount - invoice.paidAmount;

  const handleCopySyntax = () => {
    navigator.clipboard.writeText(invoice.transferNote);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyBillShare = () => {
    const shareText = `Dạ chào bạn ${invoice.tenantName}, nhà trọ ${property?.name || ''} gửi bạn hóa đơn phòng ${invoice.roomNumber} kỳ ${invoice.month}:\n- Tiền phòng: ${formatCurrency(invoice.roomPrice)}\n- Tiền điện (${invoice.electricUsage} kWh): ${formatCurrency(invoice.electricTotal)}\n- Tiền nước (${invoice.waterUsage} m³): ${formatCurrency(invoice.waterTotal)}\n- Phí dịch vụ: ${formatCurrency(invoice.garbageFee + invoice.internetFee + invoice.parkingFee + invoice.serviceFee)}\n=> TỔNG CỘNG: ${formatCurrency(invoice.totalAmount)}\n\nNội dung CK: ${invoice.transferNote}\nQuét mã VietQR hoặc chuyển vào STK ${property?.bankConfig.accountNumber} (${property?.bankConfig.bankName} - ${property?.bankConfig.accountName}). Cảm ơn bạn!`;

    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    alert('Đã sao chép nội dung hóa đơn định dạng Zalo/SMS!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmPayment = () => {
    markInvoicePaid(invoice.id, 'VIETQR');
    alert(`Đã xác nhận thanh toán thành công cho phòng ${invoice.roomNumber} (${formatCurrency(remainingAmount)})!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-md shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150 print:border-none print:shadow-none print:m-0 print:max-h-full">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Hóa Đơn Tiền Phòng {invoice.roomNumber}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.badgeClass}`}>
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">Mã hóa đơn: {invoice.code} • Kỳ {invoice.month}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Hóa Đơn</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body: 2 Columns (Bill details + VietQR Card) */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Bill details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Property and Tenant Info */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {property?.name || 'Nhà Trọ Sunshine'}
                </div>
                <div className="text-slate-500 mt-1 leading-relaxed">{property?.address}</div>
                <div className="text-slate-500 mt-0.5">Hotline: {property?.phone}</div>
              </div>

              <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                <div className="text-slate-400">Khách thuê đại diện:</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  {invoice.tenantName}
                </div>
                <div className="text-slate-500 mt-0.5">SĐT: {invoice.tenantPhone}</div>
                <div className="text-slate-500 mt-0.5">Phòng: <strong>{invoice.roomNumber}</strong></div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Khoản Mục Chi Tiết</th>
                    <th className="p-3 text-center">Chỉ Số / Lượng</th>
                    <th className="p-3 text-right">Đơn Giá</th>
                    <th className="p-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* 1. Room Price */}
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      Tiền thuê phòng
                    </td>
                    <td className="p-3 text-center text-slate-500">1 tháng</td>
                    <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                      {formatCurrency(invoice.roomPrice)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(invoice.roomPrice)}
                    </td>
                  </tr>

                  {/* 2. Electricity */}
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Tiền điện sinh hoạt</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Cũ: {invoice.oldElectric} → Mới: {invoice.newElectric}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-amber-700 dark:text-amber-400">
                      {invoice.electricUsage} kWh
                    </td>
                    <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                      {formatCurrency(invoice.electricRate)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(invoice.electricTotal)}
                    </td>
                  </tr>

                  {/* 3. Water */}
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Tiền nước sinh hoạt</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Cũ: {invoice.oldWater} → Mới: {invoice.newWater}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-cyan-700 dark:text-cyan-400">
                      {invoice.waterUsage} m³
                    </td>
                    <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                      {formatCurrency(invoice.waterRate)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(invoice.waterTotal)}
                    </td>
                  </tr>

                  {/* 4. Garbage */}
                  <tr>
                    <td className="p-3 text-slate-700 dark:text-slate-300">Phí vệ sinh & rác sinh hoạt</td>
                    <td className="p-3 text-center text-slate-500">1 tháng</td>
                    <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                      {formatCurrency(invoice.garbageFee)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(invoice.garbageFee)}
                    </td>
                  </tr>

                  {/* 5. Internet */}
                  <tr>
                    <td className="p-3 text-slate-700 dark:text-slate-300">Mạng Wifi tốc độ cao</td>
                    <td className="p-3 text-center text-slate-500">1 tháng</td>
                    <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                      {formatCurrency(invoice.internetFee)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(invoice.internetFee)}
                    </td>
                  </tr>

                  {/* 6. Parking */}
                  <tr>
                    <td className="p-3 text-slate-700 dark:text-slate-300">Phí gửi xe máy</td>
                    <td className="p-3 text-center text-slate-500">Tháng</td>
                    <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                      {formatCurrency(invoice.parkingFee)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(invoice.parkingFee)}
                    </td>
                  </tr>

                  {/* 7. Other Fee if any */}
                  {invoice.otherFee > 0 && (
                    <tr>
                      <td className="p-3 text-rose-600">
                        {invoice.otherFeeReason || 'Phụ phí phát sinh'}
                      </td>
                      <td className="p-3 text-center text-slate-500">-</td>
                      <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                        {formatCurrency(invoice.otherFee)}
                      </td>
                      <td className="p-3 text-right font-bold text-rose-600">
                        {formatCurrency(invoice.otherFee)}
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* Grand Total Footer */}
                <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-black border-t border-slate-200 dark:border-slate-700">
                  <tr>
                    <td colSpan={3} className="p-3.5 text-right uppercase tracking-wider text-slate-700 dark:text-slate-300 text-xs">
                      Tổng Cộng Phải Thanh Toán:
                    </td>
                    <td className="p-3.5 text-right text-base text-blue-600 dark:text-blue-400">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note & Due date */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Hạn thanh toán: <strong>{formatDate(invoice.dueDate)}</strong></span>
              <span>Ngày phát hành: {formatDate(invoice.issueDate)}</span>
            </div>
          </div>

          {/* Right Column: Live VietQR Code & Payment Verification (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-md border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>VIETQR CHUẨN NAPAS 247</span>
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-2">
                  Quét Mã Để Thanh Toán Tự Động
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động điền đúng số tiền và nội dung chuyển khoản
                </p>
              </div>

              {/* VietQR Image Container */}
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200 mx-auto max-w-[260px]">
                {invoice.qrUrl ? (
                  <img
                    src={invoice.qrUrl}
                    alt="VietQR Code"
                    className="w-full h-auto rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-full aspect-square bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    Đang tải mã QR...
                  </div>
                )}
              </div>

              {/* Bank Details */}
              <div className="mt-4 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {property?.bankConfig.bankName} ({property?.bankConfig.bankCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {property?.bankConfig.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">
                    {property?.bankConfig.accountName}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400">Nội dung CK:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                      {invoice.transferNote}
                    </span>
                    <button
                      onClick={handleCopySyntax}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Copy cú pháp chuyển khoản"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyBillShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 hover:bg-blue-50 transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4 text-blue-600" />
                <span>{copiedLink ? 'Đã copy tin nhắn!' : 'Gửi hóa đơn qua Zalo / SMS'}</span>
              </button>

              {invoice.status !== 'PAID' ? (
                <button
                  onClick={handleConfirmPayment}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Đã Thu Tiền ({formatCurrency(remainingAmount)})</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã thanh toán ngày {formatDate(invoice.paidDate)} ({invoice.paymentMethod})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
