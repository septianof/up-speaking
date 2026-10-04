'use client';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Harap masukkan email dan password admin.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('Error login admin:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Email atau password yang Anda masukkan salah.');
        } else {
          setErrorMsg(error.message || 'Gagal masuk. Silakan periksa kembali akun admin Anda.');
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        router.refresh();
        router.replace(redirectPath);
      }
    } catch (err) {
      console.error('Unexpected error login:', err);
      setErrorMsg('Terjadi kendala sistem. Silakan coba sesaat lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between selection:bg-rose-100 selection:text-rose-900 p-4 sm:p-6">
      {/* Top Header Link */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Siswa</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Admin Portal</span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.06)] animate-scale-in">
          {/* Brand & Logo Header */}
          <div className="text-center mb-8">
            <div className="relative w-14 h-14 mx-auto mb-3">
              <Image
                src="/logo/logo_transparent.png"
                alt="Up Speaking Logo"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Portal Admin Up Speaking
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Masuk untuk mengelola data siswa, bank soal, dan hasil placement test
            </p>
          </div>

          {/* Alert Notifikasi Error */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 mb-6 animate-fade-in"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
              >
                Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@upspeaking.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e263e] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e263e] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Tombol Submit Masuk */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/10 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Memverifikasi Kredensial...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="text-center text-slate-400 text-xs py-4">
        &copy; {new Date().getFullYear()} Up Speaking Learning Centre. All rights reserved.
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-[#0e263e] animate-spin mb-3" />
          <p className="text-xs text-slate-500">Memuat portal login admin...</p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
