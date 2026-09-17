'use client';

import React from 'react';
import {
  User,
  Phone,
  Layers,
  Wrench,
  AlertTriangle,
  Zap,
  Receipt,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Room, Tenant } from '@/types';
import { formatCurrency, ROOM_STATUS_CONFIG } from '@/lib/formatters';
import { AvatarLetter } from '@/components/common/AvatarLetter';

interface RoomCardProps {
  room: Room;
  tenant?: Tenant;
  onSelectRoom: (room: Room) => void;
  onQuickBill?: (room: Room) => void;
}

export function RoomCard({ room, tenant, onSelectRoom, onQuickBill }: RoomCardProps) {
  const statusCfg = ROOM_STATUS_CONFIG[room.status];

  return (
    <div
      onClick={() => onSelectRoom(room)}
      className={`group relative rounded-2xl border ${statusCfg.border} ${statusCfg.bg} p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center font-black text-slate-900 dark:text-white text-sm">
              {room.roomNumber}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>{room.type}</span>
                <span className="text-slate-400 font-normal">• T{room.floor}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">{room.area} m²</div>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusCfg.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
            <span>{statusCfg.label}</span>
          </span>
        </div>

        {/* Room Price */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="text-xs text-slate-500">Giá thuê niêm yết:</div>
          <div className="text-base font-black text-blue-700 dark:text-blue-400 tracking-tight">
            {formatCurrency(room.basePrice)}
            <span className="text-xs font-normal text-slate-400">/tháng</span>
          </div>
        </div>

        {/* Tenant Information or Vacant Notice */}
        <div className="mt-3 min-h-[48px]">
          {tenant ? (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 shadow-2xs">
              <AvatarLetter name={tenant.name} size="sm" />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {tenant.name}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{tenant.phone}</span>
                </div>
              </div>
            </div>
          ) : room.status === 'RESERVED' ? (
            <div className="p-2 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Đã nhận cọc, chờ ngày vào ở</span>
            </div>
          ) : room.status === 'MAINTENANCE' ? (
            <div className="p-2 rounded-xl bg-indigo-100/60 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs font-medium flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Đang sửa chữa / Sơn mới</span>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 text-xs font-medium flex items-center justify-center gap-1">
              <span>Phòng sẵn sàng đón khách</span>
            </div>
          )}
        </div>

        {/* Overdue Warning pill */}
        {room.status === 'OVERDUE' && (
          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Chưa thanh toán kỳ T9 ({room.overdueDays || 5} ngày)</span>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-1 text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectRoom(room);
          }}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Xem chi tiết</span>
        </button>

        <span className="text-[11px] text-slate-400">
          {room.amenities.length} tiện nghi
        </span>
      </div>
    </div>
  );
}
