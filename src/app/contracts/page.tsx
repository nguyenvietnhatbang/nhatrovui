'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  DollarSign,
  RefreshCw,
  Printer,
  LogOut,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  Trash2,
  X,
  Building2,
  User,
  Shield,
  FileCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Contract, ContractStatus } from '@/types';
import { formatCurrency, formatDate, CONTRACT_STATUS_CONFIG } from '@/lib/formatters';
import { AvatarLetter } from '@/components/common/AvatarLetter';
import { SlideDrawer } from '@/components/common/SlideDrawer';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { TablePagination } from '@/components/common/TablePagination';
import { PrintContractModal } from '@/components/contracts/PrintContractModal';

export default function ContractsPage() {
  const {
    filteredContracts,
    selectedProperty,
    properties,
    tenants,
    filteredRooms,
    addContract,
    updateContract,
    renewContract,
    terminateContract,
    deleteContract,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Drawers
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [printingContract, setPrintingContract] = useState<Contract | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [newRenewEndDate, setNewRenewEndDate] = useState('2027-09-01');

  // New Contract Form State
  const [formTenantId, setFormTenantId] = useState('');
  const [formRoomId, setFormRoomId] = useState('');
  const [formStartDate, setFormStartDate] = useState('2026-09-01');
  const [formEndDate, setFormEndDate] = useState('2027-03-01');
  const [formRentPrice, setFormRentPrice] = useState(3500000);
  const [formDepositAmount, setFormDepositAmount] = useState(3500000);
  const [formPaymentCycle, setFormPaymentCycle] = useState<'MONTHLY' | 'QUARTERLY'>('MONTHLY');
  const [formTerms, setFormTerms] = useState('Hợp đồng thuê phòng tiêu chuẩn. Giữ gìn an ninh trật tự và vệ sinh chung.');

  // Filtered contracts
  const filtered = useMemo(() => {
    return filteredContracts.filter((c) => {
      const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      let matchesSearch = true;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        matchesSearch =
          c.code.toLowerCase().includes(q) ||
          c.tenantName.toLowerCase().includes(q) ||
          c.roomId.toLowerCase().includes(q);
      }
      return matchesStatus && matchesSearch;
    });
  }, [filteredContracts, selectedStatus, searchTerm]);

  // Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Checkbox selection
  const allSelected =
    paginatedContracts.length > 0 &&
    paginatedContracts.every((c) => selectedIds.includes(c.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      const currentIds = paginatedContracts.map((c) => c.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentIds])));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenCreate = () => {
    if (filteredRooms.length > 0) {
      setFormRoomId(filteredRooms[0].id);
      setFormRentPrice(filteredRooms[0].basePrice);
      setFormDepositAmount(filteredRooms[0].basePrice);
    }
    if (tenants.length > 0) {
      setFormTenantId(tenants[0].id);
    }
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tenants.find((item) => item.id === formTenantId);
    if (!t) {
      alert('Vui lòng chọn khách thuê!');
      return;
    }
    const propId = selectedProperty?.id || properties[0]?.id || 'prop-1';
    const code = `HD-${Date.now().toString().slice(-4)}`;

    addContract({
      propertyId: propId,
      code,
      roomId: formRoomId,
      tenantId: t.id,
      tenantName: t.name,
      startDate: formStartDate,
      endDate: formEndDate,
      rentPrice: Number(formRentPrice),
      depositAmount: Number(formDepositAmount),
      billingDay: 5,
      paymentCycleMonths: formPaymentCycle === 'MONTHLY' ? 1 : 3,
      paymentCycle: formPaymentCycle,
      status: 'ACTIVE',
      signedDate: new Date().toISOString().split('T')[0],
      note: formTerms,
      terms: formTerms,
    });

    setIsCreateOpen(false);
  };

  const handleOpenEdit = (c: Contract) => {
    setEditingContract(c);
    setFormRentPrice(c.rentPrice);
    setFormDepositAmount(c.depositAmount);
    setFormStartDate(c.startDate);
    setFormEndDate(c.endDate);
    setFormTerms(c.terms || c.note || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;

    updateContract(editingContract.id, {
      rentPrice: Number(formRentPrice),
      depositAmount: Number(formDepositAmount),
      startDate: formStartDate,
      endDate: formEndDate,
      terms: formTerms,
    });

    setEditingContract(null);
  };

  const handleRenewConfirm = () => {
    if (!renewingContract) return;
    renewContract(renewingContract.id, newRenewEndDate);
    setRenewingContract(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingContract) return;
    if (deleteContract) {
      deleteContract(deletingContract.id);
    } else {
      terminateContract(deletingContract.id);
    }
    setDeletingContract(null);
  };

  return (
    <div className="space-y-3 pb-12">
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ACTIVE', label: 'Đang hiệu lực' },
            { id: 'EXPIRING_SOON', label: 'Sắp hết hạn' },
            { id: 'TERMINATED', label: 'Đã thanh lý' },
          ].map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedStatus(tab.id as any);
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

        {/* Right: Search & Create */}
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã HĐ, tên khách, số phòng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-950 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo</span>
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
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
                <th className="py-2.5 px-3 w-28">Mã HĐ</th>
                <th className="py-2.5 px-3">Khách thuê</th>
                <th className="py-2.5 px-3 w-24">Phòng</th>
                <th className="py-2.5 px-3">Thời hạn hợp đồng</th>
                <th className="py-2.5 px-3 text-right">Giá thuê</th>
                <th className="py-2.5 px-3 text-right">Tiền cọc</th>
                <th className="py-2.5 px-3 w-32 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 w-36 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedContracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy hợp đồng nào phù hợp
                  </td>
                </tr>
              ) : (
                paginatedContracts.map((c) => {
                  const isChecked = selectedIds.includes(c.id);
                  const statusCfg = CONTRACT_STATUS_CONFIG[c.status];
                  const roomNum = c.roomId.replace('room-', '').toUpperCase();

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(c.id)}
                          className="rounded-xs border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {c.code}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <AvatarLetter name={c.tenantName} size="sm" color="blue" />
                          <div>
                            <div className="font-bold text-slate-900">{c.tenantName}</div>
                            <div className="text-[10px] text-slate-400">Ký: {formatDate(c.signedDate)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xs font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                          P.{roomNum}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-700">
                        <span className="font-medium">{formatDate(c.startDate)}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-bold text-slate-900">{formatDate(c.endDate)}</span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(c.rentPrice)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                        {formatCurrency(c.depositAmount)}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dotClass}`} />
                          {statusCfg.label}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-slate-400">
                          {/* Print Contract */}
                          <button
                            onClick={() => setPrintingContract(c)}
                            title="In hợp đồng"
                            className="p-1 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* View Contract Details */}
                          <button
                            onClick={() => setViewingContract(c)}
                            title="Xem chi tiết"
                            className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Contract */}
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Sửa hợp đồng"
                            className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Renew button if expiring */}
                          {c.status !== 'TERMINATED' && (
                            <button
                              onClick={() => {
                                setRenewingContract(c);
                                setNewRenewEndDate('2027-09-01');
                              }}
                              title="Tái ký / Gia hạn"
                              className="p-1 hover:text-amber-600 transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                            </button>
                          )}

                          {/* Terminate / Delete */}
                          <button
                            onClick={() => setDeletingContract(c)}
                            title={c.status === 'TERMINATED' ? 'Xóa hợp đồng' : 'Thanh lý hợp đồng'}
                            className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            {c.status === 'TERMINATED' ? (
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <LogOut className="w-3.5 h-3.5 text-rose-500" />
                            )}
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

        {/* Bottom Pagination Bar */}
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

      {/* Slide-over Right Drawer: Contract Detail */}
      <SlideDrawer
        isOpen={!!viewingContract}
        onClose={() => setViewingContract(null)}
        title={`Chi Tiết Hợp Đồng ${viewingContract?.code || ''}`}
      >
        {viewingContract && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Trạng thái hợp đồng:</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      CONTRACT_STATUS_CONFIG[viewingContract.status].badgeClass
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        CONTRACT_STATUS_CONFIG[viewingContract.status].dotClass
                      }`}
                    />
                    {CONTRACT_STATUS_CONFIG[viewingContract.status].label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setPrintingContract(viewingContract);
                  setViewingContract(null);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 font-medium text-slate-700 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In bản cứng</span>
              </button>
            </div>

            {/* Tenant Info */}
            <div className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold border-b border-slate-100 pb-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Thông Tin Khách Thuê Đại Diện</span>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <AvatarLetter name={viewingContract.tenantName} size="md" color="blue" />
                <div>
                  <div className="font-bold text-slate-900">{viewingContract.tenantName}</div>
                  <div className="text-slate-500">Mã khách: {viewingContract.tenantId}</div>
                </div>
              </div>
            </div>

            {/* Room & Property */}
            <div className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold border-b border-slate-100 pb-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Phòng & Cơ Sở Lưu Trú</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-400">Phòng thuê:</span>
                  <div className="font-bold text-slate-800">
                    Phòng {viewingContract.roomId.replace('room-', '')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Cơ sở:</span>
                  <div className="font-bold text-slate-800">
                    {selectedProperty?.name || 'Nhà trọ chính'}
                  </div>
                </div>
              </div>
            </div>

            {/* Financials & Dates */}
            <div className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold border-b border-slate-100 pb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Chi Phí & Thời Hạn Hợp Đồng</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400">Giá thuê hàng tháng:</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {formatCurrency(viewingContract.rentPrice)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Tiền cọc giữ phòng:</span>
                  <div className="font-bold text-indigo-700 text-sm">
                    {formatCurrency(viewingContract.depositAmount)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Ngày bắt đầu:</span>
                  <div className="font-medium text-slate-800">
                    {formatDate(viewingContract.startDate)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Ngày kết thúc:</span>
                  <div className="font-medium text-slate-800">
                    {formatDate(viewingContract.endDate)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Ngày ký:</span>
                  <div className="font-medium text-slate-800">
                    {formatDate(viewingContract.signedDate)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Kỳ thanh toán:</span>
                  <div className="font-medium text-slate-800">
                    {viewingContract.paymentCycle === 'QUARTERLY' ? 'Theo quý (3 tháng/lần)' : 'Hàng tháng (1 tháng/lần)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            {(viewingContract.terms || viewingContract.note) && (
              <div className="p-3 border border-slate-200 rounded-md space-y-1">
                <div className="font-bold text-slate-700">Điều khoản & Ghi chú</div>
                <p className="text-slate-600 leading-relaxed">
                  {viewingContract.terms || viewingContract.note}
                </p>
              </div>
            )}
          </div>
        )}
      </SlideDrawer>

      {/* Modal: Create Contract */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-md p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Tạo Hợp Đồng Thuê Nhà Mới</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Khách thuê đại diện *</label>
                  <select
                    value={formTenantId}
                    onChange={(e) => setFormTenantId(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300 bg-white"
                    required
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Chọn phòng thuê *</label>
                  <select
                    value={formRoomId}
                    onChange={(e) => {
                      setFormRoomId(e.target.value);
                      const r = filteredRooms.find((rm) => rm.id === e.target.value);
                      if (r) {
                        setFormRentPrice(r.basePrice);
                        setFormDepositAmount(r.basePrice);
                      }
                    }}
                    className="w-full p-2 rounded-sm border border-slate-300 bg-white"
                    required
                  >
                    {filteredRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Phòng {r.roomNumber} (Tầng {r.floor}) - {formatCurrency(r.basePrice)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngày bắt đầu thuê</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngày kết thúc hợp đồng</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Giá thuê hàng tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={formRentPrice}
                    onChange={(e) => setFormRentPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tiền đặt cọc (VNĐ)</label>
                  <input
                    type="number"
                    value={formDepositAmount}
                    onChange={(e) => setFormDepositAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Điều khoản bổ sung</label>
                <textarea
                  rows={2}
                  value={formTerms}
                  onChange={(e) => setFormTerms(e.target.value)}
                  className="w-full p-2 rounded-sm border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-sm bg-slate-950 hover:bg-slate-800 text-white font-medium cursor-pointer"
                >
                  Lưu hợp đồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Contract */}
      {editingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-md p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Sửa Hợp Đồng {editingContract.code}
              </h3>
              <button
                onClick={() => setEditingContract(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Giá thuê hàng tháng</label>
                  <input
                    type="number"
                    value={formRentPrice}
                    onChange={(e) => setFormRentPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tiền đặt cọc</label>
                  <input
                    type="number"
                    value={formDepositAmount}
                    onChange={(e) => setFormDepositAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Điều khoản</label>
                <textarea
                  rows={2}
                  value={formTerms}
                  onChange={(e) => setFormTerms(e.target.value)}
                  className="w-full p-2 rounded-sm border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingContract(null)}
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

      {/* Modal: Renew Contract */}
      {renewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-md p-5 shadow-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Gia Hạn Hợp Đồng</h3>
            <p className="text-slate-500">
              Gia hạn cho hợp đồng <strong>{renewingContract.code}</strong> (Khách thuê: {renewingContract.tenantName}).
            </p>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Ngày kết thúc mới</label>
              <input
                type="date"
                value={newRenewEndDate}
                onChange={(e) => setNewRenewEndDate(e.target.value)}
                className="w-full p-2 rounded-sm border border-slate-300"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setRenewingContract(null)}
                className="px-3 py-1.5 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleRenewConfirm}
                className="px-4 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-600 text-white font-medium cursor-pointer"
              >
                Xác nhận gia hạn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Terminate / Delete Confirm */}
      <ConfirmDeleteModal
        isOpen={!!deletingContract}
        title={deletingContract?.status === 'TERMINATED' ? 'Xóa Hợp Đồng' : 'Thanh Lý Hợp Đồng'}
        message={
          deletingContract?.status === 'TERMINATED'
            ? `Bạn có chắc chắn muốn xóa vĩnh viễn hợp đồng ${deletingContract?.code}?`
            : `Xác nhận thanh lý hợp đồng ${deletingContract?.code} cho khách ${deletingContract?.tenantName}? Số tiền cọc ${formatCurrency(
                deletingContract?.depositAmount || 0
              )} sẽ được quyết toán hoàn trả.`
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingContract(null)}
      />

      {/* Modal: Print Contract */}
      <PrintContractModal
        contract={printingContract}
        property={selectedProperty}
        tenant={tenants.find((t) => t.id === printingContract?.tenantId)}
        onClose={() => setPrintingContract(null)}
      />
    </div>
  );
}
