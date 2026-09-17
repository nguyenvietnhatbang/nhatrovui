'use client';

import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Phone,
  User,
  X,
  Search,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MaintenanceTicket, TicketPriority, TicketStatus } from '@/types';
import { formatCurrency, formatDate, TICKET_PRIORITY_CONFIG, TICKET_STATUS_CONFIG } from '@/lib/formatters';
import { SlideDrawer } from '@/components/common/SlideDrawer';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';
import { TablePagination } from '@/components/common/TablePagination';

export default function MaintenancePage() {
  const {
    filteredTickets,
    filteredRooms,
    selectedProperty,
    addMaintenanceTicket,
    updateMaintenanceStatus,
    deleteMaintenanceTicket,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'KANBAN'>('TABLE');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<MaintenanceTicket | null>(null);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);
  const [resolvingTicket, setResolvingTicket] = useState<MaintenanceTicket | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<MaintenanceTicket | null>(null);

  // Add Ticket Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');
  const [newReportedBy, setNewReportedBy] = useState('');

  // Resolve Ticket Form
  const [resolveCost, setResolveCost] = useState(150000);
  const [resolvePaidBy, setResolvePaidBy] = useState<'OWNER' | 'TENANT'>('OWNER');

  // Filtered tickets
  const filtered = useMemo(() => {
    return filteredTickets.filter((t) => {
      const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
      let matchesSearch = true;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        matchesSearch =
          t.title.toLowerCase().includes(q) ||
          t.roomNumber.toLowerCase().includes(q) ||
          t.reportedBy.toLowerCase().includes(q) ||
          Boolean(t.technicianName && t.technicianName.toLowerCase().includes(q));
      }
      return matchesStatus && matchesSearch;
    });
  }, [filteredTickets, selectedStatus, searchTerm]);

  // Pagination
  const totalItems = filtered.length;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Checkbox selection
  const allSelected =
    paginatedTickets.length > 0 &&
    paginatedTickets.every((t) => selectedIds.includes(t.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      const currentIds = paginatedTickets.map((t) => t.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentIds])));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newRoomNumber) {
      alert('Vui lòng nhập tiêu đề sự cố và chọn số phòng!');
      return;
    }

    addMaintenanceTicket({
      propertyId: selectedProperty?.id || 'prop-1',
      roomId: `room-${newRoomNumber.toLowerCase().replace(/\D/g, '')}`,
      roomNumber: newRoomNumber,
      title: newTitle,
      description: newDescription,
      priority: newPriority,
      status: 'PENDING',
      reportedBy: newReportedBy || 'Khách thuê',
      cost: 0,
      paidBy: 'OWNER',
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewRoomNumber('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;
    updateMaintenanceStatus(resolvingTicket.id, 'RESOLVED', resolveCost);
    setResolvingTicket(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingTicket) return;
    deleteMaintenanceTicket(deletingTicket.id);
    setDeletingTicket(null);
  };

  return (
    <div className="space-y-3 pb-12">
      {/* Top Filter & Toolbar */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ tiếp nhận' },
            { id: 'IN_PROGRESS', label: 'Đang sửa chữa' },
            { id: 'RESOLVED', label: 'Đã hoàn thành' },
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

        {/* Right: Search + View toggle + Create button */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo sự cố, phòng, người báo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-sm bg-slate-50 p-0.5">
              <button
                onClick={() => setViewMode('TABLE')}
                title="Xem dạng bảng"
                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-400'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('KANBAN')}
                title="Xem dạng cột Kanban"
                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                  viewMode === 'KANBAN' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-400'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-950 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Báo sự cố</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: HIGH DENSITY TABLE */}
      {viewMode === 'TABLE' ? (
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
          {/* Desktop Table View */}
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
                  <th className="py-2.5 px-3 w-20">Phòng</th>
                  <th className="py-2.5 px-3">Tiêu đề & Mô tả sự cố</th>
                  <th className="py-2.5 px-3 w-28 text-center">Mức ưu tiên</th>
                  <th className="py-2.5 px-3 w-32">Người báo</th>
                  <th className="py-2.5 px-3 w-36">Thợ kỹ thuật</th>
                  <th className="py-2.5 px-3 text-right w-28">Chi phí</th>
                  <th className="py-2.5 px-3 w-36 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 w-32 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                      Không tìm thấy phiếu yêu cầu sửa chữa nào
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((t) => {
                    const isChecked = selectedIds.includes(t.id);
                    const priorityCfg = TICKET_PRIORITY_CONFIG[t.priority];
                    const statusCfg = TICKET_STATUS_CONFIG[t.status];

                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isChecked ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectOne(t.id)}
                            className="rounded-xs border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-xs font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                            P.{t.roomNumber}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{t.title}</div>
                          <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-medium">
                            {t.description}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${priorityCfg.badgeClass}`}
                          >
                            {priorityCfg.label}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-slate-800">
                          <div className="font-semibold">{t.reportedBy}</div>
                          <div className="text-[10px] text-slate-400">{formatDate(t.reportedAt)}</div>
                        </td>

                        <td className="py-2.5 px-3 text-slate-800">
                          {t.technicianName ? (
                            <div>
                              <div className="font-medium text-slate-900">{t.technicianName}</div>
                              <div className="text-[10px] text-slate-400">{t.technicianPhone}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Chưa phân công</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {t.cost > 0 ? formatCurrency(t.cost) : '---'}
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
                            {/* View Drawer */}
                            <button
                              onClick={() => setViewingTicket(t)}
                              title="Xem chi tiết"
                              className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Take task / Resolve */}
                            {t.status === 'PENDING' && (
                              <button
                                onClick={() => updateMaintenanceStatus(t.id, 'IN_PROGRESS')}
                                title="Nhận xử lý"
                                className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                            )}

                            {t.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => {
                                  setResolvingTicket(t);
                                  setResolveCost(150000);
                                }}
                                title="Nghiệm thu hoàn tất"
                                className="p-1 hover:text-emerald-600 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => setDeletingTicket(t)}
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
            {paginatedTickets.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Không tìm thấy phiếu yêu cầu sửa chữa nào
              </div>
            ) : (
              paginatedTickets.map((t) => {
                const priorityCfg = TICKET_PRIORITY_CONFIG[t.priority];
                const statusCfg = TICKET_STATUS_CONFIG[t.status];

                return (
                  <div
                    key={t.id}
                    className="p-3 bg-white rounded-md border border-slate-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xs font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                          P.{t.roomNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityCfg.badgeClass}`}
                        >
                          {priorityCfg.label}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusCfg.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dotClass}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-xs">{t.title}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-sm border border-slate-100">
                        {t.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Người báo</span>
                        <div className="font-medium text-slate-800 mt-0.5 truncate">{t.reportedBy}</div>
                        <div className="text-[10px] text-slate-400">{formatDate(t.reportedAt)}</div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Thợ phụ trách</span>
                        <div className="font-medium text-slate-800 mt-0.5 truncate">
                          {t.technicianName || <span className="text-slate-400 italic font-normal">Chưa phân công</span>}
                        </div>
                        {t.cost > 0 && (
                          <div className="text-[11px] font-mono font-bold text-slate-900">
                            {formatCurrency(t.cost)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => setViewingTicket(t)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {t.status === 'PENDING' && (
                          <button
                            onClick={() => updateMaintenanceStatus(t.id, 'IN_PROGRESS')}
                            className="px-2.5 py-1 rounded-sm bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            Nhận xử lý
                          </button>
                        )}
                        {t.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => {
                              setResolvingTicket(t);
                              setResolveCost(150000);
                            }}
                            className="px-2.5 py-1 rounded-sm bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            Nghiệm thu
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingTicket(t)}
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
      ) : (
        /* VIEW 2: COMPACT ENTERPRISE KANBAN */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['PENDING', 'IN_PROGRESS', 'RESOLVED'] as const).map((colStatus) => {
            const colTickets = filtered.filter((t) => t.status === colStatus);
            const colLabel =
              colStatus === 'PENDING'
                ? 'Chờ tiếp nhận'
                : colStatus === 'IN_PROGRESS'
                ? 'Đang sửa chữa'
                : 'Đã hoàn tất';

            return (
              <div
                key={colStatus}
                className="bg-white p-3 rounded-md border border-slate-200 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        colStatus === 'PENDING'
                          ? 'bg-amber-500'
                          : colStatus === 'IN_PROGRESS'
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      {colLabel}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-slate-100 text-slate-700">
                    {colTickets.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {colTickets.map((ticket) => {
                    const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];
                    return (
                      <div
                        key={ticket.id}
                        className="bg-white p-3 rounded-md border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-1.5 py-0.5 rounded-xs text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            P.{ticket.roomNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityCfg.badgeClass}`}
                          >
                            {priorityCfg.label}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900">
                            {ticket.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 font-medium">
                            {ticket.description}
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span>Báo bởi: {ticket.reportedBy}</span>
                          <div className="flex items-center gap-1">
                            {ticket.status === 'PENDING' && (
                              <button
                                onClick={() => updateMaintenanceStatus(ticket.id, 'IN_PROGRESS')}
                                className="px-2 py-0.5 rounded-xs bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 text-[11px] cursor-pointer"
                              >
                                Nhận sửa
                              </button>
                            )}
                            {ticket.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => {
                                  setResolvingTicket(ticket);
                                  setResolveCost(150000);
                                }}
                                className="px-2 py-0.5 rounded-xs bg-emerald-600 text-white font-medium hover:bg-emerald-700 text-[11px] cursor-pointer"
                              >
                                Nghiệm thu
                              </button>
                            )}
                            {ticket.status === 'RESOLVED' && (
                              <span className="font-bold text-slate-900">
                                {formatCurrency(ticket.cost)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SlideDrawer: Ticket details */}
      <SlideDrawer
        isOpen={!!viewingTicket}
        onClose={() => setViewingTicket(null)}
        title={`Sự Cố Phòng ${viewingTicket?.roomNumber || ''}`}
      >
        {viewingTicket && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium">Trạng thái:</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      TICKET_STATUS_CONFIG[viewingTicket.status].badgeClass
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        TICKET_STATUS_CONFIG[viewingTicket.status].dotClass
                      }`}
                    />
                    {TICKET_STATUS_CONFIG[viewingTicket.status].label}
                  </span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  TICKET_PRIORITY_CONFIG[viewingTicket.priority].badgeClass
                }`}
              >
                Ưu tiên {TICKET_PRIORITY_CONFIG[viewingTicket.priority].label}
              </span>
            </div>

            <div className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="font-bold text-slate-800 text-sm">{viewingTicket.title}</div>
              <p className="text-slate-600 leading-relaxed">{viewingTicket.description}</p>
            </div>

            <div className="p-3 border border-slate-200 rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Phòng:</span>
                  <div className="font-bold text-slate-800">Phòng {viewingTicket.roomNumber}</div>
                </div>
                <div>
                  <span className="text-slate-400">Người báo:</span>
                  <div className="font-bold text-slate-800">{viewingTicket.reportedBy}</div>
                </div>
                <div>
                  <span className="text-slate-400">Ngày tạo:</span>
                  <div className="font-medium text-slate-700">{formatDate(viewingTicket.reportedAt)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Chi phí xử lý:</span>
                  <div className="font-bold text-rose-600">
                    {viewingTicket.cost > 0 ? formatCurrency(viewingTicket.cost) : 'Chưa phát sinh'}
                  </div>
                </div>
              </div>
            </div>

            {viewingTicket.technicianName && (
              <div className="p-3 border border-slate-200 rounded-md space-y-1">
                <div className="font-bold text-slate-700">Kỹ thuật viên phụ trách:</div>
                <div className="text-slate-800 font-medium">
                  {viewingTicket.technicianName} ({viewingTicket.technicianPhone})
                </div>
              </div>
            )}
          </div>
        )}
      </SlideDrawer>

      {/* Modal: Add Ticket */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-md p-5 shadow-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">Tiếp Nhận Sự Cố & Hỏng Hóc</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phòng xảy ra sự cố *</label>
                <select
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full p-2 rounded-sm border border-slate-300 bg-white"
                  required
                >
                  <option value="">-- Chọn số phòng --</option>
                  {filteredRooms.map((r) => (
                    <option key={r.id} value={r.roomNumber}>
                      Phòng {r.roomNumber} - Tầng {r.floor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tiêu đề sự cố *</label>
                <input
                  type="text"
                  placeholder="Vd: Chảy nước máy lạnh, gãy vòi sen..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 rounded-sm border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mô tả chi tiết tình trạng</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả hiện tượng để thợ chuẩn bị đồ nghề..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 rounded-sm border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full p-2 rounded-sm border border-slate-300 bg-white"
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Bình thường</option>
                    <option value="HIGH">Quan trọng</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Người báo</label>
                  <input
                    type="text"
                    placeholder="Tên khách hoặc tạp vụ"
                    value={newReportedBy}
                    onChange={(e) => setNewReportedBy(e.target.value)}
                    className="w-full p-2 rounded-sm border border-slate-300"
                  />
                </div>
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
                  Tạo phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Ticket */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-md p-5 shadow-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Nghiệm Thu Sự Cố</h3>
            <p className="text-slate-500">
              Nghiệm thu phiếu: <strong>{resolvingTicket.title}</strong> (Phòng {resolvingTicket.roomNumber}).
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Chi phí thực tế phát sinh (VNĐ)</label>
                <input
                  type="number"
                  value={resolveCost}
                  onChange={(e) => setResolveCost(Number(e.target.value))}
                  className="w-full p-2 rounded-sm border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Bên chịu chi phí</label>
                <select
                  value={resolvePaidBy}
                  onChange={(e) => setResolvePaidBy(e.target.value as any)}
                  className="w-full p-2 rounded-sm border border-slate-300 bg-white"
                >
                  <option value="OWNER">Chủ trọ chịu chi phí</option>
                  <option value="TENANT">Khách thuê làm hỏng (trừ vào tiền phòng)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-3 py-1.5 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
                >
                  Hoàn tất nghiệm thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete confirm */}
      <ConfirmDeleteModal
        isOpen={!!deletingTicket}
        title="Xóa Phiếu Sự Cố"
        message={`Bạn có chắc chắn muốn xóa phiếu sự cố "${deletingTicket?.title}" của phòng ${deletingTicket?.roomNumber}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTicket(null)}
      />
    </div>
  );
}
