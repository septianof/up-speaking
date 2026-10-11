"use client";

import React from "react";
import { getActiveStaff } from "@/lib/staff-session";
import { Badge } from "@/components/ui";

export default function TutorDashboardPage() {
  const staff = getActiveStaff();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Dashboard Tutor
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Selamat datang, {staff?.fullName || "Tutor Up Speaking"}
          </p>
        </div>
        <div>
          <Badge variant="success" size="md">
            Jenjang: {staff?.targetLevel === "HIGH_SCHOOL" ? "High School (SMA)" : "Elementary (SD)"}
          </Badge>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-surface-white border border-surface-border shadow-card text-center">
        <p className="text-sm font-semibold text-text-primary mb-1">
          Kerangka Dashboard Tutor (CMP-005) Siap
        </p>
        <p className="text-xs text-text-muted">
          Sidebar navigasi responsif khusus tutor telah terhubung. Komponen evaluasi siswa dan penilaian level akan diimplementasikan pada TASK-009.
        </p>
      </div>
    </div>
  );
}
