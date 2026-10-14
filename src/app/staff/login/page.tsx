"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { saveStaffSession } from "@/lib/staff-session";
import { Mail, Lock, AlertCircle, ArrowLeft, Shield, Eye, EyeOff } from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email atau kata sandi tidak sesuai.");
        return;
      }

      saveStaffSession(data.user);

      if (data.user.role === "ADMIN") {
        router.push("/staff/admin/dashboard");
      } else {
        router.push("/staff/tutor/dashboard");
      }
    } catch {
      setError("Terjadi kendala jaringan saat proses autentikasi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center py-10 px-4 sm:px-6">
      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-surface-white rounded-3xl border border-surface-border p-8 shadow-float">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Image
              src="/images/logo.png"
              alt="Up Speaking Logo"
              width={160}
              height={50}
              priority
              className="h-11 w-auto object-contain mb-4"
            />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Portal Akses Staf Lembaga</span>
            </div>
            <h1 className="text-xl font-bold text-text-primary">
              Masuk ke Dashboard
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Khusus pengelola Admin dan tim Tutor Up Speaking
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-btn bg-accent-50 border border-accent-200 text-accent-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-accent-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email Staf <span className="text-accent-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@upspeaking.com atau tutor@upspeaking.com"
                  className="w-full h-11 pl-10 pr-3.5 rounded-btn bg-surface-white border border-surface-border text-text-primary text-sm transition-all focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100 placeholder:text-text-disabled"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Kata Sandi <span className="text-accent-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 rounded-btn bg-surface-white border border-surface-border text-text-primary text-sm transition-all focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100 placeholder:text-text-disabled"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Masuk ke Dashboard
              </Button>
            </div>
          </form>
        </div>

        {/* Navigasi Balik ke Siswa & Footer di Bawah Card */}
        <div className="mt-6 flex flex-col items-center gap-2.5 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary-600 transition-colors py-1 px-3 rounded-full hover:bg-surface-white/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Siswa</span>
          </a>
          <footer className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Up Speaking Learning Centre
          </footer>
        </div>
      </main>
    </div>
  );
}
