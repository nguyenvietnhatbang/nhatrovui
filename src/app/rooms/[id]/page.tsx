'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  User,
  Users,
  FileText,
  Zap,
  Droplets,
  Receipt,
  Wrench,
  Boxes,
  Plus,
  Phone,
  QrCode,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Printer,
  Edit2,
  Trash2,
  Check,
  Copy,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  formatCurrency,
  formatDate,
  ROOM_STATUS_CONFIG,
  CONTRACT_STATUS_CONFIG,
  INVOICE_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  TICKET_STATUS_CONFIG,
  TEMPORARY_RESIDENCE_CONFIG,
} from '@/lib/formatters';
import { RoomStatus, AssetCondition, TicketPriority } from '@/types';
import { PrintContractModal } from '@/components/contracts/PrintContractModal';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const {
    rooms,
    tenants,
    contracts,
    assets,
    utilityReadings,
    invoices,
    maintenanceTickets,
    properties,
    updateRoomStatus,
    markInvoicePaid,
    addMaintenanceTicket,
    updateMaintenanceStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'CONTRACT' | 'UTILITIES' | 'INVOICES' | 'ASSETS' | 'MAINTENANCE'
  >('OVERVIEW');

  // Modal states
  const [printingContract, setPrintingContract] = useState<any>(null);
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('MEDIUM');

  // Status dropdown state
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [copiedTransfer, setCopiedTransfer] = useState(false);

  // Lookup target room
  const room = useMemo(() => {
    return rooms.find((r) => r.id === roomId || r.roomNumber.replace('.', '').toLowerCase() === roomId.toLowerCase());
  }, [rooms, roomId]);

  // Associated property
  const property = useMemo(() => {
    if (!room) return properties[0];
    return properties.find((p) => p.id === room.propertyId) || properties[0];
  }, [room, properties]);

  // Associated representative tenant
  const tenant = useMemo(() => {
    if (!room) return null;
    return tenants.find((t) => t.id === room.currentTenantId || t.roomId === room.id);
  }, [room, tenants]);

  // Roommates / members
  const members = tenant?.members || [];

  // Active contract & contract history
  const roomContracts = useMemo(() => {
    if (!room) return [];
    return contracts.filter((c) => c.roomId === room.id || c.roomId === roomId);
  }, [contracts, room, roomId]);

  const activeContract = useMemo(() => {
    return roomContracts.find((c) => c.status === 'ACTIVE' || c.status === 'EXPIRING_SOON') || roomContracts[0];
  }, [roomContracts]);

  // Utility readings for this room
  const roomReadings = useMemo(() => {
    if (!room) return [];
    return utilityReadings
      .filter((u) => u.roomId === room.id || u.roomNumber === room.roomNumber)
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [utilityReadings, room]);

  const latestReading = roomReadings[0];

  // Invoices for this room
  const roomInvoices = useMemo(() => {
    if (!room) return [];
    return invoices
      .filter((i) => i.roomId === room.id || i.roomNumber === room.roomNumber)
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [invoices, room]);

  const unpaidInvoice = roomInvoices.find((i) => i.status !== 'PAID');
  const latestInvoice = roomInvoices[0];

  // Assets in this room
  const roomAssets = useMemo(() => {
    if (!room) return [];
    return assets.filter((a) => a.roomId === room.id || a.roomId === roomId);
  }, [assets, room, roomId]);

  // Maintenance tickets for this room
  const roomTickets = useMemo(() => {
    if (!room) return [];
    return maintenanceTickets
      .filter((t) => t.roomId === room.id || t.roomNumber === room.roomNumber)
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  }, [maintenanceTickets, room]);

  if (!room) {
    return (
      <div className="bg-white p-8 rounded-md border border-slate-200 text-center space-y-3 max-w-xl mx-auto my-12 shadow-2xs">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Không tìm thấy thông tin phòng</h2>
        <p className="text-xs text-slate-500">Mã phòng &quot;{roomId}&quot; không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách phòng</span>
        </Link>
      </div>
    );
  }

  const statusCfg = ROOM_STATUS_CONFIG[room.status];

  // Calculate current total debt
  const totalDebt = roomInvoices
    .filter((i) => i.status === 'OVERDUE' || i.status === 'UNPAID')
    .reduce((acc, curr) => acc + (curr.totalAmount - (curr.paidAmount || 0)), 0);

  const handleCopyTransferNote = (note: string) => {
    navigator.clipboard.writeText(note);
    setCopiedTransfer(true);
    setTimeout(() => setCopiedTransfer(false), 2000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;

    addMaintenanceTicket({
      propertyId: room.propertyId,
      roomId: room.id,
      roomNumber: room.roomNumber,
      title: ticketTitle,
      description: ticketDesc || 'Yêu cầu kiểm tra & sửa chữa thiết bị',
      priority: ticketPriority,
      status: 'PENDING',
      reportedBy: tenant?.name || 'Chủ nhà / Quản lý',
      cost: 0,
      paidBy: 'OWNER',
    });

    setTicketTitle('');
    setTicketDesc('');
    setIsAddTicketOpen(false);
    alert('Đã tạo yêu cầu bảo trì cho phòng thành công!');
  };

  return (
    <div className="space-y-2.5 pb-12">
      {/* 1. TOP BREADCRUMB & HEADER BAR */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Danh sách phòng</span>
            </Link>
            <span>/</span>
            <span className="text-slate-500">{property.name}</span>
            <span>/</span>
            <span className="font-bold text-slate-900">{room.roomNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Phòng {room.roomNumber}
            </h1>

            {/* Room Specs Badges */}
            <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300">
              Tầng {room.floor}
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300">
              {room.type}
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300">
              {room.area} m²
            </span>

            {/* High-Contrast Status Dot Badge with quick changer */}
            <div className="relative inline-block">
              <button
                onClick={() => setIsChangingStatus(!isChangingStatus)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity ${statusCfg.badgeClass}`}
                title="Bấm để đổi nhanh trạng thái"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dotClass}`} />
                <span>{statusCfg.label}</span>
                <span className="text-[10px] ml-0.5 opacity-60">▼</span>
              </button>

              {isChangingStatus && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsChangingStatus(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-200 rounded-md shadow-lg z-40 p-1 space-y-0.5 text-xs">
                    {(['OCCUPIED', 'VACANT', 'RESERVED', 'OVERDUE', 'MAINTENANCE'] as RoomStatus[]).map(
                      (st) => {
                        const cfg = ROOM_STATUS_CONFIG[st];
                        return (
                          <button
                            key={st}
                            onClick={() => {
                              updateRoomStatus(room.id, st);
                              setIsChangingStatus(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left cursor-pointer hover:bg-slate-50 ${
                              room.status === st ? 'font-bold bg-slate-100' : ''
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                              <span>{cfg.label}</span>
                            </span>
                            {room.status === st && <Check className="w-3.5 h-3.5 text-slate-800" />}
                          </button>
                        );
                      }
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {unpaidInvoice && (
            <button
              onClick={() => markInvoicePaid(unpaidInvoice.id, 'VIETQR')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Thu tiền phòng</span>
            </button>
          )}

          <button
            onClick={() => setIsAddTicketOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>Báo sự cố</span>
          </button>

          {activeContract && (
            <button
              onClick={() => setPrintingContract(activeContract)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>In hợp đồng</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI STRIP: SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Giá thuê niêm yết
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(room.basePrice)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">theo chu kỳ tháng</div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Tiền cọc giữ
          </div>
          <div className="text-base font-bold font-mono text-indigo-700 mt-0.5">
            {activeContract ? formatCurrency(activeContract.depositAmount) : '0 đ'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {activeContract ? 'Đang lưu giữ' : 'Chưa có hợp đồng'}
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Công nợ phòng
          </div>
          <div
            className={`text-base font-bold font-mono mt-0.5 ${
              totalDebt > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {formatCurrency(totalDebt)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {totalDebt > 0 ? 'Chưa thanh toán' : 'Không có nợ đọng'}
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Chỉ số điện mới
          </div>
          <div className="text-base font-bold font-mono text-amber-700 mt-0.5">
            {latestReading ? `${latestReading.newElectric} kWh` : '---'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {latestReading ? `Kỳ ${latestReading.month}` : 'Chưa chốt'}
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Khách thuê đại diện
          </div>
          <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
            {tenant ? (
              <Link
                href={`/tenants/${tenant.id}`}
                className="hover:text-blue-600 hover:underline transition-colors"
              >
                {tenant.name}
              </Link>
            ) : (
              <span className="text-slate-400 font-normal italic">Chưa có khách</span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {tenant?.phone || '---'}
          </div>
        </div>
      </div>

      {/* 3. SATELLITE MANAGEMENT TABS */}
      <div className="bg-white rounded-md border border-slate-200 shadow-2xs overflow-hidden">
        {/* Tab Navigation Headers */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-2 flex flex-wrap items-center gap-1 text-xs">
          {[
            {
              id: 'OVERVIEW',
              label: 'Tổng quan & Khách thuê',
              icon: User,
              badge: members.length > 0 ? members.length + 1 : undefined,
            },
            {
              id: 'CONTRACT',
              label: 'Hợp đồng thuê',
              icon: FileText,
              badge: roomContracts.length > 0 ? roomContracts.length : undefined,
            },
            {
              id: 'UTILITIES',
              label: 'Điện - Nước & Dịch vụ',
              icon: Zap,
            },
            {
              id: 'INVOICES',
              label: 'Hóa đơn & VietQR',
              icon: Receipt,
              badge: unpaidInvoice ? 'Chưa thu' : undefined,
              badgeColor: unpaidInvoice ? 'bg-rose-100 text-rose-800' : undefined,
            },
            {
              id: 'ASSETS',
              label: 'Tài sản trong phòng',
              icon: Boxes,
              badge: roomAssets.length > 0 ? roomAssets.length : undefined,
            },
            {
              id: 'MAINTENANCE',
              label: 'Lịch sử bảo trì',
              icon: Wrench,
              badge: roomTickets.filter((t) => t.status !== 'RESOLVED').length || undefined,
              badgeColor: 'bg-amber-100 text-amber-800',
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 transition-colors cursor-pointer text-xs ${
                  isActive
                    ? 'border-slate-900 text-slate-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      tab.badgeColor || 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: TỔNG QUAN & KHÁCH THUÊ HIỆN TẠI */}
        {activeTab === 'OVERVIEW' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Box 1: Thông tin phòng */}
              <div className="border border-slate-200 rounded-md p-3 space-y-2.5">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span>Thông số phòng lưu trú</span>
                  <span className="text-[11px] font-medium text-slate-500 lowercase">
                    {property.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Mã định danh:</span>
                    <span className="font-mono font-bold text-slate-900">{room.roomNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Vị trí tầng:</span>
                    <span className="font-bold text-slate-900">Tầng {room.floor}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Loại căn:</span>
                    <span className="font-bold text-slate-900">{room.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Diện tích thông thủy:</span>
                    <span className="font-bold text-slate-900">{room.area} m²</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Sức chứa tối đa:</span>
                    <span className="font-bold text-slate-900">{room.maxOccupants || 3} người</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Giá niêm yết:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(room.basePrice)}/tháng
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-slate-500 font-medium mb-1.5">Tiện nghi có sẵn:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Thông tin khách thuê đại diện */}
              <div className="border border-slate-200 rounded-md p-3 space-y-2.5">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span>Khách thuê đại diện hợp đồng</span>
                  {tenant && (
                    <Link
                      href={`/tenants/${tenant.id}`}
                      className="text-blue-600 hover:underline flex items-center gap-1 text-[11px] lowercase"
                    >
                      <span>xem hồ sơ 360°</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {tenant ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Họ và tên:</span>
                      <Link
                        href={`/tenants/${tenant.id}`}
                        className="font-bold text-blue-600 hover:underline text-sm"
                      >
                        {tenant.name}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Số điện thoại:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                        <span>{tenant.phone}</span>
                        <a
                          href={`tel:${tenant.phone}`}
                          className="text-emerald-600 hover:text-emerald-800"
                          title="Gọi điện"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Số định danh CCCD:</span>
                      <span className="font-mono font-bold text-slate-900">{tenant.cccd}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Quê quán (Thường trú):</span>
                      <span className="font-medium text-slate-800">{tenant.hometown}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Khai báo tạm trú CA:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          TEMPORARY_RESIDENCE_CONFIG[tenant.temporaryResidenceStatus].badgeClass
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            TEMPORARY_RESIDENCE_CONFIG[tenant.temporaryResidenceStatus].dotClass
                          }`}
                        />
                        {TEMPORARY_RESIDENCE_CONFIG[tenant.temporaryResidenceStatus].label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Phương tiện gửi:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {tenant.vehiclePlate || 'Không đăng ký xe'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <p>Phòng hiện đang trống, chưa có khách thuê.</p>
                    <Link
                      href="/contracts"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tạo hợp đồng cho khách mới</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Box 3: Danh sách các thành viên ở cùng phòng */}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                    Thành viên đang cư trú cùng phòng ({members.length} người)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Mối quan hệ</th>
                      <th className="py-2.5 px-3">Số điện thoại</th>
                      <th className="py-2.5 px-3">Số CCCD</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái tạm trú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          Chưa ghi nhận thành viên ở cùng nào ngoài khách đại diện.
                        </td>
                      </tr>
                    ) : (
                      members.map((mem) => {
                        const tamTruCfg = TEMPORARY_RESIDENCE_CONFIG[mem.temporaryResidenceStatus];
                        return (
                          <tr key={mem.id} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-bold text-slate-900">{mem.name}</td>
                            <td className="py-2 px-3 text-slate-700 font-medium">{mem.relation}</td>
                            <td className="py-2 px-3 font-mono text-slate-900 font-medium">
                              {mem.phone || '-'}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-900 font-medium">
                              {mem.cccd}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${tamTruCfg.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tamTruCfg.dotClass}`} />
                                {tamTruCfg.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HỢP ĐỒNG THUÊ */}
        {activeTab === 'CONTRACT' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            {activeContract ? (
              <div className="border border-slate-200 rounded-md p-3.5 space-y-3 bg-white shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        {activeContract.code}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          CONTRACT_STATUS_CONFIG[activeContract.status].badgeClass
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            CONTRACT_STATUS_CONFIG[activeContract.status].dotClass
                          }`}
                        />
                        {CONTRACT_STATUS_CONFIG[activeContract.status].label}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Ký ngày: {formatDate(activeContract.signedDate)} • Khách đại diện:{' '}
                      <strong className="text-slate-900">{activeContract.tenantName}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrintingContract(activeContract)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 font-bold text-slate-800 text-xs shadow-2xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>In hợp đồng</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="text-slate-500 font-medium">Thời hạn hợp đồng:</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {formatDate(activeContract.startDate)} → {formatDate(activeContract.endDate)}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="text-slate-500 font-medium">Giá thuê hàng tháng:</div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {formatCurrency(activeContract.rentPrice)}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="text-slate-500 font-medium">Tiền cọc giữ:</div>
                    <div className="font-mono font-bold text-indigo-700 text-sm mt-0.5">
                      {formatCurrency(activeContract.depositAmount)}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="text-slate-500 font-medium">Kỳ thu tiền:</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      Ngày {activeContract.billingDay || 5} hàng tháng
                    </div>
                  </div>
                </div>

                {activeContract.terms && (
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
                    <div className="font-bold text-slate-800 text-xs">Điều khoản & Thỏa thuận:</div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {activeContract.terms}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                Phòng chưa có hợp đồng thuê nào được kích hoạt.
              </div>
            )}

            {/* Contract History Table */}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs uppercase tracking-wider">
                Lịch sử hợp đồng thuê phòng ({roomContracts.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Mã HĐ</th>
                      <th className="py-2.5 px-3">Khách thuê</th>
                      <th className="py-2.5 px-3">Thời hạn</th>
                      <th className="py-2.5 px-3 text-right">Giá thuê</th>
                      <th className="py-2.5 px-3 text-right">Tiền cọc</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roomContracts.map((c) => {
                      const cCfg = CONTRACT_STATUS_CONFIG[c.status];
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{c.code}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{c.tenantName}</td>
                          <td className="py-2 px-3 text-slate-700 font-medium">
                            {formatDate(c.startDate)} → {formatDate(c.endDate)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(c.rentPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-indigo-700">
                            {formatCurrency(c.depositAmount)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cCfg.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cCfg.dotClass}`} />
                              {cCfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ĐIỆN - NƯỚC & DỊCH VỤ */}
        {activeTab === 'UTILITIES' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Lịch sử ghi chỉ số điện nước theo kỳ ({roomReadings.length} kỳ)
              </div>
              <Link
                href="/utilities"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Đến bảng chốt điện nước</span>
              </Link>
            </div>

            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Kỳ tháng</th>
                      <th className="py-2.5 px-3 bg-amber-100/80 text-amber-950 font-bold">Số điện cũ</th>
                      <th className="py-2.5 px-3 bg-amber-100/80 text-amber-950 font-bold">Số điện mới</th>
                      <th className="py-2.5 px-3 bg-amber-100/80 text-amber-950 font-bold text-center">Tiêu thụ (kWh)</th>
                      <th className="py-2.5 px-3 bg-cyan-100/80 text-cyan-950 font-bold">Số nước cũ</th>
                      <th className="py-2.5 px-3 bg-cyan-100/80 text-cyan-950 font-bold">Số nước mới</th>
                      <th className="py-2.5 px-3 bg-cyan-100/80 text-cyan-950 font-bold text-center">Tiêu thụ (m³)</th>
                      <th className="py-2.5 px-3 text-center">Xe máy</th>
                      <th className="py-2.5 px-3 text-right">Tổng phí DV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roomReadings.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-slate-400">
                          Chưa có dữ liệu chỉ số điện nước nào của phòng này.
                        </td>
                      </tr>
                    ) : (
                      roomReadings.map((r) => {
                        const eUsage = r.newElectric - r.oldElectric;
                        const wUsage = r.newWater - r.oldWater;
                        const totalServices =
                          eUsage * r.electricPrice +
                          wUsage * r.waterPrice +
                          r.internetFee +
                          r.garbageFee +
                          r.parkingFee +
                          r.serviceFee +
                          r.otherFee;

                        return (
                          <tr key={r.id} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-bold text-slate-900">{r.month}</td>
                            <td className="py-2 px-3 font-mono text-slate-800">{r.oldElectric}</td>
                            <td className="py-2 px-3 font-mono font-bold text-amber-900">{r.newElectric}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-amber-900">
                              {eUsage} kWh
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-800">{r.oldWater}</td>
                            <td className="py-2 px-3 font-mono font-bold text-cyan-900">{r.newWater}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-cyan-900">
                              {wUsage} m³
                            </td>
                            <td className="py-2 px-3 text-center font-medium text-slate-800">
                              {r.motorbikeCount} xe
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(totalServices)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HÓA ĐƠN & VIETQR */}
        {activeTab === 'INVOICES' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            {/* Live VietQR box for pending invoice */}
            {unpaidInvoice && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">
                      Hóa đơn đang chờ thanh toán: {unpaidInvoice.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      Chưa thu
                    </span>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900">
                    Số tiền: {formatCurrency(unpaidInvoice.totalAmount)}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Ngân hàng: <strong>{property.bankConfig.bankName}</strong> • STK:{' '}
                    <strong className="font-mono text-blue-700">{property.bankConfig.accountNumber}</strong> • Chủ TK:{' '}
                    <strong>{property.bankConfig.accountName}</strong>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-slate-500">Cú pháp CK:</span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                      {unpaidInvoice.transferNote}
                    </span>
                    <button
                      onClick={() => handleCopyTransferNote(unpaidInvoice.transferNote)}
                      className="p-1 hover:text-slate-900 text-slate-500 cursor-pointer"
                      title="Sao chép cú pháp"
                    >
                      {copiedTransfer ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs">
                    <img
                      src={unpaidInvoice.qrUrl}
                      alt="VietQR"
                      className="w-32 h-32 object-contain mx-auto"
                    />
                  </div>
                  <button
                    onClick={() => markInvoicePaid(unpaidInvoice.id, 'VIETQR')}
                    className="w-full px-3 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Xác nhận đã thu</span>
                  </button>
                </div>
              </div>
            )}

            {/* Invoices Table */}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs uppercase tracking-wider">
                Lịch sử hóa đơn phòng ({roomInvoices.length} hóa đơn)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Mã HĐ</th>
                      <th className="py-2.5 px-3">Kỳ tính</th>
                      <th className="py-2.5 px-3">Khách thuê</th>
                      <th className="py-2.5 px-3 text-right">Tiền phòng</th>
                      <th className="py-2.5 px-3 text-right">Điện + Nước + DV</th>
                      <th className="py-2.5 px-3 text-right">Tổng thanh toán</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roomInvoices.map((inv) => {
                      const invCfg = INVOICE_STATUS_CONFIG[inv.status];
                      const utils =
                        inv.electricTotal +
                        inv.waterTotal +
                        inv.garbageFee +
                        inv.internetFee +
                        inv.parkingFee +
                        inv.serviceFee +
                        inv.otherFee;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{inv.code}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{inv.month}</td>
                          <td className="py-2 px-3 font-medium text-slate-800">{inv.tenantName}</td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                            {formatCurrency(inv.roomPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-slate-700">
                            {formatCurrency(utils)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(inv.totalAmount)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${invCfg.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${invCfg.dotClass}`} />
                              {invCfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TÀI SẢN TRONG PHÒNG */}
        {activeTab === 'ASSETS' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Kiểm kê tài sản & Thiết bị bàn giao ({roomAssets.length} món)
              </div>
              <button
                onClick={() => alert('Chức năng thêm tài sản kiểm kê mới cho phòng')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm tài sản</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Mã tài sản</th>
                      <th className="py-2.5 px-3">Tên thiết bị</th>
                      <th className="py-2.5 px-3">Hãng / Model</th>
                      <th className="py-2.5 px-3 text-center">Tình trạng</th>
                      <th className="py-2.5 px-3 text-right">Giá đền bù quy định</th>
                      <th className="py-2.5 px-3">Ngày lắp đặt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roomAssets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          Chưa có tài sản nào được đăng ký cho phòng này.
                        </td>
                      </tr>
                    ) : (
                      roomAssets.map((asset) => {
                        const conditionColor =
                          asset.condition === 'NEW'
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-400'
                            : asset.condition === 'GOOD'
                            ? 'bg-blue-50 text-blue-950 border-blue-400'
                            : asset.condition === 'FAIR'
                            ? 'bg-amber-50 text-amber-950 border-amber-400'
                            : 'bg-rose-50 text-rose-950 border-rose-400';

                        const conditionLabel =
                          asset.condition === 'NEW'
                            ? 'Mới 100%'
                            : asset.condition === 'GOOD'
                            ? 'Hoạt động tốt'
                            : asset.condition === 'FAIR'
                            ? 'Cần bảo dưỡng'
                            : 'Hỏng hóc';

                        return (
                          <tr key={asset.id} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">
                              {asset.code}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">{asset.name}</td>
                            <td className="py-2 px-3 text-slate-700">{asset.brand}</td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${conditionColor}`}
                              >
                                {conditionLabel}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(asset.compensationPrice)}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {formatDate(asset.installedDate)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LỊCH SỬ BẢO TRÌ & SỰ CỐ */}
        {activeTab === 'MAINTENANCE' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Lịch sử yêu cầu sửa chữa & Bảo trì ({roomTickets.length} sự cố)
              </div>
              <button
                onClick={() => setIsAddTicketOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Báo sự cố mới</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Sự cố</th>
                      <th className="py-2.5 px-3 text-center">Mức ưu tiên</th>
                      <th className="py-2.5 px-3">Người báo</th>
                      <th className="py-2.5 px-3">Thợ phụ trách</th>
                      <th className="py-2.5 px-3 text-right">Chi phí thực tế</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                      <th className="py-2.5 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roomTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          Chưa có sự cố bảo trì nào phát sinh tại phòng này.
                        </td>
                      </tr>
                    ) : (
                      roomTickets.map((t) => {
                        const priCfg = TICKET_PRIORITY_CONFIG[t.priority];
                        const staCfg = TICKET_STATUS_CONFIG[t.status];
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-900">{t.title}</div>
                              <div className="text-[11px] text-slate-600 line-clamp-1">
                                {t.description}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${priCfg.badgeClass}`}
                              >
                                {priCfg.label}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-800">
                              <div>{t.reportedBy}</div>
                              <div className="text-[10px] text-slate-400">{formatDate(t.reportedAt)}</div>
                            </td>
                            <td className="py-2 px-3 text-slate-800">
                              {t.technicianName || <span className="text-slate-400 italic">Chưa phân công</span>}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              {t.cost > 0 ? formatCurrency(t.cost) : '---'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${staCfg.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${staCfg.dotClass}`} />
                                {staCfg.label}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {t.status === 'PENDING' && (
                                <button
                                  onClick={() => updateMaintenanceStatus(t.id, 'IN_PROGRESS')}
                                  className="px-2 py-0.5 rounded-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-[11px] cursor-pointer"
                                >
                                  Nhận xử lý
                                </button>
                              )}
                              {t.status === 'IN_PROGRESS' && (
                                <button
                                  onClick={() => updateMaintenanceStatus(t.id, 'RESOLVED', 150000)}
                                  className="px-2 py-0.5 rounded-xs bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-[11px] cursor-pointer"
                                >
                                  Nghiệm thu
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: BÁO SỰ CỐ MỚI */}
      {isAddTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-md border border-slate-200 shadow-xl max-w-md w-full p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Báo Sự Cố Phòng {room.roomNumber}
              </h3>
              <button
                onClick={() => setIsAddTicketOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tiêu đề sự cố / thiết bị hỏng:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Vd: Điều hòa không mát, Chảy nước bồn cầu..."
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-sm border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Mức độ ưu tiên:
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-sm border border-slate-300 text-xs font-medium bg-white focus:outline-hidden focus:border-slate-800 cursor-pointer"
                >
                  <option value="LOW">Bình thường / Thấp</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HIGH">Cao</option>
                  <option value="URGENT">Khẩn cấp (cần sửa ngay)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Mô tả chi tiết:
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả hiện tượng sự cố, thời gian phát sinh..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-sm border border-slate-300 text-xs focus:outline-hidden focus:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTicketOpen(false)}
                  className="px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-sm bg-slate-900 hover:bg-black text-white font-bold cursor-pointer shadow-2xs"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT CONTRACT MODAL */}
      {printingContract && (
        <PrintContractModal
          contract={printingContract}
          tenant={tenant || undefined}
          property={property}
          onClose={() => setPrintingContract(null)}
        />
      )}
    </div>
  );
}
