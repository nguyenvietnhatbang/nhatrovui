'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@trocloud.vn');
  const [password, setPassword] = useState('123456');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (remember) {
      localStorage.setItem('trocloud_auth', 'true');
    } else {
      sessionStorage.setItem('trocloud_auth', 'true');
    }
    setTimeout(() => {
      router.push('/');
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header Branding */}
        <div className="p-8 pb-6 text-center border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            TroCloud ERP
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ Thống Quản Trị Nhà Trọ & Căn Hộ Dịch Vụ
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-8 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email / Tên đăng nhập
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@trocloud.vn"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:border-slate-800 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Mật khẩu</label>
              <a href="#" className="text-blue-600 hover:underline text-[11px]">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-200 text-xs focus:outline-hidden focus:border-slate-800 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-md bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Phiên bản Enterprise v2.4 • Bảo mật SSL 256-bit
        </div>
      </div>
    </div>
  );
}
