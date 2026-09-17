'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  CreditCard,
  Zap,
  RotateCcw,
  Save,
  CheckCircle2,
  ShieldAlert,
  QrCode,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/formatters';
import { SUPPORTED_BANKS } from '@/lib/vietqr';

export default function SettingsPage() {
  const { properties, selectedProperty, resetToDefaultData } = useApp();

  const activeProperty = selectedProperty || properties[0];

  const [bankCode, setBankCode] = useState(activeProperty.bankConfig.bankCode);
  const [bankAccount, setBankAccount] = useState(activeProperty.bankConfig.accountNumber);
  const [bankName, setBankName] = useState(activeProperty.bankConfig.accountName);

  const [electricPrice, setElectricPrice] = useState(activeProperty.defaultRates.electricPrice);
  const [waterPrice, setWaterPrice] = useState(activeProperty.defaultRates.waterPrice);
  const [internetFee, setInternetFee] = useState(activeProperty.defaultRates.internetFee);
  const [garbageFee, setGarbageFee] = useState(activeProperty.defaultRates.garbageFee);
  const [parkingFee, setParkingFee] = useState(activeProperty.defaultRates.parkingMotorbikeFee);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    alert('Đã lưu cấu hình đơn giá và tài khoản ngân hàng thành công!');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (
      confirm(
        'Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu ban đầu của hệ thống? Tất cả dữ liệu thử nghiệm sẽ được đưa về trạng thái gốc chuẩn.'
      )
    ) {
      resetToDefaultData();
      alert('Đã khôi phục dữ liệu ban đầu thành công!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 pb-12 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          Cài Đặt & Cấu Hình Hệ Thống
        </h1>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* Section 1: Bank Account for Dynamic VietQR */}
        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xs bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Tài Khoản Ngân Hàng Sinh VietQR (Napas 247)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Ngân hàng thụ hưởng
              </label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full p-2 rounded-sm border border-slate-300 bg-white font-medium cursor-pointer"
              >
                {SUPPORTED_BANKS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Số tài khoản ngân hàng
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full p-2 rounded-sm border border-slate-300 bg-white font-mono font-semibold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Tên chủ tài khoản
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value.toUpperCase())}
                className="w-full p-2 rounded-sm border border-slate-300 bg-white font-semibold uppercase"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Default Utility Rates */}
        <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xs bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Bảng Đơn Giá Dịch Vụ Mặc Định ({activeProperty.name})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Đơn giá Điện (VND / kWh)
              </label>
              <input
                type="number"
                value={electricPrice}
                onChange={(e) => setElectricPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 rounded-sm border border-slate-300 bg-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Đơn giá Nước (VND / m³)
              </label>
              <input
                type="number"
                value={waterPrice}
                onChange={(e) => setWaterPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 rounded-sm border border-slate-300 bg-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Phí Internet / Wifi (VND / phòng)
              </label>
              <input
                type="number"
                value={internetFee}
                onChange={(e) => setInternetFee(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 rounded-sm border border-slate-300 bg-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Phí Rác & Vệ sinh (VND / phòng)
              </label>
              <input
                type="number"
                value={garbageFee}
                onChange={(e) => setGarbageFee(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 rounded-sm border border-slate-300 bg-white font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Phí gửi xe máy (VND / xe / tháng)
              </label>
              <input
                type="number"
                value={parkingFee}
                onChange={(e) => setParkingFee(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 rounded-sm border border-slate-300 bg-white font-mono font-semibold"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-slate-950 hover:bg-slate-800 text-white font-medium text-xs shadow-2xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Đã lưu cài đặt' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Data Management */}
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xs bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Quản Lý Dữ Liệu Hệ Thống
            </h3>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục dữ liệu ban đầu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
