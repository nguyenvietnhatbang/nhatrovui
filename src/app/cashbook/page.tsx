'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Zap,
  Droplets,
  Eye,
  Edit2,
  Trash2,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CashTransaction, TransactionType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { SlideDrawer } from '@/components/common/SlideDrawer';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { TablePagination } from '@/components/common/TablePagination';

export default function CashbookPage() {
  const {
    filteredCashTransactions,
    selectedProperty,
    addCashTransaction,
    updateCashTransaction,
    deleteCashTransaction,
    filteredRooms,
  } = useApp();

  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingTx, setViewingTx] = useState<CashTransaction | null>(null);
  const [editingTx, setEditingTx] = useState<CashTransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<CashTransaction | null>(null);

  // Form states
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [formCategory, setFormCategory] = useState('Bảo trì sửa chữa');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return filteredCashTransactions.filter((tx) => {
      const matchesType = selectedType === 'ALL' || tx.type === selectedType;
      let matchesSearch = true;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        matchesSearch =
          tx.receiptNumber.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          Boolean(tx.roomNumber && tx.roomNumber.toLowerCase().includes(q));
      }
      return matchesType && matchesSearch;
    });
  }, [filteredCashTransactions, selectedType, searchTerm]);

  // Pagination
  const totalItems = filtered.length;
  const paginatedTxs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Checkbox selection
  const allSelected =
    paginatedTxs.length > 0 && paginatedTxs.every((t) => selectedIds.includes(t.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      const currentIds = paginatedTxs.map((t) => t.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentIds])));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalIncome = filteredCashTransactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((a, b) => a + b.amount, 0);

  const totalExpense = filteredCashTransactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((a, b) => a + b.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleOpenAdd = (type: TransactionType = 'EXPENSE') => {
    setFormType(type);
    setFormCategory(type === 'INCOME' ? 'Tiền phòng' : 'Bảo trì sửa chữa');
    setFormAmount('');
    setFormDescription('');
    setFormRoomNumber('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(formAmount.replace(/\D/g, ''), 10);
    if (!amountNum || !formDescription) {
      alert('Vui lòng nhập số tiền và nội dung thu chi!');
      return;
    }

    addCashTransaction({
      propertyId: selectedProperty?.id || 'prop-1',
      type: formType,
      category: formCategory,
      amount: amountNum,
      date: formDate,
      description: formDescription,
      roomNumber: formRoomNumber || undefined,
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (tx: CashTransaction) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormAmount(tx.amount.toString());
    setFormDescription(tx.description);
    setFormRoomNumber(tx.roomNumber || '');
    setFormDate(tx.date);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const amountNum = parseInt(formAmount.replace(/\D/g, ''), 10);
    if (!amountNum) return;

    updateCashTransaction(editingTx.id, {
      type: formType,
      category: formCategory,
      amount: amountNum,
      description: formDescription,
      roomNumber: formRoomNumber || undefined,
      date: formDate,
    });

    setEditingTx(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingTx) return;
    deleteCashTransaction(deletingTx.id);
    setDeletingTx(null);
  };

  return (
    <div className="space-y-3 pb-12">
      {/* Summary 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Tổng Thu Vào
            </span>
            <div className="w-6 h-6 rounded-xs bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 tracking-tight mt-1.5">
            {formatCurrency(totalIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tiền phòng, cọc và phụ phí</div>
        </div>

        <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              Tổng Chi Ra
            </span>
            <div className="w-6 h-6 rounded-xs bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-700 tracking-tight mt-1.5">
            {formatCurrency(totalExpense)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Điện lực EVN, nước, bảo trì, thợ</div>
        </div>

        <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              Tồn Quỹ / Lợi Nhuận Ròng
            </span>
            <div className="w-6 h-6 rounded-xs bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight mt-1.5">
            {formatCurrency(netBalance)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Dòng tiền dương
          </div>
        </div>
      </div>

      {/* Reconciliation Banner */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xs bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">
              Đối Soát Điện Nước Với Nhà Nước (EVN / Sawaco)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-medium">
          <div className="text-right">
            <span className="text-slate-400 text-[11px]">Chênh lệch thu phòng vs EVN:</span>
            <div className="text-emerald-700 font-bold">+ 1.250.000đ (Dư bù hao hụt)</div>
          </div>
          <span className="px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px]">
            Khớp số liệu
          </span>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'Tất cả thu chi' },
            { id: 'INCOME', label: 'Khoản thu vào' },
            { id: 'EXPENSE', label: 'Khoản chi ra' },
          ].map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedType(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, nội dung, phòng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <button
            onClick={() => handleOpenAdd('EXPENSE')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-950 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo phiếu</span>
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
        {/* Main Table Grid (Desktop Only) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="rounded-xs border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3 w-28">Mã phiếu</th>
                <th className="py-2.5 px-3 w-28">Ngày ghi</th>
                <th className="py-2.5 px-3 w-36">Loại & Danh mục</th>
                <th className="py-2.5 px-3">Nội dung diễn giải</th>
                <th className="py-2.5 px-3 w-24 text-center">Phòng</th>
                <th className="py-2.5 px-3 text-right w-36">Số tiền</th>
                <th className="py-2.5 px-3 w-28 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedTxs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Không có bản ghi thu chi nào
                  </td>
                </tr>
              ) : (
                paginatedTxs.map((tx) => {
                  const isChecked = selectedIds.includes(tx.id);
                  const isIncome = tx.type === 'INCOME';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(tx.id)}
                          className="rounded-xs border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {tx.receiptNumber}
                      </td>

                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        {formatDate(tx.date)}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isIncome ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                          <span className="font-bold text-slate-900">
                            {tx.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-slate-900 font-medium">
                        {tx.description}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {tx.roomNumber ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                            P.{tx.roomNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">---</span>
                        )}
                      </td>

                      <td
                        className={`py-2.5 px-3 text-right font-bold font-mono ${
                          isIncome ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-slate-400">
                          {/* View Drawer */}
                          <button
                            onClick={() => setViewingTx(tx)}
                            title="Xem chi tiết"
                            className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Modal */}
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            title="Sửa phiếu"
                            className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingTx(tx)}
                            title="Xóa phiếu"
                            className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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

        {/* Mobile Cards View (Hidden on Desktop) */}
        <div className="block md:hidden p-2.5 space-y-2">
          {paginatedTxs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Không có bản ghi thu chi nào
            </div>
          ) : (
            paginatedTxs.map((tx) => {
              const isIncome = tx.type === 'INCOME';

              return (
                <div
                  key={tx.id}
                  className="p-3 bg-white rounded-md border border-slate-200 shadow-2xs space-y-2.5"
                >
                  {/* Card Header: Receipt # + Amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {tx.receiptNumber}
                        </span>
                        {tx.roomNumber && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                            P.{tx.roomNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ngày ghi: {formatDate(tx.date)}
                      </div>
                    </div>

                    <div
                      className={`font-mono font-bold text-sm text-right shrink-0 ${
                        isIncome ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>

                  {/* Category & Description */}
                  <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isIncome ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                      <span className="font-bold text-slate-900">
                        {tx.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({isIncome ? 'Thu vào' : 'Chi ra'})
                      </span>
                    </div>

                    <div className="text-slate-700 text-xs bg-slate-50 p-2 rounded-sm border border-slate-100">
                      {tx.description}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => setViewingTx(tx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem phiếu</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-sm border border-slate-200 transition-colors cursor-pointer"
                        title="Sửa phiếu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingTx(tx)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-sm border border-rose-200 transition-colors cursor-pointer"
                        title="Xóa phiếu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <TablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* SlideDrawer: View Transaction Details */}
      <SlideDrawer
        isOpen={!!viewingTx}
        onClose={() => setViewingTx(null)}
        title={`Chi Tiết Phiếu ${viewingTx?.receiptNumber || ''}`}
      >
        {viewingTx && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Loại nghiệp vụ:</span>
                <div
                  className={`font-bold text-sm mt-0.5 ${
                    viewingTx.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {viewingTx.type === 'INCOME' ? 'Thu tiền vào quỹ' : 'Chi tiền từ quỹ'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Số tiền:</span>
                <div
                  className={`text-base font-bold ${
                    viewingTx.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {viewingTx.type === 'INCOME' ? '+' : '-'}{formatCurrency(viewingTx.amount)}
                </div>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Danh mục:</span>
                  <div className="font-bold text-slate-800">{viewingTx.category}</div>
                </div>
                <div>
                  <span className="text-slate-400">Ngày phát sinh:</span>
                  <div className="font-medium text-slate-800">{formatDate(viewingTx.date)}</div>
                </div>
                {viewingTx.roomNumber && (
                  <div>
                    <span className="text-slate-400">Phòng liên quan:</span>
                    <div className="font-bold text-blue-700">Phòng {viewingTx.roomNumber}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-md space-y-1">
              <span className="text-slate-400">Nội dung diễn giải chi tiết:</span>
              <p className="text-slate-800 font-medium leading-relaxed">{viewingTx.description}</p>
            </div>
          </div>
        )}
      </SlideDrawer>

      {/* Modal: Create Transaction */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-md p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">Tạo Phiếu Thu / Chi Mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Loại phiếu *</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const t = e.target.value as TransactionType;
                      setFormType(t);
                      setFormCategory(t === 'INCOME' ? 'Tiền phòng' : 'Bảo trì sửa chữa');
                    }}
                    className="w-full p-2 rounded-sm border border-slate-300 bg-white"
                  >
                    <option value="INCOME">Thu tiền vào (Income)</option>
                    <option value="EXPENSE">Chi tiền ra (Expense)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Danh mục *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300 bg-white"
                  >
                    {formType === 'INCOME' ? (
                      <>
                        <option value="Tiền phòng">Tiền phòng</option>
                        <option value="Tiền cọc">Tiền cọc giữ chỗ</option>
                        <option value="Tiền điện nước">Tiền điện nước</option>
                        <option value="Thu khác">Thu khác</option>
                      </>
                    ) : (
                      <>
                        <option value="Bảo trì sửa chữa">Bảo trì sửa chữa</option>
                        <option value="Hóa đơn EVN">Hóa đơn điện lực EVN</option>
                        <option value="Hóa đơn Nước Sawaco">Hóa đơn cấp nước Sawaco</option>
                        <option value="Lương bảo vệ & tạp vụ">Lương nhân viên & tạp vụ</option>
                        <option value="Chi phí internet / rác">Chi phí wifi cáp quang</option>
                        <option value="Chi khác">Chi phí khác</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Số tiền (VNĐ) *</label>
                  <input
                    type="text"
                    placeholder="Vd: 1,500,000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngày chứng từ</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Phòng liên quan (tùy chọn)</label>
                <select
                  value={formRoomNumber}
                  onChange={(e) => setFormRoomNumber(e.target.value)}
                  className="w-full p-2 rounded-sm border border-slate-300 bg-white"
                >
                  <option value="">-- Áp dụng chung cho toàn nhà --</option>
                  {filteredRooms.map((r) => (
                    <option key={r.id} value={r.roomNumber}>
                      Phòng {r.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nội dung diễn giải *</label>
                <textarea
                  rows={2}
                  placeholder="Ghi rõ lý do thu chi để đối soát kế toán..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2 rounded-sm border border-slate-300"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-sm bg-slate-950 hover:bg-slate-800 text-white font-medium cursor-pointer"
                >
                  Lưu phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Transaction */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-md p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">
                Sửa Phiếu {editingTx.receiptNumber}
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngày ghi</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nội dung diễn giải</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2 rounded-sm border border-slate-300"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-3 py-1.5 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-sm bg-slate-950 hover:bg-slate-800 text-white font-medium cursor-pointer"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Transaction Confirm */}
      <ConfirmDeleteModal
        isOpen={!!deletingTx}
        title="Xóa Phiếu Thu Chi"
        message={`Bạn có chắc chắn muốn xóa phiếu "${deletingTx?.receiptNumber}" (${deletingTx?.description})?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTx(null)}
      />
    </div>
  );
}
