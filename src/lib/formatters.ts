import {
  RoomStatus,
  ContractStatus,
  InvoiceStatus,
  TemporaryResidenceStatus,
  AssetCondition,
  TicketPriority,
  TicketStatus,
} from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num || 0);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatMonth(monthString: string): string {
  if (!monthString) return '';
  const parts = monthString.split('-');
  if (parts.length === 2) {
    return `Tháng ${parseInt(parts[1], 10)}/${parts[0]}`;
  }
  return monthString;
}

export const ROOM_STATUS_CONFIG: Record<
  RoomStatus,
  { label: string; bg: string; text: string; border: string; badgeClass: string; dotClass: string }
> = {
  OCCUPIED: {
    label: 'Đang thuê',
    bg: 'bg-emerald-50',
    text: 'text-emerald-950',
    border: 'border-emerald-300',
    badgeClass: 'bg-emerald-50 text-emerald-950 border border-emerald-400 font-semibold',
    dotClass: 'bg-emerald-600',
  },
  VACANT: {
    label: 'Phòng trống',
    bg: 'bg-slate-100',
    text: 'text-slate-900',
    border: 'border-slate-300',
    badgeClass: 'bg-slate-100 text-slate-800 border border-slate-300 font-semibold',
    dotClass: 'bg-slate-500',
  },
  RESERVED: {
    label: 'Đã cọc giữ',
    bg: 'bg-amber-50',
    text: 'text-amber-950',
    border: 'border-amber-300',
    badgeClass: 'bg-amber-50 text-amber-950 border border-amber-400 font-semibold',
    dotClass: 'bg-amber-600',
  },
  OVERDUE: {
    label: 'Nợ quá hạn',
    bg: 'bg-rose-50',
    text: 'text-rose-950',
    border: 'border-rose-300',
    badgeClass: 'bg-rose-50 text-rose-950 border border-rose-400 font-bold',
    dotClass: 'bg-rose-600',
  },
  MAINTENANCE: {
    label: 'Đang sửa chữa',
    bg: 'bg-indigo-50',
    text: 'text-indigo-950',
    border: 'border-indigo-300',
    badgeClass: 'bg-indigo-50 text-indigo-950 border border-indigo-400 font-semibold',
    dotClass: 'bg-indigo-600',
  },
};

export const CONTRACT_STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ACTIVE: {
    label: 'Còn hiệu lực',
    badgeClass: 'bg-emerald-50 text-emerald-950 border border-emerald-400 font-semibold',
    dotClass: 'bg-emerald-600',
  },
  EXPIRING_SOON: {
    label: 'Sắp hết hạn (<30 ngày)',
    badgeClass: 'bg-amber-50 text-amber-950 border border-amber-400 font-semibold',
    dotClass: 'bg-amber-600',
  },
  TERMINATED: {
    label: 'Đã thanh lý',
    badgeClass: 'bg-slate-100 text-slate-800 border border-slate-300 font-semibold',
    dotClass: 'bg-slate-500',
  },
};

export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  PAID: {
    label: 'Đã thanh toán',
    badgeClass: 'bg-emerald-50 text-emerald-950 border border-emerald-400 font-semibold',
    dotClass: 'bg-emerald-600',
  },
  UNPAID: {
    label: 'Chưa thanh toán',
    badgeClass: 'bg-amber-50 text-amber-950 border border-amber-400 font-semibold',
    dotClass: 'bg-amber-600',
  },
  OVERDUE: {
    label: 'Quá hạn nộp',
    badgeClass: 'bg-rose-50 text-rose-950 border border-rose-400 font-bold',
    dotClass: 'bg-rose-600',
  },
};

export const TEMPORARY_RESIDENCE_CONFIG: Record<
  TemporaryResidenceStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  REGISTERED: {
    label: 'Đã khai báo CA',
    badgeClass: 'bg-emerald-50 text-emerald-950 border border-emerald-400 font-semibold',
    dotClass: 'bg-emerald-600',
  },
  NOT_REGISTERED: {
    label: 'Chưa khai báo',
    badgeClass: 'bg-rose-50 text-rose-950 border border-rose-400 font-semibold',
    dotClass: 'bg-rose-600',
  },
  EXPIRING: {
    label: 'Sắp hết hạn',
    badgeClass: 'bg-amber-50 text-amber-950 border border-amber-400 font-semibold',
    dotClass: 'bg-amber-600',
  },
};

export const ASSET_CONDITION_CONFIG: Record<
  AssetCondition,
  { label: string; badgeClass: string }
> = {
  NEW: { label: 'Mới 100%', badgeClass: 'bg-blue-50 text-blue-950 border border-blue-300 font-semibold' },
  GOOD: { label: 'Hoạt động tốt', badgeClass: 'bg-emerald-50 text-emerald-950 border border-emerald-300 font-semibold' },
  FAIR: { label: 'Cũ / Trầy xước', badgeClass: 'bg-amber-50 text-amber-950 border border-amber-300 font-semibold' },
  DAMAGED: { label: 'Hư hỏng', badgeClass: 'bg-rose-50 text-rose-950 border border-rose-300 font-semibold' },
};

export const TICKET_PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; badgeClass: string }
> = {
  LOW: { label: 'Thấp', badgeClass: 'bg-slate-100 text-slate-800 border border-slate-300 font-medium' },
  MEDIUM: { label: 'Bình thường', badgeClass: 'bg-blue-50 text-blue-950 border border-blue-300 font-semibold' },
  HIGH: { label: 'Quan trọng', badgeClass: 'bg-amber-50 text-amber-950 border border-amber-400 font-semibold' },
  URGENT: { label: 'Khẩn cấp', badgeClass: 'bg-rose-50 text-rose-950 border border-rose-400 font-bold' },
};

export const TICKET_STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  PENDING: {
    label: 'Chờ tiếp nhận',
    badgeClass: 'bg-amber-50 text-amber-950 border border-amber-400 font-semibold',
    dotClass: 'bg-amber-600',
  },
  IN_PROGRESS: {
    label: 'Đang sửa chữa',
    badgeClass: 'bg-blue-50 text-blue-950 border border-blue-400 font-semibold',
    dotClass: 'bg-blue-600',
  },
  RESOLVED: {
    label: 'Đã hoàn thành',
    badgeClass: 'bg-emerald-50 text-emerald-950 border border-emerald-400 font-semibold',
    dotClass: 'bg-emerald-600',
  },
};
