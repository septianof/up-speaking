'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { createClient } from '@/lib/supabase/client';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadAdminUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.email) {
          setAdminEmail(user.email);
        }
      } catch (err) {
        console.error('Error saat memuat sesi admin di layout:', err);
      }
    }

    loadAdminUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* 1. Sidebar Navigasi (Fixed Desktop & Slide Drawer Mobile) */}
      <AdminSidebar
        adminEmail={adminEmail}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Area Konten Utama (Offset kiri lg:pl-64) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar Header */}
        <AdminHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          adminEmail={adminEmail}
        />

        {/* Konten Halaman Aktif */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
