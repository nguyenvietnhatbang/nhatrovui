'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Columns,
  RefreshCw,
  Phone,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  X,
  User,
  Car,
  Briefcase,
  MapPin,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Tenant, TemporaryResidenceStatus } from '@/types';
import { formatDate, formatCurrency, TEMPORARY_RESIDENCE_CONFIG } from '@/lib/formatters';
import { AvatarLetter } from '@/components/common/AvatarLetter';
import { SlideDrawer } from '@/components/common/SlideDrawer';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { TablePagination } from '@/components/common/TablePagination';
import { ExportTamTruModal } from '@/components/tenants/ExportTamTruModal';

export default function TenantsPage() {
  const {
    filteredTenants,
    filteredRooms,
    selectedProperty,
    addTenant,
    updateTenant,
    deleteTenant,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals & Drawer states
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportTamTruOpen, setIsExportTamTruOpen] = useState(false);

  // Form states for new/edit tenant
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cccd: '',
    hometown: '',
    job: '',
    roomId: '',
    vehiclePlate: '',
    temporaryResidenceStatus: 'REGISTERED' as TemporaryResidenceStatus,
  });

  // Listen to global "+ Tạo" event from Header
  useEffect(() => {
    const handleOpenAdd = () => setIsAddModalOpen(true);
    window.addEventListener('open-add-tenant-modal', handleOpenAdd);
    return () => window.removeEventListener('open-add-tenant-modal', handleOpenAdd);
  }, []);

  const vacantRooms = filteredRooms.filter((r) => r.status === 'VACANT' || r.status === 'RESERVED');

  // Filtered dataset
  const displayedTenants = useMemo(() => {
    return filteredTenants.filter((tenant) => {
      const matchesStatus =
        selectedStatus === 'ALL' || tenant.temporaryResidenceStatus === selectedStatus;
      const matchesRoom =
        selectedRoomFilter === 'ALL' || tenant.roomId === selectedRoomFilter;

      let matchesSearch = true;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        matchesSearch = Boolean(
          tenant.name.toLowerCase().includes(q) ||
          tenant.phone.includes(q) ||
          tenant.cccd.includes(q) ||
          tenant.hometown.toLowerCase().includes(q) ||
          (tenant.vehiclePlate && tenant.vehiclePlate.toLowerCase().includes(q))
        );
      }

      return matchesStatus && matchesRoom && matchesSearch;
    });
  }, [filteredTenants, selectedStatus, selectedRoomFilter, searchTerm]);

  // Paginated dataset
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedTenants.slice(start, start + pageSize);
  }, [displayedTenants, currentPage, pageSize]);

  // Select all checkbox handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedTenants.map((t) => t.id)));
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

  const handleCall = (phone: string, name: string) => {
    navigator.clipboard.writeText(phone);
    alert(`Đã sao chép số điện thoại của ${name}: ${phone}`);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      cccd: tenant.cccd,
      hometown: tenant.hometown,
      job: tenant.job,
      roomId: tenant.roomId,
      vehiclePlate: tenant.vehiclePlate || '',
      temporaryResidenceStatus: tenant.temporaryResidenceStatus,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    updateTenant({
      ...editingTenant,
      name: formData.name,
      phone: formData.phone,
      cccd: formData.cccd,
      hometown: formData.hometown,
      job: formData.job,
      roomId: formData.roomId,
      vehiclePlate: formData.vehiclePlate || undefined,
      temporaryResidenceStatus: formData.temporaryResidenceStatus,
    });

    alert('Cập nhật thông tin khách thuê thành công!');
    setEditingTenant(null);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.cccd || !formData.roomId) {
      alert('Vui lòng điền đủ Họ tên, Số điện thoại, CCCD và Chọn phòng!');
      return;
    }

    addTenant({
      propertyId: selectedProperty?.id || 'prop-1',
      roomId: formData.roomId,
      name: formData.name,
      phone: formData.phone,
      cccd: formData.cccd,
      cccdIssueDate: '2023-01-01',
      cccdIssuePlace: 'Cục Cảnh sát QLHC về TTXH',
      birthDate: '1998-01-01',
      hometown: formData.hometown || 'Việt Nam',
      job: formData.job || 'Nhân viên văn phòng',
      isRepresentative: true,
      temporaryResidenceStatus: formData.temporaryResidenceStatus,
      vehiclePlate: formData.vehiclePlate || undefined,
      vehicleModel: formData.vehiclePlate ? 'Xe máy' : undefined,
      startDate: new Date().toISOString().split('T')[0],
      reputation: 'GOOD',
      members: [],
    });

    alert(`Đã tiếp nhận khách ${formData.name} vào phòng thành công!`);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      cccd: '',
      hometown: '',
      job: '',
      roomId: '',
      vehiclePlate: '',
      temporaryResidenceStatus: 'REGISTERED',
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
      {/* Top Filter Bar (Replicating AnViet CRM Layout) */}
      <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 bg-white text-xs">
        {/* Left Filter Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:outline-hidden focus:border-slate-800 cursor-pointer"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="REGISTERED">Đã khai báo CA</option>
            <option value="NOT_REGISTERED">Chưa khai báo CA</option>
            <option value="EXPIRING">Sắp hết hạn tạm trú</option>
          </select>

          {/* Room Dropdown */}
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:outline-hidden focus:border-slate-800 cursor-pointer"
          >
            <option value="ALL">Phòng: Tất cả</option>
            {filteredRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roomNumber} (Tầng {r.floor})
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tên / mã / SĐT / CCCD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:border-slate-800"
            />
          </div>
        </div>

        {/* Right Action Utilities */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSearchTerm('')}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
            title="Làm mới bộ lọc"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExportTamTruOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Khai báo tạm trú</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tạo</span>
          </button>
        </div>
      </div>

      {/* High Density Table Grid (Matching AnViet CRM Table exactly) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="border-b border-slate-200 bg-slate-100/90 text-slate-900 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    paginatedTenants.length > 0 &&
                    paginatedTenants.every((t) => selectedIds.has(t.id))
                  }
                  className="rounded border-slate-300 text-slate-900"
                />
              </th>
              <th className="py-2.5 px-3">Mã KH</th>
              <th className="py-2.5 px-3">Họ và tên</th>
              <th className="py-2.5 px-3">Phân loại</th>
              <th className="py-2.5 px-3">Số điện thoại</th>
              <th className="py-2.5 px-3">Số CCCD</th>
              <th className="py-2.5 px-3">Quê quán</th>
              <th className="py-2.5 px-3">Phòng ở</th>
              <th className="py-2.5 px-3 text-right">Công nợ</th>
              <th className="py-2.5 px-3 text-center">Trạng thái tạm trú</th>
              <th className="py-2.5 px-3 text-center w-28">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedTenants.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  Không tìm thấy khách thuê nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              paginatedTenants.map((tenant) => {
                const isSelected = selectedIds.has(tenant.id);
                const room = filteredRooms.find((r) => r.id === tenant.roomId);
                const isOverdue = room?.status === 'OVERDUE';
                const debtAmount = isOverdue ? 4900000 : 0;
                const tamTruCfg = TEMPORARY_RESIDENCE_CONFIG[tenant.temporaryResidenceStatus];

                return (
                  <tr
                    key={tenant.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(tenant.id)}
                        className="rounded border-slate-300 text-slate-900"
                      />
                    </td>

                    {/* Mã KH */}
                    <td className="py-2 px-3 font-mono font-medium text-slate-700 text-[12px]">
                      KH-2026-{tenant.id.replace('tenant-', '').slice(-5).toUpperCase()}
                    </td>

                    {/* Tổ chức / Tên KH with Circle Letter Avatar */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <AvatarLetter name={tenant.name} size="md" color="blue" />
                        <div>
                          <button
                            onClick={() => setViewingTenant(tenant)}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left text-xs cursor-pointer"
                          >
                            {tenant.name}
                          </button>
                          {tenant.job && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {tenant.job}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phân loại */}
                    <td className="py-2 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                        {tenant.members.length > 0 ? 'Ở ghép' : 'Cá nhân'}
                      </span>
                    </td>

                    {/* Số điện thoại */}
                    <td className="py-2 px-3 font-mono text-slate-900 font-medium">
                      {tenant.phone || '-'}
                    </td>

                    {/* Số CCCD */}
                    <td className="py-2 px-3 font-mono text-slate-900 font-medium">
                      {tenant.cccd}
                    </td>

                    {/* Quê quán */}
                    <td className="py-2 px-3 text-slate-800 font-medium truncate max-w-[140px]">
                      {tenant.hometown || '-'}
                    </td>

                    {/* Phòng đang ở */}
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {room ? room.roomNumber : '-'}
                    </td>

                    {/* Công nợ */}
                    <td
                      className={`py-2 px-3 text-right font-mono ${
                        isOverdue ? 'text-rose-700 font-black' : 'text-slate-900 font-medium'
                      }`}
                    >
                      {formatCurrency(debtAmount)}
                    </td>

                    {/* Trạng thái tạm trú */}
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${tamTruCfg.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tamTruCfg.dotClass}`} />
                        {tamTruCfg.label}
                      </span>
                    </td>

                    {/* Thao tác (4 Icons exact matching screenshot) */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* 1. Phone Call (Green) */}
                        <button
                          onClick={() => handleCall(tenant.phone, tenant.name)}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                          title={`Gọi ${tenant.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. View Slide Drawer (Eye) */}
                        <button
                          onClick={() => setViewingTenant(tenant)}
                          className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Xem chi tiết hồ sơ (Trượt cạnh phải)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* 3. Edit Modal (Pencil) */}
                        <button
                          onClick={() => handleOpenEdit(tenant)}
                          className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* 4. Delete (Trash Red) */}
                        <button
                          onClick={() => setDeletingTenant(tenant)}
                          className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa khách khỏi phòng"
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

      {/* Bottom Pagination Bar (Exact matching AnViet CRM screenshot) */}
      <TablePagination
        currentPage={currentPage}
        totalItems={displayedTenants.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Slide-over Right Drawer for Viewing Tenant Profile */}
      <SlideDrawer
        isOpen={Boolean(viewingTenant)}
        onClose={() => setViewingTenant(null)}
        title={viewingTenant ? `Hồ Sơ Khách Thuê: ${viewingTenant.name}` : ''}
        subtitle={viewingTenant ? `CCCD: ${viewingTenant.cccd} • SĐT: ${viewingTenant.phone}` : ''}
      >
        {viewingTenant && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Header info */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-md border border-slate-200">
              <AvatarLetter name={viewingTenant.name} size="lg" color="blue" />
              <div>
                <div className="font-bold text-sm text-slate-900">{viewingTenant.name}</div>
                <div className="text-slate-500">{viewingTenant.job} • {viewingTenant.hometown}</div>
              </div>
            </div>

            {/* Info grid */}
            <div className="space-y-2 border border-slate-200 rounded-md p-3.5">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                Thông tin định danh & cư trú
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Số CCCD / Hộ chiếu:</span>
                <span className="font-mono font-bold text-slate-900">{viewingTenant.cccd}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Ngày cấp:</span>
                <span>{formatDate(viewingTenant.cccdIssueDate)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Nơi cấp:</span>
                <span>{viewingTenant.cccdIssuePlace}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Ngày sinh:</span>
                <span>{formatDate(viewingTenant.birthDate)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Quê quán (Thường trú):</span>
                <span>{viewingTenant.hometown}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Khai báo tạm trú CA:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    TEMPORARY_RESIDENCE_CONFIG[viewingTenant.temporaryResidenceStatus].badgeClass
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      TEMPORARY_RESIDENCE_CONFIG[viewingTenant.temporaryResidenceStatus].dotClass
                    }`}
                  />
                  {TEMPORARY_RESIDENCE_CONFIG[viewingTenant.temporaryResidenceStatus].label}
                </span>
              </div>
            </div>

            {/* Vehicle */}
            <div className="space-y-2 border border-slate-200 rounded-md p-3.5">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                Phương tiện & gửi xe
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Biển số xe:</span>
                <span className="font-mono font-bold text-slate-900">
                  {viewingTenant.vehiclePlate || 'Không đăng ký xe'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Loại xe:</span>
                <span>{viewingTenant.vehicleModel || '-'}</span>
              </div>
            </div>

            {/* Room Members */}
            <div>
              <div className="font-bold text-slate-800 text-xs mb-2">
                Thành viên ở cùng ({viewingTenant.members.length} người)
              </div>
              {viewingTenant.members.length === 0 ? (
                <div className="p-3 text-center text-slate-400 border border-dashed rounded-md">
                  Khách ở một mình, không có người ở ghép.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {viewingTenant.members.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{m.name}</div>
                        <div className="text-slate-400 text-[11px]">
                          {m.relation} • SĐT: {m.phone} • CCCD: {m.cccd}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Đã đăng ký tạm trú
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SlideDrawer>

      {/* Edit Tenant Modal Popup */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-100">
          <div className="bg-white w-full max-w-lg rounded-md shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Chỉnh Sửa Khách Thuê: {editingTenant.name}
              </h3>
              <button
                onClick={() => setEditingTenant(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:border-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:border-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số CCCD *</label>
                  <input
                    type="text"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:border-slate-800 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quê quán</label>
                  <input
                    type="text"
                    value={formData.hometown}
                    onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nghề nghiệp</label>
                  <input
                    type="text"
                    value={formData.job}
                    onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Biển số xe máy</label>
                  <input
                    type="text"
                    value={formData.vehiclePlate}
                    onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 focus:border-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tình trạng tạm trú CA</label>
                <select
                  value={formData.temporaryResidenceStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temporaryResidenceStatus: e.target.value as TemporaryResidenceStatus,
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-medium"
                >
                  <option value="REGISTERED">Đã khai báo công an phường</option>
                  <option value="NOT_REGISTERED">Chưa khai báo</option>
                  <option value="EXPIRING">Sắp hết hạn tạm trú</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Tenant Modal Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-100">
          <div className="bg-white w-full max-w-lg rounded-md shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-100">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Thêm Khách Thuê Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chọn phòng còn trống *
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-bold"
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {vacantRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roomNumber} - Tầng {r.floor} ({r.type} - {formatCurrency(r.basePrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    placeholder="0912 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số CCCD *</label>
                  <input
                    type="text"
                    placeholder="079098012456"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quê quán</label>
                  <input
                    type="text"
                    placeholder="Hải Phòng"
                    value={formData.hometown}
                    onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nghề nghiệp</label>
                  <input
                    type="text"
                    placeholder="Kỹ sư phần mềm"
                    value={formData.job}
                    onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Biển số xe máy</label>
                  <input
                    type="text"
                    placeholder="29-B1 123.45"
                    value={formData.vehiclePlate}
                    onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs"
                >
                  Tạo khách thuê
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingTenant)}
        onClose={() => setDeletingTenant(null)}
        onConfirm={() => {
          if (deletingTenant) {
            deleteTenant(deletingTenant.id);
            alert(`Đã xóa khách thuê ${deletingTenant.name} khỏi hệ thống!`);
          }
        }}
        title="Xác nhận xóa khách thuê"
        message={`Bạn có chắc muốn xóa khách ${deletingTenant?.name}? Phòng sẽ được chuyển về trạng thái Trống.`}
      />

      {/* Export Tam Tru Modal */}
      <ExportTamTruModal
        isOpen={isExportTamTruOpen}
        onClose={() => setIsExportTamTruOpen(false)}
        tenants={displayedTenants}
        property={selectedProperty}
      />
    </div>
  );
}
