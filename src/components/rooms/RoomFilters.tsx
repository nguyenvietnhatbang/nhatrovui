'use client';

import React from 'react';
import { Search, Filter, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { RoomStatus } from '@/types';
import { ROOM_STATUS_CONFIG } from '@/lib/formatters';

interface RoomFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: RoomStatus | 'ALL';
  onStatusChange: (status: RoomStatus | 'ALL') => void;
  selectedFloor: number | 'ALL';
  onFloorChange: (floor: number | 'ALL') => void;
  availableFloors: number[];
  viewMode: 'GRID' | 'TABLE';
  onViewModeChange: (mode: 'GRID' | 'TABLE') => void;
  statusCounts: Record<string, number>;
}

export function RoomFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedFloor,
  onFloorChange,
  availableFloors,
  viewMode,
  onViewModeChange,
  statusCounts,
}: RoomFiltersProps) {
  const statusOptions: { id: RoomStatus | 'ALL'; label: string; countKey: string; badgeColor?: string }[] = [
    { id: 'ALL', label: 'Tất cả phòng', countKey: 'ALL' },
    { id: 'OCCUPIED', label: 'Đang thuê', countKey: 'OCCUPIED' },
    { id: 'VACANT', label: 'Phòng trống', countKey: 'VACANT' },
    { id: 'OVERDUE', label: 'Nợ quá hạn', countKey: 'OVERDUE', badgeColor: 'bg-rose-500 text-white' },
    { id: 'RESERVED', label: 'Đã cọc giữ', countKey: 'RESERVED' },
    { id: 'MAINTENANCE', label: 'Đang sửa chữa', countKey: 'MAINTENANCE' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      {/* Top row: Search & View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo số phòng (vd: P.101, 202) hoặc tên khách, SĐT..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Floor selector & View Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Floor filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => onFloorChange('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedFloor === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả tầng
            </button>
            {availableFloors.map((floor) => (
              <button
                key={floor}
                onClick={() => onFloorChange(floor)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedFloor === floor
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tầng {floor}
              </button>
            ))}
          </div>

          {/* Grid vs Table toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => onViewModeChange('GRID')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Xem ma trận phòng"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('TABLE')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Xem danh sách bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
        {statusOptions.map((opt) => {
          const isSelected = selectedStatus === opt.id;
          const count = statusCounts[opt.countKey] || 0;

          return (
            <button
              key={opt.id}
              onClick={() => onStatusChange(opt.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  opt.badgeColor
                    ? opt.badgeColor
                    : isSelected
                    ? 'bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
