'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Building2,
  Layers,
  Wrench,
  AlertTriangle,
  Phone,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Room, RoomStatus, RoomType } from '@/types';
import { formatCurrency, ROOM_STATUS_CONFIG } from '@/lib/formatters';
import { AvatarLetter } from '@/components/common/AvatarLetter';
import { SlideDrawer } from '@/components/common/SlideDrawer';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { TablePagination } from '@/components/common/TablePagination';

export default function RoomsPage() {
  const { filteredRooms, tenants, contracts, assets, invoices, updateRoomStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | 'ALL'>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals & Drawer states
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for editing room
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<RoomStatus>('VACANT');
  const [editArea, setEditArea] = useState<number>(20);

  // Form states for adding room
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newType, setNewType] = useState<RoomType>('STUDIO');
  const [newBasePrice, setNewBasePrice] = useState(4500000);
  const [newArea, setNewArea] = useState(25);

  // Listen to global "+ Tạo" event from Header
  useEffect(() => {
    const handleOpenAdd = () => setIsAddModalOpen(true);
    window.addEventListener('open-add-room-modal', handleOpenAdd);
    return () => window.removeEventListener('open-add-room-modal', handleOpenAdd);
  }, []);

  const availableFloors = useMemo(() => {
    return Array.from(new Set(filteredRooms.map((r) => r.floor))).sort((a, b) => a - b);
  }, [filteredRooms]);

  // Filtered rooms
  const displayedRooms = useMemo(() => {
    return filteredRooms.filter((room) => {
      const matchesStatus = selectedStatus === 'ALL' || room.status === selectedStatus;
      const matchesFloor = selectedFloor === 'ALL' || room.floor === selectedFloor;

      let matchesSearch = true;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const tenant = tenants.find((t) => t.id === room.currentTenantId);
        matchesSearch = Boolean(
          room.roomNumber.toLowerCase().includes(q) ||
          (tenant && tenant.name.toLowerCase().includes(q)) ||
          (tenant && tenant.phone.includes(q))
        );
      }

      return matchesStatus && matchesFloor && matchesSearch;
    });
  }, [filteredRooms, selectedStatus, selectedFloor, searchTerm, tenants]);

  // Paginated rooms
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedRooms.slice(start, start + pageSize);
  }, [displayedRooms, currentPage, pageSize]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedRooms.map((r) => r.id)));
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

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setEditPrice(room.basePrice);
    setEditStatus(room.status);
    setEditArea(room.area);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    updateRoomStatus(editingRoom.id, editStatus);
    editingRoom.basePrice = editPrice;
    editingRoom.area = editArea;

    alert(`Cập nhật thông tin phòng ${editingRoom.roomNumber} thành công!`);
    setEditingRoom(null);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) {
      alert('Vui lòng nhập số phòng!');
      return;
    }

    const newId = `room-${Date.now()}`;
    const newRoom: Room = {
      id: newId,
      propertyId: 'prop-1',
      roomNumber: newRoomNumber,
      floor: newFloor,
      type: newType,
      basePrice: newBasePrice,
      area: newArea,
      maxOccupants: 2,
      status: 'VACANT',
      amenities: ['Máy lạnh', 'Tủ lạnh', 'Giường nệm', 'Khóa vân tay'],
    };

    filteredRooms.unshift(newRoom);
    alert(`Đã tạo mới phòng ${newRoomNumber} thành công!`);
    setIsAddModalOpen(false);
    setNewRoomNumber('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
      {/* Filter Bar (AnViet CRM style) */}
      <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 bg-white text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:outline-hidden focus:border-slate-800 cursor-pointer"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="OCCUPIED">Đang thuê</option>
            <option value="VACANT">Phòng trống</option>
            <option value="OVERDUE">Nợ quá hạn</option>
            <option value="RESERVED">Đã cọc giữ</option>
            <option value="MAINTENANCE">Đang sửa chữa</option>
          </select>

          {/* Floor Dropdown */}
          <select
            value={selectedFloor}
            onChange={(e) =>
              setSelectedFloor(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:outline-hidden focus:border-slate-800 cursor-pointer"
          >
            <option value="ALL">Tầng: Tất cả</option>
            {availableFloors.map((floor) => (
              <option key={floor} value={floor}>
                Tầng {floor}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Số phòng / Tên khách / SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:border-slate-800"
            />
          </div>
        </div>

        {/* Right Tools & View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded p-0.5">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1 rounded ${
                viewMode === 'TABLE' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Xem danh sách bảng"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1 rounded ${
                viewMode === 'GRID' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Xem lưới sơ đồ"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tạo</span>
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      {viewMode === 'TABLE' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="border-b border-slate-200 bg-slate-100/90 text-slate-900 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedRooms.length > 0 &&
                      paginatedRooms.every((r) => selectedIds.has(r.id))
                    }
                    className="rounded border-slate-300 text-slate-900"
                  />
                </th>
                <th className="py-2.5 px-3">Mã phòng</th>
                <th className="py-2.5 px-3">Tầng</th>
                <th className="py-2.5 px-3">Loại phòng</th>
                <th className="py-2.5 px-3">Diện tích</th>
                <th className="py-2.5 px-3 text-right">Đơn giá thuê</th>
                <th className="py-2.5 px-3">Khách thuê hiện tại</th>
                <th className="py-2.5 px-3">Số điện thoại</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRooms.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Không tìm thấy phòng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedRooms.map((room) => {
                  const isSelected = selectedIds.has(room.id);
                  const tenant = tenants.find((t) => t.id === room.currentTenantId);
                  const statusCfg = ROOM_STATUS_CONFIG[room.status];

                  return (
                    <tr
                      key={room.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(room.id)}
                          className="rounded border-slate-300 text-slate-900"
                        />
                      </td>

                      <td className="py-2 px-3 font-black text-slate-900 text-sm">
                        {room.roomNumber}
                      </td>

                      <td className="py-2 px-3 text-slate-700 font-medium">Tầng {room.floor}</td>

                      <td className="py-2 px-3 font-medium text-slate-800">{room.type}</td>

                      <td className="py-2 px-3 text-slate-600 font-medium">{room.area} m²</td>

                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                        {formatCurrency(room.basePrice)}
                      </td>

                      <td className="py-2 px-3">
                        {tenant ? (
                          <div className="flex items-center gap-2">
                            <AvatarLetter name={tenant.name} size="sm" color="blue" />
                            <span className="font-bold text-slate-900">{tenant.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa có khách</span>
                        )}
                      </td>

                      <td className="py-2 px-3 font-mono text-slate-900 font-medium">
                        {tenant ? tenant.phone : '-'}
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
                          <button
                            onClick={() => setViewingRoom(room)}
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Xem chi tiết phòng (Trượt phải)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(room)}
                            className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Sửa phòng"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingRoom(room)}
                            className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Xóa phòng"
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
      ) : (
        /* Compact Grid Matrix */
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {displayedRooms.map((room) => {
            const tenant = tenants.find((t) => t.id === room.currentTenantId);
            const statusCfg = ROOM_STATUS_CONFIG[room.status];

            return (
              <div
                key={room.id}
                onClick={() => setViewingRoom(room)}
                className="p-2.5 rounded-md border border-slate-200 bg-white hover:border-slate-800 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-sm text-slate-900">{room.roomNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${statusCfg.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-900 mt-1">
                    {formatCurrency(room.basePrice)}
                  </div>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-slate-100 text-[11px] truncate">
                  {tenant ? (
                    <span className="font-bold text-slate-900">{tenant.name}</span>
                  ) : (
                    <span className="text-slate-400 italic">Trống</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalItems={displayedRooms.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Slide-over Drawer for Viewing Room Details */}
      <SlideDrawer
        isOpen={Boolean(viewingRoom)}
        onClose={() => setViewingRoom(null)}
        title={viewingRoom ? `Chi Tiết Phòng ${viewingRoom.roomNumber}` : ''}
        subtitle={
          viewingRoom
            ? `Tầng ${viewingRoom.floor} • ${viewingRoom.type} • ${viewingRoom.area} m²`
            : ''
        }
      >
        {viewingRoom && (
          <div className="space-y-4 text-xs text-slate-700">
            {/* Price & Status banner */}
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-slate-500 font-medium">Giá thuê niêm yết:</div>
                <div className="text-base font-black text-slate-900 font-mono">
                  {formatCurrency(viewingRoom.basePrice)}/tháng
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  ROOM_STATUS_CONFIG[viewingRoom.status].badgeClass
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    ROOM_STATUS_CONFIG[viewingRoom.status].dotClass
                  }`}
                />
                {ROOM_STATUS_CONFIG[viewingRoom.status].label}
              </span>
            </div>

            {/* Tenant details if any */}
            {viewingRoom.currentTenantId ? (
              (() => {
                const currentTenant = tenants.find((t) => t.id === viewingRoom.currentTenantId);
                return currentTenant ? (
                  <div className="p-4 border border-slate-200 rounded space-y-2">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                      Khách thuê hiện tại
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Họ và tên:</span>
                      <span className="font-bold text-slate-900">{currentTenant.name}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Số điện thoại:</span>
                      <span className="font-mono">{currentTenant.phone}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Số CCCD:</span>
                      <span className="font-mono">{currentTenant.cccd}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Quê quán:</span>
                      <span>{currentTenant.hometown}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Biển số xe:</span>
                      <span className="font-mono">{currentTenant.vehiclePlate || '-'}</span>
                    </div>
                  </div>
                ) : null;
              })()
            ) : (
              <div className="p-4 text-center text-slate-400 border border-dashed rounded">
                Phòng hiện đang trống, sẵn sàng cho khách mới vào ở.
              </div>
            )}

            {/* Assets in room */}
            <div className="p-4 border border-slate-200 rounded space-y-2">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider pb-1 border-b border-slate-100">
                Tài sản & thiết bị bàn giao
              </div>
              {assets
                .filter((a) => a.roomId === viewingRoom.id)
                .map((asset) => (
                  <div
                    key={asset.id}
                    className="flex justify-between py-1 border-b border-slate-50 last:border-none"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{asset.name}</div>
                      <div className="text-slate-400 text-[10px] font-mono">{asset.code}</div>
                    </div>
                    <span className="font-mono font-semibold">
                      {formatCurrency(asset.compensationPrice)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </SlideDrawer>

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-100">
          <div className="bg-white w-full max-w-md rounded-md shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Chỉnh Sửa Phòng {editingRoom.roomNumber}
              </h3>
              <button onClick={() => setEditingRoom(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trạng thái phòng</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as RoomStatus)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-bold"
                >
                  <option value="OCCUPIED">Đang thuê</option>
                  <option value="VACANT">Phòng trống</option>
                  <option value="OVERDUE">Nợ quá hạn</option>
                  <option value="RESERVED">Đã cọc giữ</option>
                  <option value="MAINTENANCE">Đang sửa chữa</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giá thuê (VND/tháng)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diện tích (m²)</label>
                <input
                  type="number"
                  value={editArea}
                  onChange={(e) => setEditArea(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-bold"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-100">
          <div className="bg-white w-full max-w-md rounded-md shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Thêm Phòng Mới Vào Cơ Sở</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số phòng *</label>
                  <input
                    type="text"
                    placeholder="P.501"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thuộc tầng</label>
                  <input
                    type="number"
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại phòng</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as RoomType)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                  >
                    <option value="STUDIO">STUDIO</option>
                    <option value="LOFT">LOFT (Gác lửng)</option>
                    <option value="ONE_BED">ONE_BED (1 Phòng ngủ)</option>
                    <option value="TWO_BED">TWO_BED (2 Phòng ngủ)</option>
                    <option value="DUPLEX">DUPLEX</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diện tích (m²)</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giá thuê (VND/tháng)</label>
                <input
                  type="number"
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 font-mono font-bold"
                  required
                />
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
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-bold"
                >
                  Tạo phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingRoom)}
        onClose={() => setDeletingRoom(null)}
        onConfirm={() => {
          if (deletingRoom) {
            const index = filteredRooms.findIndex((r) => r.id === deletingRoom.id);
            if (index !== -1) filteredRooms.splice(index, 1);
            alert(`Đã xóa phòng ${deletingRoom.roomNumber} khỏi hệ thống!`);
          }
        }}
        title="Xác nhận xóa phòng"
        message={`Bạn có chắc muốn xóa phòng ${deletingRoom?.roomNumber}? Dữ liệu liên quan đến phòng này sẽ bị xóa bỏ.`}
      />
    </div>
  );
}
