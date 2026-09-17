'use client';

import React from 'react';
import { X, Printer, Download, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { Tenant, Property } from '@/types';
import { formatDate } from '@/lib/formatters';

interface ExportTamTruModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  property: Property | null;
}

export function ExportTamTruModal({
  isOpen,
  onClose,
  tenants,
  property,
}: ExportTamTruModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-md shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Bản Khai Báo Tạm Trú Với Công An Khu Vực
              </h3>
              <p className="text-xs text-slate-500">
                Mẫu chuẩn theo Luật Cư trú - Dùng để nộp Công an phường / Cổng DVC Bộ Công An
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>In Danh Sách (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 dark:text-slate-200">
          {/* Header of document */}
          <div className="text-center space-y-1">
            <div className="font-bold text-xs uppercase tracking-wider">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs underline font-semibold">Độc lập - Tự do - Hạnh phúc</div>
            <div className="pt-4 text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
              DANH SÁCH NGƯỜI ĐẾN LƯU TRÚ / ĐĂNG KÝ TẠM TRÚ
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Kính gửi: Công an Phường / Xã quản lý địa bàn
            </p>
          </div>

          {/* House info */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
            <div>
              <strong>Tên cơ sở lưu trú / Nhà trọ:</strong> {property?.name || 'Nhà Trọ Sunshine'}
            </div>
            <div>
              <strong>Địa chỉ:</strong> {property?.address || 'Quận Bình Thạnh, TP.HCM'}
            </div>
            <div>
              <strong>Chủ cơ sở / Người đại diện:</strong> {property?.managerName || 'Nguyễn Văn Hùng'} • SĐT: {property?.phone}
            </div>
          </div>

          {/* Table of residents */}
          <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 text-center">STT</th>
                  <th className="p-2.5">Họ và tên</th>
                  <th className="p-2.5">Số CCCD / Ngày cấp</th>
                  <th className="p-2.5">Ngày sinh</th>
                  <th className="p-2.5">Quê quán (Thường trú)</th>
                  <th className="p-2.5">Phòng</th>
                  <th className="p-2.5">Biển số xe</th>
                  <th className="p-2.5">Ngày đến</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tenants.map((t, idx) => (
                  <tr key={t.id}>
                    <td className="p-2.5 text-center font-bold">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{t.name}</td>
                    <td className="p-2.5 font-mono">{t.cccd}</td>
                    <td className="p-2.5">{formatDate(t.birthDate)}</td>
                    <td className="p-2.5">{t.hometown}</td>
                    <td className="p-2.5 font-bold text-blue-600">P.{t.roomId.replace('room-', '')}</td>
                    <td className="p-2.5 font-mono">{t.vehiclePlate || '-'}</td>
                    <td className="p-2.5">{formatDate(t.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 pt-6 text-center text-xs">
            <div>
              <div className="font-bold">XÁC NHẬN CÔNG AN PHƯỜNG</div>
              <div className="text-[11px] text-slate-400 italic mt-0.5">(Ký, đóng dấu)</div>
            </div>

            <div>
              <div className="text-slate-500 italic">
                Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
              <div className="font-bold mt-1">NGƯỜI LẬP DANH SÁCH / CHỦ NHÀ TRỌ</div>
              <div className="text-[11px] text-slate-400 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
              <div className="mt-14 font-black">{property?.managerName || 'Nguyễn Văn Hùng'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
