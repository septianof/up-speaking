"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/staff/Sidebar";
import { getActiveStaff } from "@/lib/staff-session";
import { StaffUser } from "@/types/staff";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const active = getActiveStaff();
    if (!active) {
      router.push("/staff/login");
      return;
    }

    // Role Guard: If tutor tries to access admin, redirect to tutor dashboard
    if (active.role !== "ADMIN") {
      router.push("/staff/tutor/dashboard");
      return;
    }

    setUser(active);
    setIsLoading(false);
  }, [router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-xs text-text-muted">Memuat panel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content (Offset 260px on Desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
