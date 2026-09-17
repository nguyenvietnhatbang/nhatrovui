'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  FileText,
  Shield,
  Layers,
  Wrench,
  Receipt,
  Car,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Zap,
  LogOut,
  Edit3,
} from 'lucide-react';
import { Room, Tenant, Contract, RoomAsset, Invoice, RoomStatus } from '@/types';
import { AvatarLetter } from '@/components/common/AvatarLetter';
import {
  formatCurrency,
  formatDate,
  ROOM_STATUS_CONFIG,
  CONTRACT_STATUS_CONFIG,
  TEMPORARY_RESIDENCE_CONFIG,
  ASSET_CONDITION_CONFIG,
  INVOICE_STATUS_CONFIG,
} from '@/lib/formatters';
import { useApp } from '@/context/AppContext';

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onOpenUtilityModal?: (room: Room) => void;
  onOpenInvoiceModal?: (invoice: Invoice) => void;
}

export function RoomDetailModal({
  room,
  onClose,
  onOpenUtilityModal,
  onOpenInvoiceModal,
}: RoomDetailModalProps) {
  const {
    tenants,
    contracts,
    assets,
    invoices,
    updateRoomStatus,
    terminateContract,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'TENANT' | 'CONTRACT' | 'ASSETS' | 'INVOICES'>('TENANT');

  if (!room) return null;

  const tenant = tenants.find((t) => t.id === room.currentTenantId);
  const contract = contracts.find((c) => c.roomId === room.id && c.status !== 'TERMINATED');
  const roomAssets = assets.filter((a) => a.roomId === room.id);
  const roomInvoices = invoices.filter((i) => i.roomId === room.id);
  const statusCfg = ROOM_STATUS_CONFIG[room.status];

  const handleStatusChange = (newStatus: RoomStatus) => {
    updateRoomStatus(room.id, newStatus);
  };

  const handleCheckout = () => {
    if (!contract) return;
    if (
      confirm(
        `Xác nhận thanh lý hợp đồng và làm thủ tục trả phòng cho phòng ${room.roomNumber} (${tenant?.name})? Tiền cọc ${formatCurrency(
          contract.depositAmount
        )} sẽ được đối trừ điện nước lẻ ngày.`
      )
    ) {
      terminateContract(contract.id);
      alert(`Đã hoàn tất thủ tục trả phòng cho ${room.roomNumber}! Phòng đã chuyển sang trạng thái Trống.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-md shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              {room.roomNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Chi Tiết Phòng {room.roomNumber}
                </h2>
                {/* Status Dropdown */}
                <select
                  value={room.status}
                  onChange={(e) => handleStatusChange(e.target.value as RoomStatus)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer ${statusCfg.badgeClass}`}
                >
                  <option value="OCCUPIED">🟢 Đang thuê</option>
                  <option value="VACANT">⚪ Phòng trống</option>
                  <option value="RESERVED">🟡 Đã cọc giữ</option>
                  <option value="OVERDUE">🔴 Nợ quá hạn</option>
                  <option value="MAINTENANCE">🟠 Đang sửa chữa</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tầng {room.floor} • Diện tích: {room.area} m² • Loại phòng: {room.type} • Tối đa:{' '}
                {room.maxOccupants} người
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Giá thuê:</div>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(room.basePrice)}
                <span className="text-xs font-normal text-slate-400">/tháng</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('TENANT')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'TENANT'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Khách Thuê & Tạm Trú</span>
          </button>

          <button
            onClick={() => setActiveTab('CONTRACT')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'CONTRACT'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Hợp Đồng & Tiền Cọc</span>
          </button>

          <button
            onClick={() => setActiveTab('ASSETS')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ASSETS'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tài Sản Bàn Giao ({roomAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'INVOICES'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Hóa Đơn & Lịch Sử Thu</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: TENANT DETAILS */}
          {activeTab === 'TENANT' && (
            <div>
              {tenant ? (
                <div className="space-y-6">
                  {/* Primary tenant card */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <AvatarLetter name={tenant.name} size="lg" />

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {tenant.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            Người đại diện hợp đồng
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                            {tenant.phone}
                          </span>
                          <span>•</span>
                          <span>CCCD: {tenant.cccd}</span>
                          <span>•</span>
                          <span>Quê quán: {tenant.hometown}</span>
                        </div>
                      </div>
                    </div>

                    {/* Temporary residence badge */}
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-slate-500 mb-1">Khai báo tạm trú CA:</div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          TEMPORARY_RESIDENCE_CONFIG[tenant.temporaryResidenceStatus].badgeClass
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {TEMPORARY_RESIDENCE_CONFIG[tenant.temporaryResidenceStatus].label}
                      </span>
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                        Thông tin pháp lý & Nghề nghiệp
                      </span>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Nghề nghiệp:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{tenant.job}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Ngày sinh:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(tenant.birthDate)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Ngày bắt đầu ở:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(tenant.startDate)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                        Phương tiện đi lại (Gửi xe)
                      </span>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Loại xe:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tenant.vehicleModel || 'Không đăng ký xe'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Biển số xe:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tenant.vehiclePlate || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Đánh giá uy tín:</span>
                        <span
                          className={`font-bold ${
                            tenant.reputation === 'EXCELLENT'
                              ? 'text-emerald-600'
                              : tenant.reputation === 'GOOD'
                              ? 'text-blue-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {tenant.reputation === 'EXCELLENT'
                            ? '⭐ Rất tốt (Đúng hạn)'
                            : tenant.reputation === 'GOOD'
                            ? 'Tốt'
                            : '⚠️ Cần lưu ý'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Room members */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                      Thành Viên Ở Cùng Phòng ({tenant.members.length} người)
                    </h4>
                    {tenant.members.length === 0 ? (
                      <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs text-center">
                        Khách ở 1 mình, không có người ở ghép.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tenant.members.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                                {m.name.slice(0, 1)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                                <div className="text-slate-500">
                                  {m.relation} • SĐT: {m.phone} • CCCD: {m.cccd}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                TEMPORARY_RESIDENCE_CONFIG[m.temporaryResidenceStatus].badgeClass
                              }`}
                            >
                              {TEMPORARY_RESIDENCE_CONFIG[m.temporaryResidenceStatus].label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Phòng hiện đang trống</p>
                  <p className="text-slate-400 mt-1">Chưa có thông tin khách thuê đại diện cho phòng này.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTRACT DETAILS */}
          {activeTab === 'CONTRACT' && (
            <div>
              {contract ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          Hợp Đồng: {contract.code}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            CONTRACT_STATUS_CONFIG[contract.status].badgeClass
                          }`}
                        >
                          {CONTRACT_STATUS_CONFIG[contract.status].label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Ký ngày: {formatDate(contract.signedDate)} • Thời hạn thuê:{' '}
                        <strong>
                          {formatDate(contract.startDate)} đến {formatDate(contract.endDate)}
                        </strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Tiền cọc giữ chỗ:</div>
                      <div className="text-base font-black text-indigo-700 dark:text-indigo-400">
                        {formatCurrency(contract.depositAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block mb-1">Giá thuê thỏa thuận</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {formatCurrency(contract.rentPrice)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block mb-1">Ngày chốt tiền định kỳ</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        Ngày {contract.billingDay} hàng tháng
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 block mb-1">Chu kỳ thanh toán</span>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {contract.paymentCycleMonths} tháng / lần
                      </span>
                    </div>
                  </div>

                  {contract.note && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <strong>Ghi chú hợp đồng:</strong> {contract.note}
                    </div>
                  )}

                  {/* Liquidation / Checkout procedure */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Thanh Lý Hợp Đồng & Trả Phòng
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Kiểm tra tài sản, chốt số điện nước ngày cuối và hoàn trả cọc
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Làm thủ tục trả phòng</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Chưa có hợp đồng thuê</p>
                  <p className="text-slate-400 mt-1">Phòng đang trống hoặc đang chờ khách mới lập hợp đồng.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASSETS / INVENTORY */}
          {activeTab === 'ASSETS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Danh mục tài sản & trang thiết bị đã bàn giao cho khách thuê
                </span>
                <span className="font-bold text-blue-600">
                  Tổng giá trị bảo chứng: {formatCurrency(roomAssets.reduce((a, b) => a + b.compensationPrice, 0))}
                </span>
              </div>

              {roomAssets.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Chưa có danh mục tài sản</p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Tên thiết bị & Nhãn hiệu</th>
                        <th className="p-3">Mã định danh</th>
                        <th className="p-3">Tình trạng</th>
                        <th className="p-3 text-right">Giá đền bù nếu mất/hỏng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {roomAssets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                            <div className="text-[11px] text-slate-400">{asset.brand}</div>
                            {asset.note && <div className="text-[11px] text-amber-600 mt-0.5">{asset.note}</div>}
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-600 dark:text-slate-400">
                            {asset.code}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ASSET_CONDITION_CONFIG[asset.condition].badgeClass
                              }`}
                            >
                              {ASSET_CONDITION_CONFIG[asset.condition].label}
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-slate-800 dark:text-slate-200">
                            {formatCurrency(asset.compensationPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INVOICES & PAYMENTS */}
          {activeTab === 'INVOICES' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">Lịch sử xuất hóa đơn tiền phòng và điện nước</div>

              {roomInvoices.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Chưa có hóa đơn nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roomInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            Kỳ Hóa Đơn: {inv.month}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              INVOICE_STATUS_CONFIG[inv.status].badgeClass
                            }`}
                          >
                            {INVOICE_STATUS_CONFIG[inv.status].label}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          Điện ({inv.electricUsage} kWh) • Nước ({inv.waterUsage} m³) • Dịch vụ:{' '}
                          {formatCurrency(inv.garbageFee + inv.internetFee + inv.parkingFee + inv.serviceFee)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            {formatCurrency(inv.totalAmount)}
                          </div>
                          {inv.paidDate && (
                            <div className="text-[11px] text-emerald-600 font-medium">
                              Đã nộp ngày {formatDate(inv.paidDate)}
                            </div>
                          )}
                        </div>

                        {onOpenInvoiceModal && (
                          <button
                            onClick={() => onOpenInvoiceModal(inv)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Mã VietQR</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Trạng thái phòng:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.badgeClass}`}>
              {statusCfg.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
