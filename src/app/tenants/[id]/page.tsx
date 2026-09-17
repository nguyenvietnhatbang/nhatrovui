'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Users,
  Building2,
  FileText,
  Receipt,
  Wrench,
  Phone,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Car,
  Briefcase,
  MapPin,
  QrCode,
  Printer,
  CheckCircle2,
  Clock,
  Plus,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  formatCurrency,
  formatDate,
  TEMPORARY_RESIDENCE_CONFIG,
  CONTRACT_STATUS_CONFIG,
  INVOICE_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  TICKET_STATUS_CONFIG,
  ROOM_STATUS_CONFIG,
} from '@/lib/formatters';
import { ExportTamTruModal } from '@/components/tenants/ExportTamTruModal';
import { PrintContractModal } from '@/components/contracts/PrintContractModal';

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.id as string;

  const {
    tenants,
    rooms,
    contracts,
    invoices,
    maintenanceTickets,
    properties,
    updateTenant,
    markInvoicePaid,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'PROFILE' | 'MEMBERS' | 'CONTRACT' | 'INVOICES' | 'TICKETS'
  >('PROFILE');

  const [isExportTamTruOpen, setIsExportTamTruOpen] = useState(false);
  const [printingContract, setPrintingContract] = useState<any>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Lookup target tenant
  const tenant = useMemo(() => {
    return tenants.find((t) => t.id === tenantId || t.id.replace('tenant-', '') === tenantId);
  }, [tenants, tenantId]);

  // Associated room
  const room = useMemo(() => {
    if (!tenant) return null;
    return rooms.find((r) => r.id === tenant.roomId);
  }, [rooms, tenant]);

  // Associated property
  const property = useMemo(() => {
    if (!tenant) return properties[0];
    return properties.find((p) => p.id === tenant.propertyId) || properties[0];
  }, [tenant, properties]);

  // Associated contract
  const tenantContracts = useMemo(() => {
    if (!tenant) return [];
    return contracts.filter(
      (c) => c.tenantId === tenant.id || (tenant.roomId && c.roomId === tenant.roomId)
    );
  }, [contracts, tenant]);

  const activeContract = useMemo(() => {
    return tenantContracts.find((c) => c.status === 'ACTIVE' || c.status === 'EXPIRING_SOON') || tenantContracts[0];
  }, [tenantContracts]);

  // Invoices for this tenant/room
  const tenantInvoices = useMemo(() => {
    if (!tenant) return [];
    return invoices
      .filter((i) => i.tenantId === tenant.id || (tenant.roomId && i.roomId === tenant.roomId))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [invoices, tenant]);

  const unpaidInvoice = tenantInvoices.find((i) => i.status !== 'PAID');

  // Maintenance tickets for this tenant/room
  const tenantTickets = useMemo(() => {
    if (!tenant) return [];
    return maintenanceTickets
      .filter((t) => (tenant.roomId && t.roomId === tenant.roomId) || t.reportedBy === tenant.name)
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  }, [maintenanceTickets, tenant]);

  if (!tenant) {
    return (
      <div className="bg-white p-8 rounded-md border border-slate-200 text-center space-y-3 max-w-xl mx-auto my-12 shadow-2xs">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Không tìm thấy thông tin khách thuê</h2>
        <p className="text-xs text-slate-500">Mã khách hàng &quot;{tenantId}&quot; không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
        <Link
          href="/tenants"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách khách thuê</span>
        </Link>
      </div>
    );
  }

  const tamTruCfg = TEMPORARY_RESIDENCE_CONFIG[tenant.temporaryResidenceStatus];

  // Total paid to date
  const totalPaid = tenantInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Current debt
  const currentDebt = tenantInvoices
    .filter((i) => i.status === 'OVERDUE' || i.status === 'UNPAID')
    .reduce((acc, curr) => acc + (curr.totalAmount - (curr.paidAmount || 0)), 0);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(tenant.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="space-y-2.5 pb-12">
      {/* 1. TOP BREADCRUMB & HEADER BAR */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link
              href="/tenants"
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Danh sách khách thuê</span>
            </Link>
            <span>/</span>
            <span className="text-slate-500">{property.name}</span>
            <span>/</span>
            <span className="font-bold text-slate-900">{tenant.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {tenant.name}
            </h1>

            {/* Quick Badges */}
            <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 text-xs font-mono font-semibold border border-slate-300">
              KH-2026-{tenant.id.replace('tenant-', '').slice(-5).toUpperCase()}
            </span>

            {room && (
              <Link
                href={`/rooms/${room.id}`}
                className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-800 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors flex items-center gap-1"
              >
                <span>Phòng {room.roomNumber}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${tamTruCfg.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tamTruCfg.dotClass}`} />
              <span>{tamTruCfg.label}</span>
            </span>

            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-950 border border-emerald-300">
              Uy tín: {tenant.reputation === 'EXCELLENT' ? 'Xuất sắc' : 'Tốt'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyPhone}
            className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            {copiedPhone ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{copiedPhone ? 'Đã sao chép SĐT' : `Gọi ${tenant.phone}`}</span>
          </button>

          <button
            onClick={() => setIsExportTamTruOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Khai báo tạm trú</span>
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
            Phòng lưu trú
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {room ? (
              <Link href={`/rooms/${room.id}`} className="text-blue-600 hover:underline">
                Phòng {room.roomNumber}
              </Link>
            ) : (
              'Chưa gán'
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{property.name}</div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Tiền cọc lưu giữ
          </div>
          <div className="text-base font-bold font-mono text-indigo-700 mt-0.5">
            {activeContract ? formatCurrency(activeContract.depositAmount) : '0 đ'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Theo HĐ {activeContract?.code || ''}</div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Công nợ hiện tại
          </div>
          <div
            className={`text-base font-bold font-mono mt-0.5 ${
              currentDebt > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {formatCurrency(currentDebt)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {currentDebt > 0 ? 'Chưa thanh toán' : 'Không có nợ đọng'}
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Ngày bắt đầu thuê
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {formatDate(tenant.startDate || '2026-01-01')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hợp đồng dài hạn</div>
        </div>

        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Tổng tiền đã nộp
          </div>
          <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {tenantInvoices.filter((i) => i.status === 'PAID').length} kỳ hóa đơn đã thu
          </div>
        </div>
      </div>

      {/* 3. SATELLITE MANAGEMENT TABS */}
      <div className="bg-white rounded-md border border-slate-200 shadow-2xs overflow-hidden">
        {/* Tab Headers - Touch scrollable on mobile */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-2 flex items-center gap-1 text-xs overflow-x-auto whitespace-nowrap">
          {[
            { id: 'PROFILE', label: 'Hồ sơ định danh & Tạm trú', icon: User },
            {
              id: 'MEMBERS',
              label: 'Thành viên cùng phòng',
              icon: Users,
              badge: tenant.members.length || undefined,
            },
            {
              id: 'CONTRACT',
              label: 'Phòng đang ở & Hợp đồng',
              icon: FileText,
            },
            {
              id: 'INVOICES',
              label: 'Lịch sử thanh toán & Hóa đơn',
              icon: Receipt,
              badge: unpaidInvoice ? 'Nợ' : undefined,
              badgeColor: unpaidInvoice ? 'bg-rose-100 text-rose-800' : undefined,
            },
            {
              id: 'TICKETS',
              label: 'Lịch sử báo sự cố',
              icon: Wrench,
              badge: tenantTickets.length || undefined,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 font-bold border-b-2 transition-colors cursor-pointer text-xs ${
                  isActive
                    ? 'border-slate-900 text-slate-950 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
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

        {/* TAB 1: HỒ SƠ ĐỊNH DANH & CƯ TRÚ */}
        {activeTab === 'PROFILE' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Personal Details Box */}
              <div className="border border-slate-200 rounded-md p-3 space-y-2.5">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1.5 border-b border-slate-100">
                  Thông tin cá nhân & Định danh CCCD
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Họ và tên đầy đủ:</span>
                    <span className="font-bold text-slate-900 text-sm">{tenant.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Số CCCD / Hộ chiếu:</span>
                    <span className="font-mono font-bold text-slate-900">{tenant.cccd}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Ngày cấp:</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(tenant.cccdIssueDate)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Nơi cấp:</span>
                    <span className="font-medium text-slate-800">{tenant.cccdIssuePlace}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Ngày sinh:</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(tenant.birthDate)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Quê quán (Thường trú):</span>
                    <span className="font-medium text-slate-800">{tenant.hometown}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Nghề nghiệp / Công tác:</span>
                    <span className="font-medium text-slate-800">{tenant.job || 'Tự do'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Số điện thoại liên lạc:</span>
                    <span className="font-mono font-bold text-slate-900">{tenant.phone}</span>
                  </div>
                </div>
              </div>

              {/* Residence & Vehicle Box */}
              <div className="space-y-3.5">
                {/* Temporary Residence Status */}
                <div className="border border-slate-200 rounded-md p-3 space-y-2.5">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span>Hồ sơ khai báo tạm trú Công An</span>
                    <button
                      onClick={() => setIsExportTamTruOpen(true)}
                      className="text-blue-600 hover:underline text-[11px] font-medium"
                    >
                      Xuất mẫu CT01
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="text-slate-500">Trạng thái phê duyệt:</span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${tamTruCfg.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tamTruCfg.dotClass}`} />
                        {tamTruCfg.label}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Cơ quan tiếp nhận:</span>
                      <span className="font-medium text-slate-800">
                        Công an phường sở tại ({property.city})
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Thời hạn tạm trú:</span>
                      <span className="font-bold text-slate-900">
                        {tenant.temporaryResidenceExpiry
                          ? formatDate(tenant.temporaryResidenceExpiry)
                          : '12 tháng (Theo hợp đồng)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Box */}
                <div className="border border-slate-200 rounded-md p-3 space-y-2.5">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1.5 border-b border-slate-100">
                    Phương tiện & Gửi xe
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Biển số xe đăng ký:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {tenant.vehiclePlate || 'Không đăng ký xe'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Dòng xe:</span>
                      <span className="font-medium text-slate-800">
                        {tenant.vehicleModel || 'Xe máy tiêu chuẩn'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THÀNH VIÊN CÙNG PHÒNG */}
        {activeTab === 'MEMBERS' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Danh sách thành viên ở chung phòng ({tenant.members.length} người)
              </div>
              <button
                onClick={() => alert('Chức năng thêm thành viên vào phòng')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm thành viên</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Quan hệ với chủ hợp đồng</th>
                      <th className="py-2.5 px-3">Số điện thoại</th>
                      <th className="py-2.5 px-3">Số CCCD</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái tạm trú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenant.members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          Khách ở một mình, không có thành viên ở ghép.
                        </td>
                      </tr>
                    ) : (
                      tenant.members.map((mem) => {
                        const mTamTru = TEMPORARY_RESIDENCE_CONFIG[mem.temporaryResidenceStatus];
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
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${mTamTru.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${mTamTru.dotClass}`} />
                                {mTamTru.label}
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

        {/* TAB 3: PHÒNG ĐANG Ở & HỢP ĐỒNG */}
        {activeTab === 'CONTRACT' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            {/* Room Card */}
            {room && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">
                      Phòng {room.roomNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-slate-200 text-slate-800 font-bold text-xs">
                      Tầng {room.floor}
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-slate-200 text-slate-800 font-bold text-xs">
                      {room.type} • {room.area} m²
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Giá niêm yết: <strong className="text-slate-900 font-mono">{formatCurrency(room.basePrice)}/tháng</strong> • Cơ sở: <strong>{property.name}</strong>
                  </div>
                </div>

                <Link
                  href={`/rooms/${room.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-800 text-xs shadow-2xs transition-colors shrink-0"
                >
                  <span>Xem trung tâm điều khiển phòng</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Contract Details */}
            {activeContract ? (
              <div className="border border-slate-200 rounded-md p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
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

                  <button
                    onClick={() => setPrintingContract(activeContract)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-white border border-slate-300 hover:bg-slate-50 font-bold text-slate-800 text-xs shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In hợp đồng</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="text-slate-500 font-medium">Thời hạn hợp đồng:</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {formatDate(activeContract.startDate)} → {formatDate(activeContract.endDate)}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="text-slate-500 font-medium">Giá thuê thỏa thuận:</div>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {formatCurrency(activeContract.rentPrice)}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="text-slate-500 font-medium">Tiền đặt cọc giữ:</div>
                    <div className="font-mono font-bold text-indigo-700 text-sm mt-0.5">
                      {formatCurrency(activeContract.depositAmount)}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="text-slate-500 font-medium">Ngày thu tiền:</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      Ngày {activeContract.billingDay || 5} hàng tháng
                    </div>
                  </div>
                </div>

                {activeContract.terms && (
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
                    <div className="font-bold text-slate-800 text-xs">Điều khoản hợp đồng:</div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {activeContract.terms}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400">
                Chưa có hợp đồng nào cho khách này.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LỊCH SỬ HÓA ĐƠN & THANH TOÁN */}
        {activeTab === 'INVOICES' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs uppercase tracking-wider">
                Lịch sử hóa đơn tiền phòng & Dịch vụ ({tenantInvoices.length} kỳ)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Mã HĐ</th>
                      <th className="py-2.5 px-3">Kỳ tháng</th>
                      <th className="py-2.5 px-3">Phòng</th>
                      <th className="py-2.5 px-3 text-right">Tiền phòng</th>
                      <th className="py-2.5 px-3 text-right">Điện + Nước + DV</th>
                      <th className="py-2.5 px-3 text-right">Tổng tiền</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                      <th className="py-2.5 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenantInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400">
                          Chưa có hóa đơn nào phát sinh.
                        </td>
                      </tr>
                    ) : (
                      tenantInvoices.map((inv) => {
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
                            <td className="py-2 px-3 font-bold text-slate-900">P.{inv.roomNumber}</td>
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
                            <td className="py-2 px-3 text-center">
                              {inv.status !== 'PAID' && (
                                <button
                                  onClick={() => markInvoicePaid(inv.id, 'VIETQR')}
                                  className="px-2 py-0.5 rounded-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                                >
                                  Thu tiền
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

        {/* TAB 5: LỊCH SỬ BÁO SỰ CỐ */}
        {activeTab === 'TICKETS' && (
          <div className="p-3.5 space-y-3.5 text-xs text-slate-800">
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-xs uppercase tracking-wider">
                Danh sách sự cố & Yêu cầu hỗ trợ đã gửi ({tenantTickets.length} sự cố)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Sự cố</th>
                      <th className="py-2.5 px-3 text-center">Mức ưu tiên</th>
                      <th className="py-2.5 px-3">Ngày gửi</th>
                      <th className="py-2.5 px-3">Thợ kỹ thuật</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenantTickets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          Khách chưa từng gửi yêu cầu sửa chữa sự cố nào.
                        </td>
                      </tr>
                    ) : (
                      tenantTickets.map((t) => {
                        const priCfg = TICKET_PRIORITY_CONFIG[t.priority];
                        const staCfg = TICKET_STATUS_CONFIG[t.status];
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-bold text-slate-900">{t.title}</td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${priCfg.badgeClass}`}
                              >
                                {priCfg.label}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-700">{formatDate(t.reportedAt)}</td>
                            <td className="py-2 px-3 text-slate-700">
                              {t.technicianName || <span className="text-slate-400 italic">Chưa phân công</span>}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${staCfg.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${staCfg.dotClass}`} />
                                {staCfg.label}
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
      </div>

      {/* EXPORT TAM TRU MODAL */}
      <ExportTamTruModal
        isOpen={isExportTamTruOpen}
        onClose={() => setIsExportTamTruOpen(false)}
        tenants={[tenant]}
        property={property}
      />

      {/* PRINT CONTRACT MODAL */}
      {printingContract && (
        <PrintContractModal
          contract={printingContract}
          tenant={tenant}
          property={property}
          onClose={() => setPrintingContract(null)}
        />
      )}
    </div>
  );
}
