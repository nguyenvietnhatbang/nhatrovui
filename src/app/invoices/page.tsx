'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  QrCode,
  Printer,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Droplets,
  Phone,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Invoice, InvoiceStatus } from '@/types';
import { formatCurrency, formatDate, INVOICE_STATUS_CONFIG } from '@/lib/formatters';
import { AvatarLetter } from '@/components/common/AvatarLetter';
import { SlideDrawer } from '@/components/common/SlideDrawer';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { TablePagination } from '@/components/common/TablePagination';

export default function InvoicesPage() {
  const { filteredInvoices, selectedProperty, properties, generateInvoicesForMonth, markInvoicePaid } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals & Drawer states
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [copiedNote, setCopiedNote] = useState(false);

  const activeProperty = selectedProperty || properties[0];

  // Listen to global "+ Tạo" event from Header
  useEffect(() => {
    const handleGenerate = () => {
      const count = generateInvoicesForMonth(activeProperty.id, selectedMonth);
      alert(`Đã lập thành công ${count} hóa đơn mới cho kỳ ${selectedMonth}!`);
    };
    window.addEventListener('generate-invoices-event', handleGenerate);
    return () => window.removeEventListener('generate-invoices-event', handleGenerate);
  }, [activeProperty.id, selectedMonth, generateInvoicesForMonth]);

  // Filtered dataset
  const displayedInvoices = useMemo(() => {
    return filteredInvoices.filter((inv) => {
      const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
      const matchesMonth = selectedMonth === 'ALL' || inv.month === selectedMonth;

      let matchesSearch = true;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        matchesSearch = Boolean(
          inv.roomNumber.toLowerCase().includes(q) ||
          inv.tenantName.toLowerCase().includes(q) ||
          inv.code.toLowerCase().includes(q) ||
          inv.tenantPhone.includes(q)
        );
      }

      return matchesStatus && matchesMonth && matchesSearch;
    });
  }, [filteredInvoices, selectedStatus, selectedMonth, searchTerm]);

  // Paginated dataset
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedInvoices.slice(start, start + pageSize);
  }, [displayedInvoices, currentPage, pageSize]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedInvoices.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyTransferNote = (note: string) => {
    navigator.clipboard.writeText(note);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleManualPay = (inv: Invoice) => {
    markInvoicePaid(inv.id, 'VIETQR');
    alert(`Xác nhận đã thanh toán thành công hóa đơn phòng ${inv.roomNumber}!`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
      {/* Top Filter Bar (Responsive) */}
      <div className="p-2.5 sm:p-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:outline-hidden focus:border-slate-800 cursor-pointer"
          >
            <option value="2026-09">Kỳ: Tháng 09/2026</option>
            <option value="2026-08">Kỳ: Tháng 08/2026</option>
            <option value="ALL">Kỳ: Tất cả</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full sm:w-auto px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:outline-hidden focus:border-slate-800 cursor-pointer"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="OVERDUE">Quá hạn nộp</option>
            <option value="PAID">Đã thanh toán</option>
          </select>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Mã HĐ / Phòng / Khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:border-slate-800"
            />
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={() => {
              const count = generateInvoicesForMonth(activeProperty.id, selectedMonth);
              alert(`Đã lập thành công ${count} hóa đơn tiền phòng mới cho kỳ ${selectedMonth}!`);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Xuất Hóa Đơn Kỳ Này</span>
          </button>
        </div>
      </div>

      {/* Invoices Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="border-b border-slate-200 bg-slate-100/90 text-slate-900 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    paginatedInvoices.length > 0 &&
                    paginatedInvoices.every((i) => selectedIds.has(i.id))
                  }
                  className="rounded border-slate-300 text-slate-900"
                />
              </th>
              <th className="py-2.5 px-3">Mã hóa đơn</th>
              <th className="py-2.5 px-3">Phòng</th>
              <th className="py-2.5 px-3">Khách thuê</th>
              <th className="py-2.5 px-3">Kỳ tính</th>
              <th className="py-2.5 px-3 text-right">Tiền phòng</th>
              <th className="py-2.5 px-3 text-right">Điện + Nước + DV</th>
              <th className="py-2.5 px-3 text-right">Tổng thanh toán</th>
              <th className="py-2.5 px-3 text-center">Trạng thái</th>
              <th className="py-2.5 px-3 text-center w-28">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  Không tìm thấy hóa đơn nào phù hợp.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => {
                const isSelected = selectedIds.has(inv.id);
                const statusCfg = INVOICE_STATUS_CONFIG[inv.status];
                const utilitiesTotal =
                  inv.electricTotal +
                  inv.waterTotal +
                  inv.garbageFee +
                  inv.internetFee +
                  inv.parkingFee +
                  inv.serviceFee +
                  inv.otherFee;

                return (
                  <tr
                    key={inv.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(inv.id)}
                        className="rounded border-slate-300 text-slate-900"
                      />
                    </td>

                    <td className="py-2 px-3 font-mono font-bold text-slate-900 text-[12px]">
                      {inv.code}
                    </td>

                    <td className="py-2 px-3 font-black text-slate-900 text-sm">
                      {inv.roomNumber}
                    </td>

                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <AvatarLetter name={inv.tenantName} size="sm" color="blue" />
                        <div>
                          <div className="font-bold text-slate-900">{inv.tenantName}</div>
                          <div className="text-[10px] text-slate-400">{inv.tenantPhone}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-3 font-medium text-slate-800">{inv.month}</td>

                    <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                      {formatCurrency(inv.roomPrice)}
                    </td>

                    <td className="py-2 px-3 text-right font-mono font-medium text-slate-700">
                      {formatCurrency(utilitiesTotal)}
                    </td>

                    <td className="py-2 px-3 text-right font-mono font-black text-slate-900 text-[13px]">
                      {formatCurrency(inv.totalAmount)}
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dotClass}`} />
                        {statusCfg.label}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View VietQR in Slide Drawer */}
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Xem mã VietQR & chi tiết hóa đơn (Trượt phải)"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Print */}
                        <button
                          onClick={() => {
                            setViewingInvoice(inv);
                            setTimeout(() => window.print(), 200);
                          }}
                          className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="In hóa đơn"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingInvoice(inv)}
                          className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa hóa đơn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <TablePagination
        currentPage={currentPage}
        totalItems={displayedInvoices.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Slide-over Right Drawer for Viewing Invoice & Live VietQR */}
      <SlideDrawer
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        title={viewingInvoice ? `Hóa Đơn Phòng ${viewingInvoice.roomNumber} - Kỳ ${viewingInvoice.month}` : ''}
        subtitle={viewingInvoice ? `Mã: ${viewingInvoice.code} • Khách: ${viewingInvoice.tenantName}` : ''}
      >
        {viewingInvoice && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* VietQR Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Mã Thanh Toán VietQR Chuẩn Napas 247
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 inline-block shadow-sm">
                <img
                  src={viewingInvoice.qrUrl}
                  alt="VietQR"
                  className="w-48 h-auto mx-auto object-contain"
                />
              </div>

              {/* Bank Details */}
              <div className="text-left space-y-1 bg-white p-3 rounded border border-slate-200 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="font-bold text-slate-800">
                    {activeProperty.bankConfig.bankName} ({activeProperty.bankConfig.bankCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="font-mono font-bold text-blue-600">
                    {activeProperty.bankConfig.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-800 uppercase">
                    {activeProperty.bankConfig.accountName}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-400">Cú pháp CK:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                      {viewingInvoice.transferNote}
                    </span>
                    <button
                      onClick={() => handleCopyTransferNote(viewingInvoice.transferNote)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Pay Button */}
              {viewingInvoice.status !== 'PAID' ? (
                <button
                  onClick={() => handleManualPay(viewingInvoice)}
                  className="w-full py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Đã Thu Tiền ({formatCurrency(viewingInvoice.totalAmount)})</span>
                </button>
              ) : (
                <div className="p-2 rounded bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã thanh toán ngày {formatDate(viewingInvoice.paidDate)}</span>
                </div>
              )}
            </div>

            {/* Breakdown Table */}
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                  <tr>
                    <th className="p-2.5">Khoản mục</th>
                    <th className="p-2.5 text-center">Chỉ số</th>
                    <th className="p-2.5 text-right">Đơn giá</th>
                    <th className="p-2.5 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-800">Tiền phòng</td>
                    <td className="p-2.5 text-center text-slate-500">1 tháng</td>
                    <td className="p-2.5 text-right">{formatCurrency(viewingInvoice.roomPrice)}</td>
                    <td className="p-2.5 text-right font-bold font-mono">
                      {formatCurrency(viewingInvoice.roomPrice)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-800">Điện sinh hoạt</div>
                      <div className="text-[10px] text-slate-400">
                        {viewingInvoice.oldElectric} → {viewingInvoice.newElectric}
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">
                      {viewingInvoice.electricUsage} kWh
                    </td>
                    <td className="p-2.5 text-right">{formatCurrency(viewingInvoice.electricRate)}</td>
                    <td className="p-2.5 text-right font-bold font-mono">
                      {formatCurrency(viewingInvoice.electricTotal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-800">Nước sinh hoạt</div>
                      <div className="text-[10px] text-slate-400">
                        {viewingInvoice.oldWater} → {viewingInvoice.newWater}
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">
                      {viewingInvoice.waterUsage} m³
                    </td>
                    <td className="p-2.5 text-right">{formatCurrency(viewingInvoice.waterRate)}</td>
                    <td className="p-2.5 text-right font-bold font-mono">
                      {formatCurrency(viewingInvoice.waterTotal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-700">Rác & Vệ sinh</td>
                    <td className="p-2.5 text-center text-slate-400">-</td>
                    <td className="p-2.5 text-right">{formatCurrency(viewingInvoice.garbageFee)}</td>
                    <td className="p-2.5 text-right font-bold font-mono">
                      {formatCurrency(viewingInvoice.garbageFee)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-700">Wifi internet</td>
                    <td className="p-2.5 text-center text-slate-400">-</td>
                    <td className="p-2.5 text-right">{formatCurrency(viewingInvoice.internetFee)}</td>
                    <td className="p-2.5 text-right font-bold font-mono">
                      {formatCurrency(viewingInvoice.internetFee)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-700">Gửi xe máy</td>
                    <td className="p-2.5 text-center text-slate-400">-</td>
                    <td className="p-2.5 text-right">{formatCurrency(viewingInvoice.parkingFee)}</td>
                    <td className="p-2.5 text-right font-bold font-mono">
                      {formatCurrency(viewingInvoice.parkingFee)}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="p-2.5 text-right uppercase text-slate-600">
                      Tổng thanh toán:
                    </td>
                    <td className="p-2.5 text-right font-black font-mono text-sm text-slate-900">
                      {formatCurrency(viewingInvoice.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </SlideDrawer>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingInvoice)}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={() => {
          if (deletingInvoice) {
            const index = filteredInvoices.findIndex((i) => i.id === deletingInvoice.id);
            if (index !== -1) filteredInvoices.splice(index, 1);
            alert(`Đã xóa hóa đơn ${deletingInvoice.code}!`);
          }
        }}
        title="Xác nhận xóa hóa đơn"
        message={`Bạn có chắc muốn xóa hóa đơn ${deletingInvoice?.code} của phòng ${deletingInvoice?.roomNumber}?`}
      />
    </div>
  );
}
