'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, ShieldCheck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboardPlaceholder() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email || 'Admin');
      }
      setIsLoading(false);
    }
    checkUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.replace('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#0e263e] animate-spin mb-3" />
        <p className="text-xs text-slate-500">Memeriksa sesi admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard Admin Portal</h1>
              <p className="text-xs text-slate-500">Login sebagai: {adminEmail}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-2">
          <LayoutDashboard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-800">Autentikasi Admin Berhasil!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Sesi login Supabase Auth dan middleware proteksi rute telah aktif.
            Layout admin lengkap, sidebar, dan 4 kartu ringkasan metrik akan diimplementasikan pada task ADM-02 & ADM-03.
          </p>
        </div>
      </div>
    </div>
  );
}
