'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';

const REVENUE_DATA = [
  { month: 'T4/2026', roomRent: 78000000, electric: 11200000, water: 4200000, service: 3500000 },
  { month: 'T5/2026', roomRent: 81000000, electric: 12500000, water: 4600000, service: 3800000 },
  { month: 'T6/2026', roomRent: 84000000, electric: 14800000, water: 5100000, service: 4100000 },
  { month: 'T7/2026', roomRent: 85000000, electric: 15200000, water: 5300000, service: 4200000 },
  { month: 'T8/2026', roomRent: 87500000, electric: 14100000, water: 4900000, service: 4300000 },
  { month: 'T9/2026', roomRent: 89000000, electric: 13800000, water: 4800000, service: 4400000 },
];

export function RevenueChart() {
  return (
    <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          Doanh Thu 6 Tháng Gần Nhất
        </h3>
        <span className="px-2 py-0.5 rounded-xs bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
          112 Tr VNĐ/tháng
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={REVENUE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#334155' }}
              tickFormatter={(v) => `${v / 1000000}Tr`}
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                const labels: Record<string, string> = {
                  roomRent: 'Tiền phòng',
                  electric: 'Tiền điện',
                  water: 'Tiền nước',
                  service: 'Dịch vụ khác',
                };
                return [formatCurrency(Number(value)), labels[name] || name];
              }}
              contentStyle={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  roomRent: 'Tiền phòng',
                  electric: 'Điện',
                  water: 'Nước',
                  service: 'Dịch vụ',
                };
                return labels[value] || value;
              }}
            />
            <Bar dataKey="roomRent" name="roomRent" stackId="a" fill="#1d4ed8" />
            <Bar dataKey="electric" name="electric" stackId="a" fill="#d97706" />
            <Bar dataKey="water" name="water" stackId="a" fill="#0284c7" />
            <Bar dataKey="service" name="service" stackId="a" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
