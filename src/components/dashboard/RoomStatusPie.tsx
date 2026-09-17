'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '@/context/AppContext';

export function RoomStatusPie() {
  const { dashboardStats } = useApp();

  const data = [
    { name: 'Đang thuê', value: dashboardStats.occupiedRooms, color: '#059669' },
    { name: 'Phòng trống', value: dashboardStats.vacantRooms, color: '#64748b' },
    { name: 'Nợ quá hạn', value: dashboardStats.overdueRooms, color: '#e11d48' },
    { name: 'Đã cọc giữ', value: dashboardStats.reservedRooms, color: '#d97706' },
    { name: 'Đang sửa chữa', value: dashboardStats.maintenanceRooms, color: '#4f46e5' },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          Hiện Trạng Phòng ({dashboardStats.totalRooms})
        </h3>
        <span className="text-xs font-bold text-emerald-800">
          {dashboardStats.occupancyRate}% lấp đầy
        </span>
      </div>

      <div className="h-40 w-full my-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val, name) => [`${val} phòng`, name]}
              contentStyle={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold text-slate-950">
            {dashboardStats.occupancyRate}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs pt-1.5 border-t border-slate-100">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-800 font-medium truncate">{item.name}</span>
            </div>
            <span className="font-bold text-slate-950">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
