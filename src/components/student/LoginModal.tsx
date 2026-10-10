"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button } from "@/components/ui";
import { saveSession } from "@/lib/session";
import { StudentSession } from "@/types/student";
import { AlertCircle, User, Phone } from "lucide-react";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const cleanPhone = phone.trim().replace(/[-\s]/g, "");

    // Validation
    if (!trimmedName) {
      setError("Silakan masukkan nama lengkap Anda.");
      return;
    }

    if (trimmedName.length < 3) {
      setError("Nama lengkap minimal terdiri dari 3 karakter.");
      return;
    }

    if (!cleanPhone) {
      setError("Silakan masukkan nomor handphone/WhatsApp aktif.");
      return;
    }

    // Phone number format validation (standard Indonesian mobile format)
    if (!/^(^\+62|62|^08)(\d{8,12})$/.test(cleanPhone)) {
      setError("Nomor handphone tidak valid. Gunakan format seperti 0812xxxxxxxx atau +62812xxxxxxxx.");
      return;
    }

    setIsLoading(true);

    try {
      // Simulation / Mock Verification for Frontend Phase (will connect to /api/student/verify in Phase 5)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockSession: StudentSession = {
        sessionId: "sess_" + Date.now(),
        studentId: "std_" + Date.now(),
        fullName: trimmedName,
        phone: cleanPhone,
        targetLevel: "ELEMENTARY", // Mock default
        status: "IN_PROGRESS",
        currentQuestionIndex: 0,
        totalQuestions: 25,
        answers: {},
        elapsedSeconds: 0,
        deviceToken: "dev_" + Math.random().toString(36).substring(2, 9),
        startedAt: new Date().toISOString(),
      };

      saveSession(mockSession);
      onClose();
      router.push("/test");
    } catch {
      setError("Terjadi kendala saat memverifikasi data. Silakan coba kembali atau hubungi staf Up Speaking.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Masuk ke Lembar Tes"
      description="Masukkan Nama Lengkap dan Nomor Handphone yang telah didaftarkan oleh staf Up Speaking."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-btn bg-accent-50 border border-accent-200 text-accent-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-accent-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Nama Lengkap Siswa <span className="text-accent-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              disabled={isLoading}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Muhammad Budi Pratama"
              className="w-full h-11 pl-10 pr-3.5 rounded-btn bg-surface-white border border-surface-border text-text-primary text-sm transition-all focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100 placeholder:text-text-disabled"
            />
          </div>
          <p className="mt-1.5 text-xs text-text-muted">
            Ketik nama sesuai data pendaftaran kursus Anda.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Nomor Handphone / WhatsApp <span className="text-accent-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="tel"
              required
              disabled={isLoading}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full h-11 pl-10 pr-3.5 rounded-btn bg-surface-white border border-surface-border text-text-primary text-sm transition-all focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-100 placeholder:text-text-disabled"
            />
          </div>
          <p className="mt-1.5 text-xs text-text-muted">
            Nomor aktif siswa atau orang tua yang terdaftar.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Mulai Mengerjakan Tes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
