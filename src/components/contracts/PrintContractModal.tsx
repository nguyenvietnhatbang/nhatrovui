'use client';

import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { Contract, Property, Tenant } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface PrintContractModalProps {
  contract: Contract | null;
  property: Property | null;
  tenant?: Tenant;
  onClose: () => void;
}

export function PrintContractModal({
  contract,
  property,
  tenant,
  onClose,
}: PrintContractModalProps) {
  if (!contract) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-md shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Hợp Đồng Thuê Nhà Trọ / Căn Hộ
              </h3>
              <p className="text-xs text-slate-500">
                Mã HĐ: {contract.code} • Chuẩn mẫu hợp đồng pháp lý nhà ở Việt Nam
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>In Hợp Đồng (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contract Printable Document */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
          {/* Header of contract */}
          <div className="text-center space-y-1 font-sans">
            <div className="font-bold text-xs uppercase tracking-wider">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs underline font-semibold">Độc lập - Tự do - Hạnh phúc</div>
            <div className="pt-4 text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
              HỢP ĐỒNG THUÊ PHÒNG TRỌ / NHÀ Ở
            </div>
            <p className="text-[11px] text-slate-500 italic">Số: {contract.code}</p>
          </div>

          <p className="italic text-[11px]">
            Hôm nay, ngày {new Date(contract.signedDate).getDate()} tháng{' '}
            {new Date(contract.signedDate).getMonth() + 1} năm {new Date(contract.signedDate).getFullYear()}
            , tại địa chỉ: {property?.address || 'TP.HCM'}, chúng tôi gồm có:
          </p>

          {/* Party A */}
          <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-sans">
            <div className="font-bold text-slate-900 dark:text-white uppercase">
              BÊN CHO THUÊ (BÊN A):
            </div>
            <div>Họ và tên: <strong>{property?.managerName || 'Nguyễn Văn Hùng'}</strong></div>
            <div>Số điện thoại liên hệ: <strong>{property?.phone}</strong></div>
            <div>Địa chỉ cơ sở: {property?.address}</div>
          </div>

          {/* Party B */}
          <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-sans">
            <div className="font-bold text-slate-900 dark:text-white uppercase">
              BÊN THUÊ PHÒNG (BÊN B):
            </div>
            <div>Họ và tên: <strong>{contract.tenantName}</strong></div>
            <div>Số CCCD: <strong className="font-mono">{tenant?.cccd || '038098012456'}</strong></div>
            <div>Số điện thoại: <strong>{tenant?.phone || '0908 123 456'}</strong></div>
            <div>Quê quán / Thường trú: {tenant?.hometown || 'Việt Nam'}</div>
          </div>

          {/* Clauses */}
          <div className="space-y-3 font-sans">
            <div>
              <strong>ĐIỀU 1: ĐỐI TƯỢNG VÀ THỜI HẠN THUÊ</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Bên A đồng ý cho Bên B thuê phòng tại số <strong>P.{contract.roomId.replace('room-', '')}</strong> thuộc cơ sở {property?.name}.
                Thời hạn thuê từ ngày <strong>{formatDate(contract.startDate)}</strong> đến hết ngày <strong>{formatDate(contract.endDate)}</strong>.
              </p>
            </div>

            <div>
              <strong>ĐIỀU 2: GIÁ THUÊ VÀ TIỀN ĐẶT CỌC</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                - Giá thuê phòng: <strong>{formatCurrency(contract.rentPrice)}/tháng</strong> (chưa bao gồm điện, nước và các dịch vụ khác).
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                - Tiền đặt cọc giữ gìn tài sản và bảo đảm thực hiện hợp đồng: <strong>{formatCurrency(contract.depositAmount)}</strong>. Tiền cọc sẽ được Bên A hoàn trả cho Bên B sau khi thanh lý hợp đồng và đã đối trừ các chi phí điện nước, hỏng hóc tài sản (nếu có).
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                - Thời hạn thanh toán: Bên B có nghĩa vụ thanh toán tiền phòng và dịch vụ vào ngày <strong>{contract.billingDay}</strong> hàng tháng.
              </p>
            </div>

            <div>
              <strong>ĐIỀU 3: QUẢN LÝ TÀI SẢN VÀ NỘI QUY PHÒNG TRỌ</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Bên B có trách nhiệm bảo quản nguyên vẹn các tài sản và trang thiết bị được bàn giao (Máy lạnh, tủ lạnh, giường nệm, khóa cửa, bình nước nóng). Không được tự ý khoan đục tường làm thay đổi kết cấu phòng. Nếu gây hư hại hoặc mất mát, Bên B phải bồi thường theo đúng giá trị niêm yết trong Biên bản bàn giao tài sản.
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 pt-8 text-center text-xs font-sans">
            <div>
              <div className="font-bold uppercase">ĐẠI DIỆN BÊN B (BÊN THUÊ)</div>
              <div className="text-[11px] text-slate-400 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
              <div className="mt-16 font-bold">{contract.tenantName}</div>
            </div>

            <div>
              <div className="font-bold uppercase">ĐẠI DIỆN BÊN A (BÊN CHO THUÊ)</div>
              <div className="text-[11px] text-slate-400 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
              <div className="mt-16 font-bold">{property?.managerName || 'Nguyễn Văn Hùng'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
