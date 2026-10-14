"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveStaff } from "@/lib/staff-session";

/**
 * Smart Redirect Handler untuk rute /staff
 * Mengarahkan staf secara otomatis:
 * - Jika belum login -> /staff/login
 * - Jika sudah login sebagai Admin -> /staff/admin/dashboard
 * - Jika sudah login sebagai Tutor -> /staff/tutor/dashboard
 */
export default function StaffIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const staff = getActiveStaff();

    if (!staff) {
      router.replace("/staff/login");
    } else if (staff.role === "ADMIN") {
      router.replace("/staff/admin/dashboard");
    } else {
      router.replace("/staff/tutor/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        <p className="text-xs font-medium text-text-muted">
          Mengarahkan ke portal staf...
        </p>
      </div>
    </div>
  );
}
