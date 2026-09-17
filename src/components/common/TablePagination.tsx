'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <span className="text-slate-700 font-medium text-xs">Hiển thị:</span>
        <div className="flex items-center gap-1">
          {[10, 20, 50, 100].map((size) => (
            <button
              key={size}
              onClick={() => {
                onPageSizeChange(size);
                onPageChange(1);
              }}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                pageSize === size
                  ? 'bg-slate-900 text-white font-bold'
                  : 'hover:bg-slate-100 text-slate-700 font-medium'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-4">
        <span className="text-slate-800 font-mono font-bold">
          {startItem}-{endItem} / {totalItems}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trước</span>
          </button>

          <span className="font-bold text-slate-900 px-1">
            {currentPage}/{totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
