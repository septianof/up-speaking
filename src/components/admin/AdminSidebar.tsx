'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminSidebarProps {
  adminEmail: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Bank Soal',
    href: '/admin/questions',
    icon: FileText,
  },
  {
    name: 'Pengaturan Ujian',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminSidebar({
  adminEmail,
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.replace('/admin');
  };

  const emailInitial = adminEmail ? adminEmail.charAt(0).toUpperCase() : 'A';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80">
      {/* Brand Header */}
      <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group focus:outline-none">
          <div className="relative w-9 h-9 flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
            <Image
              src="/logo/logo_transparent.png"
              alt="Up Speaking Logo"
              fill
              sizes="36px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-[#1e3a8a] tracking-tight leading-none">
              Up Speaking
            </span>
            <span className="font-semibold text-[10px] text-[#0284c7] tracking-wider uppercase leading-tight mt-0.5">
              Admin Portal
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Tutup sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Menu Utama
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#0e263e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#00a6f4]' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Akses Eksternal
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
          >
            <span className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>Lihat Web Siswa</span>
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
              Baru
            </span>
          </Link>
        </div>
      </nav>

      {/* Profile & Logout Section (Bottom) */}
      <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/80 mb-2 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {emailInitial}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-bold text-slate-800 truncate leading-tight">
              {adminEmail || 'Admin Up Speaking'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide Over with Backdrop) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-full z-50 shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
