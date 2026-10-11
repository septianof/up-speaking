"use client";

import React from "react";
import { getActiveStaff } from "@/lib/staff-session";
import { Badge } from "@/components/ui";

export default function AdminDashboardPage() {
  const staff = getActiveStaff();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Dashboard Admin
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Selamat datang, {staff?.fullName || "Administrator"}
          </p>
        </div>
        <div>
          <Badge variant="primary" size="md">
            Role: Admin Pusat
          </Badge>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-surface-white border border-surface-border shadow-card text-center">
        <p className="text-sm font-semibold text-text-primary mb-1">
          Kerangka Dashboard Staf (CMP-005) Siap
        </p>
        <p className="text-xs text-text-muted">
          Sidebar navigasi responsif dan proteksi login staf telah terhubung. Komponen metrik dan Quick Actions akan diimplementasikan pada TASK-007.
        </p>
      </div>
    </div>
  );
}
