"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearStaffSession } from "@/lib/staff-session";
import { StaffUser } from "@/types/staff";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Award,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export interface SidebarProps {
  user: StaffUser;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin = user.role === "ADMIN";

  // Navigation Items by Role
  const adminNav = [
    {
      title: "Dashboard",
      href: "/staff/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Kelola Siswa",
      href: "/staff/admin/students",
      icon: Users,
    },
    {
      title: "Kelola Tutor",
      href: "/staff/admin/tutors",
      icon: GraduationCap,
    },
    {
      title: "Bank Soal",
      href: "/staff/admin/questions",
      icon: BookOpen,
    },
    {
      title: "Hasil & Laporan",
      href: "/staff/admin/reports",
      icon: FileSpreadsheet,
    },
  ];

  const tutorNav = [
    {
      title: "Dashboard",
      href: "/staff/tutor/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Penilaian Siswa",
      href: "/staff/tutor/evaluations",
      icon: Award,
    },
    {
      title: "Bank Soal",
      href: "/staff/tutor/questions",
      icon: BookOpen,
    },
    {
      title: "Laporan & Rekap",
      href: "/staff/tutor/reports",
      icon: FileSpreadsheet,
    },
  ];

  const navItems = isAdmin ? adminNav : tutorNav;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Error logging out:", e);
    } finally {
      clearStaffSession();
      router.push("/staff/login");
    }
  };

  return (
    <>
      {/* Mobile Header Bar with Hamburger */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-surface-white border-b border-surface-border px-4 py-3 shadow-xs w-full">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-text-secondary hover:bg-surface-subtle active:scale-95 transition-transform"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5 text-text-primary" />
          </button>
          <Image
            src="/images/logo.png"
            alt="Up Speaking Logo"
            width={100}
            height={32}
            priority
            className="h-7 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 truncate max-w-[150px]">
            {isAdmin ? "Admin" : `Tutor • ${user.targetLevel === "ELEMENTARY" ? "Elementary" : "High School"}`}
          </span>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container (Desktop 260px fixed / Mobile Slide Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-surface-white border-r border-surface-border flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top: Logo & Close Button */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-surface-border">
            <Image
              src="/images/logo.png"
              alt="Up Speaking Logo"
              width={130}
              height={40}
              priority
              className="h-9 w-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-surface-subtle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="px-4 py-3 mx-2 my-2 rounded-xl bg-surface-subtle border border-surface-border flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
              {user.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{user.fullName}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{isAdmin ? 'Administrator' : `Tutor • ${user.targetLevel === 'ELEMENTARY' ? 'Elementary' : 'High School'}`}</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary-50 text-primary-700 border-l-2 border-primary-500"
                      : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-primary-600" : "text-text-muted"
                      }`}
                    />
                    <span>{item.title}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary-500" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Logout */}
        <div className="p-3 border-t border-surface-border">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:bg-surface-subtle hover:text-text-primary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};
