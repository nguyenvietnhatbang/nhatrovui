'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Droplets, AlertTriangle, Save, Check, Sparkles } from 'lucide-react';
import { UtilityReading } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { useApp } from '@/context/AppContext';

interface MeterReadingRow {
  roomId: string;
  roomNumber: string;
  tenantName: string;
  oldElectric: number;
  newElectric: number;
  oldWater: number;
  newWater: number;
  motorbikeCount: number;
  otherFee: number;
  otherFeeReason: string;
}

export function MeterReadingTable({ month }: { month: string }) {
  const {
    filteredRooms,
    tenants,
    selectedProperty,
    properties,
    utilityReadings,
    saveBatchUtilityReadings,
    generateInvoicesForMonth,
  } = useApp();

  const activeProperty = selectedProperty || properties[0];
  const occupiedRooms = filteredRooms.filter(
    (r) => r.status === 'OCCUPIED' || r.status === 'OVERDUE'
  );

  const [rows, setRows] = useState<MeterReadingRow[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Initialize rows from current utilityReadings or room base values
  useEffect(() => {
    const initialRows: MeterReadingRow[] = occupiedRooms.map((room) => {
      const tenant = tenants.find((t) => t.id === room.currentTenantId);
      const existingReading = utilityReadings.find(
        (u) => u.roomId === room.id && u.month === month
      );

      const oldE = existingReading ? existingReading.oldElectric : 1000 + room.floor * 150;
      const newE = existingReading ? existingReading.newElectric : oldE + 125;

      const oldW = existingReading ? existingReading.oldWater : 50 + room.floor * 10;
      const newW = existingReading ? existingReading.newWater : oldW + 9;

      return {
        roomId: room.id,
        roomNumber: room.roomNumber,
        tenantName: tenant?.name || 'Khách thuê',
        oldElectric: oldE,
        newElectric: newE,
        oldWater: oldW,
        newWater: newW,
        motorbikeCount: existingReading ? existingReading.motorbikeCount : 1,
        otherFee: existingReading ? existingReading.otherFee : 0,
        otherFeeReason: existingReading?.otherFeeReason || '',
      };
    });

    setRows(initialRows);
  }, [occupiedRooms.length, month, utilityReadings.length]);

  const handleInputChange = (
    index: number,
    field: keyof MeterReadingRow,
    value: any
  ) => {
    setIsSaved(false);
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const handleSaveAll = () => {
    const readingsToSave: UtilityReading[] = rows.map((row) => ({
      id: `util-${row.roomId}-${month}`,
      propertyId: activeProperty.id,
      roomId: row.roomId,
      roomNumber: row.roomNumber,
      month,
      oldElectric: row.oldElectric,
      newElectric: row.newElectric,
      electricPrice: activeProperty.defaultRates.electricPrice,
      oldWater: row.oldWater,
      newWater: row.newWater,
      waterPrice: activeProperty.defaultRates.waterPrice,
      garbageFee: activeProperty.defaultRates.garbageFee,
      internetFee: activeProperty.defaultRates.internetFee,
      parkingFee: row.motorbikeCount * activeProperty.defaultRates.parkingMotorbikeFee,
      motorbikeCount: row.motorbikeCount,
      serviceFee: activeProperty.defaultRates.serviceFee,
      otherFee: row.otherFee,
      otherFeeReason: row.otherFeeReason,
      recordedAt: new Date().toISOString(),
      recordedBy: activeProperty.managerName,
    }));

    saveBatchUtilityReadings(readingsToSave);
    setIsSaved(true);
    alert('Đã lưu toàn bộ chỉ số điện nước thành công!');
  };

  const handleGenerateInvoices = () => {
    handleSaveAll();
    const count = generateInvoicesForMonth(activeProperty.id, month);
    alert(
      `Đã tự động tính toán và tạo xong ${count} hóa đơn tiền phòng & VietQR thanh toán cho kỳ ${month}!`
    );
  };

  // Grand totals
  const totalElectricUsage = rows.reduce((a, b) => a + Math.max(0, b.newElectric - b.oldElectric), 0);
  const totalWaterUsage = rows.reduce((a, b) => a + Math.max(0, b.newWater - b.oldWater), 0);
  const totalEstimatedCost = rows.reduce((sum, row) => {
    const eCost = Math.max(0, row.newElectric - row.oldElectric) * activeProperty.defaultRates.electricPrice;
    const wCost = Math.max(0, row.newWater - row.oldWater) * activeProperty.defaultRates.waterPrice;
    const services =
      activeProperty.defaultRates.garbageFee +
      activeProperty.defaultRates.internetFee +
      activeProperty.defaultRates.serviceFee +
      row.motorbikeCount * activeProperty.defaultRates.parkingMotorbikeFee +
      row.otherFee;
    return sum + eCost + wCost + services;
  }, 0);

  return (
    <div className="space-y-3">
      {/* Summary Action Bar */}
      <div className="bg-white p-3 rounded-md border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div>
            <div className="text-slate-400 font-medium text-[11px]">Tổng điện tiêu thụ:</div>
            <div className="text-sm font-bold text-amber-700 flex items-center gap-1 mt-0.5">
              <Zap className="w-3.5 h-3.5" />
              <span>{formatNumber(totalElectricUsage)} kWh</span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-5">
            <div className="text-slate-400 font-medium text-[11px]">Tổng nước tiêu thụ:</div>
            <div className="text-sm font-bold text-cyan-700 flex items-center gap-1 mt-0.5">
              <Droplets className="w-3.5 h-3.5" />
              <span>{formatNumber(totalWaterUsage)} m³</span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-5">
            <div className="text-slate-400 font-medium text-[11px]">Tổng tiền dịch vụ tạm tính:</div>
            <div className="text-sm font-bold text-blue-700 mt-0.5">
              {formatCurrency(totalEstimatedCost)}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={handleSaveAll}
            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>{isSaved ? 'Đã lưu' : 'Lưu chỉ số'}</span>
          </button>

          <button
            onClick={handleGenerateInvoices}
            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Xuất Hóa Đơn & VietQR</span>
          </button>
        </div>
      </div>

      {/* Editable Table */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Phòng & Khách</th>
                <th className="py-2.5 px-3 bg-amber-100/80 text-amber-950 font-bold w-24">Số điện cũ</th>
                <th className="py-2.5 px-3 bg-amber-100/80 text-amber-950 font-bold w-28">Số điện mới</th>
                <th className="py-2.5 px-3 bg-amber-100/80 text-amber-950 font-bold text-center w-28">Tiêu thụ (kWh)</th>
                <th className="py-2.5 px-3 bg-cyan-100/80 text-cyan-950 font-bold w-24">Số nước cũ</th>
                <th className="py-2.5 px-3 bg-cyan-100/80 text-cyan-950 font-bold w-28">Số nước mới</th>
                <th className="py-2.5 px-3 bg-cyan-100/80 text-cyan-950 font-bold text-center w-28">Tiêu thụ (m³)</th>
                <th className="py-2.5 px-3 text-center w-24">Xe máy</th>
                <th className="py-2.5 px-3 text-right">Tổng dịch vụ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => {
                const electricUsage = row.newElectric - row.oldElectric;
                const waterUsage = row.newWater - row.oldWater;
                const isElectricAbnormal = electricUsage < 0 || electricUsage > 350;
                const isWaterAbnormal = waterUsage < 0 || waterUsage > 30;

                const electricCost = Math.max(0, electricUsage) * activeProperty.defaultRates.electricPrice;
                const waterCost = Math.max(0, waterUsage) * activeProperty.defaultRates.waterPrice;
                const servicesCost =
                  activeProperty.defaultRates.garbageFee +
                  activeProperty.defaultRates.internetFee +
                  activeProperty.defaultRates.serviceFee +
                  row.motorbikeCount * activeProperty.defaultRates.parkingMotorbikeFee +
                  row.otherFee;
                const totalRow = electricCost + waterCost + servicesCost;

                return (
                  <tr
                    key={row.roomId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Room & Tenant */}
                    <td className="py-2 px-3">
                      <div className="font-bold text-xs text-slate-900">
                        Phòng {row.roomNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">{row.tenantName}</div>
                    </td>

                    {/* Electric Old */}
                    <td className="py-2 px-3 bg-amber-50/20 font-mono text-slate-600 font-medium">
                      {row.oldElectric}
                    </td>

                    {/* Electric New Input */}
                    <td className="py-2 px-3 bg-amber-50/20">
                      <input
                        type="number"
                        value={row.newElectric}
                        onChange={(e) =>
                          handleInputChange(index, 'newElectric', parseInt(e.target.value, 10) || 0)
                        }
                        className={`w-24 px-2 py-1 text-xs rounded-sm font-mono font-bold border focus:outline-hidden transition-all ${
                          isElectricAbnormal
                            ? 'border-rose-500 bg-rose-50 text-rose-700'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </td>

                    {/* Electric Usage */}
                    <td className="py-2 px-3 bg-amber-50/20 text-center font-bold font-mono">
                      {isElectricAbnormal ? (
                        <span className="text-rose-600 inline-flex items-center gap-1" title="Chỉ số bất thường!">
                          <AlertTriangle className="w-3 h-3" />
                          {electricUsage}
                        </span>
                      ) : (
                        <span className="text-amber-800">
                          +{electricUsage}
                        </span>
                      )}
                    </td>

                    {/* Water Old */}
                    <td className="py-2 px-3 bg-cyan-50/20 font-mono text-slate-600 font-medium">
                      {row.oldWater}
                    </td>

                    {/* Water New Input */}
                    <td className="py-2 px-3 bg-cyan-50/20">
                      <input
                        type="number"
                        value={row.newWater}
                        onChange={(e) =>
                          handleInputChange(index, 'newWater', parseInt(e.target.value, 10) || 0)
                        }
                        className={`w-20 px-2 py-1 text-xs rounded-sm font-mono font-bold border focus:outline-hidden transition-all ${
                          isWaterAbnormal
                            ? 'border-rose-500 bg-rose-50 text-rose-700'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </td>

                    {/* Water Usage */}
                    <td className="py-2 px-3 bg-cyan-50/20 text-center font-bold font-mono">
                      {isWaterAbnormal ? (
                        <span className="text-rose-600 inline-flex items-center gap-1" title="Chỉ số bất thường!">
                          <AlertTriangle className="w-3 h-3" />
                          {waterUsage}
                        </span>
                      ) : (
                        <span className="text-cyan-800">+{waterUsage}</span>
                      )}
                    </td>

                    {/* Motorbike Count */}
                    <td className="py-2 px-3 text-center">
                      <select
                        value={row.motorbikeCount}
                        onChange={(e) =>
                          handleInputChange(index, 'motorbikeCount', parseInt(e.target.value, 10))
                        }
                        className="px-2 py-1 rounded-sm border border-slate-200 bg-white text-xs font-medium cursor-pointer"
                      >
                        <option value={0}>0 xe</option>
                        <option value={1}>1 xe</option>
                        <option value={2}>2 xe</option>
                        <option value={3}>3 xe</option>
                      </select>
                    </td>

                    {/* Row Total */}
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(totalRow)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
