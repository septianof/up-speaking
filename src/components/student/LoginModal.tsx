"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button } from "@/components/ui";
import { Mascot } from "@/components/student/Mascot";
import { saveSession } from "@/lib/session";
import { AlertCircle, User, Phone } from "lucide-react";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full h-14 pl-12 pr-4 rounded-2xl bg-sky-soft border-2 border-primary-100 text-text-primary text-base font-semibold transition-all focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 placeholder:text-text-disabled placeholder:font-normal";

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
      setError("Ups, namamu belum diisi ya 😊");
      return;
    }

    if (trimmedName.length < 3) {
      setError("Namamu terlalu pendek. Tulis nama lengkapmu ya (minimal 3 huruf).");
      return;
    }

    if (!cleanPhone) {
      setError("Nomor HP-nya belum diisi nih. Isi dulu ya 📱");
      return;
    }

    // Phone number format validation (standard Indonesian mobile format: 08xxx with 10-14 digits)
    if (!/^08\d{8,12}$/.test(cleanPhone)) {
      setError("Nomor HP belum pas. Pakai angka diawali 08, contoh: 081234567890.");
      return;
    }

    setIsLoading(true);

    try {
      // Simulasi network delay singkat (akan diganti fetch API di Phase 5)
      await new Promise((resolve) => setTimeout(resolve, 700));

      // ──── 1. Cari siswa di database lokal berdasarkan nomor HP ────
      const { getMockStudents } = await import("@/lib/mock-data");
      const students = getMockStudents();

      // Cocokkan berdasarkan nomor HP (normalisasi: strip spasi/strip)
      const found = students.find((s) => s.phone.replace(/[-\s]/g, "") === cleanPhone);

      // ──── 2. Nomor belum terdaftar ────
      if (!found) {
        setError(
          "Nomor HP ini belum terdaftar dalam sistem. Pastikan nomor yang kamu masukkan sudah benar, atau hubungi Up Speaking untuk mendaftarkan dirimu."
        );
        return;
      }

      // ──── 3. Nama tidak cocok (case-insensitive) ────
      const nameMatch = found.fullName.trim().toLowerCase() === trimmedName.toLowerCase();
      if (!nameMatch) {
        setError(
          "Nama yang kamu masukkan tidak sesuai dengan data yang terdaftar. Pastikan nama lengkapmu sudah benar."
        );
        return;
      }

      // ──── 4. Status FINALIZED atau COMPLETED → langsung ke halaman result ────
      if (found.status === "FINALIZED" || found.status === "COMPLETED") {
        // Bangun sesi dari data StudentRecord agar result page bisa membacanya
        const resultSession = {
          sessionId: `sess_${found.id}`,
          studentId: found.id,
          fullName: found.fullName,
          phone: found.phone,
          targetLevel: found.targetLevel,
          status: found.status,
          currentQuestionIndex: 0,
          totalQuestions: found.totalQuestions ?? 10,
          answers: {},
          elapsedSeconds: found.elapsedSeconds ?? 0,
          deviceToken: "readonly",
          startedAt: found.startedAt ?? new Date().toISOString(),
          completedAt: found.completedAt,
          finalLevel: found.finalLevel,
        };
        saveSession(resultSession);
        onClose();
        router.push("/result");
        return;
      }

      // ──── 5. Status NOT_STARTED / RESET → buat sesi baru lalu tes ────
      if (found.status === "NOT_STARTED" || found.status === "RESET") {
        const newSession = {
          sessionId: `sess_${found.id}_${Date.now()}`,
          studentId: found.id,
          fullName: found.fullName,
          phone: found.phone,
          targetLevel: found.targetLevel,
          status: "IN_PROGRESS" as const,
          currentQuestionIndex: 0,
          totalQuestions: 10,
          answers: {} as Record<string, string>,
          elapsedSeconds: 0,
          deviceToken: "dev_" + Math.random().toString(36).substring(2, 9),
          startedAt: new Date().toISOString(),
        };

        // Perbarui status siswa di database lokal menjadi IN_PROGRESS
        const { getMockStudents: getStudents, saveMockStudents } = await import("@/lib/mock-data");
        const all = getStudents();
        const updated = all.map((s) =>
          s.id === found.id
            ? { ...s, status: "IN_PROGRESS" as const, startedAt: newSession.startedAt }
            : s
        );
        saveMockStudents(updated);

        saveSession(newSession);
        onClose();
        router.push("/test");
        return;
      }

      // ──── 6. Status IN_PROGRESS → lanjutkan sesi yang ada ────
      const resumeSession = {
        sessionId: `sess_${found.id}`,
        studentId: found.id,
        fullName: found.fullName,
        phone: found.phone,
        targetLevel: found.targetLevel,
        status: "IN_PROGRESS" as const,
        currentQuestionIndex: 0,
        totalQuestions: found.totalQuestions ?? 10,
        answers: {} as Record<string, string>,
        elapsedSeconds: found.elapsedSeconds ?? 0,
        deviceToken: "dev_" + Math.random().toString(36).substring(2, 9),
        startedAt: found.startedAt ?? new Date().toISOString(),
      };
      saveSession(resumeSession);
      onClose();
      router.push("/test");
    } catch {
      setError("Ada kendala saat memeriksa datamu. Coba lagi ya, atau hubungi admin Up Speaking.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters, spaces, and single quote (e.g. Syafi'i)
    const sanitized = e.target.value.replace(/[^a-zA-Z\s']/g, "");
    setFullName(sanitized);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits (0-9)
    const digitsOnly = e.target.value.replace(/\D/g, "");
    // Max 14 digits
    if (digitsOnly.length <= 14) {
      setPhone(digitsOnly);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="kid"
      topSlot={<Mascot mood="wave" size={110} />}
      title="Masuk ke Tes Penempatan"
      description="Masukkan nama dan nomor HP yang terdaftar untuk memulai tes penempatan."
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-sun-50 border-2 border-sun-300 text-sun-600 text-sm font-bold"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-text-secondary">{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="student-name" className="block text-base font-bold text-text-primary mb-2">
            Nama lengkapmu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-500">
              <User className="h-5 w-5" />
            </div>
            <input
              id="student-name"
              type="text"
              disabled={isLoading}
              value={fullName}
              onChange={handleNameChange}
              placeholder="Contoh: Budi Pratama"
              autoComplete="name"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="student-phone" className="block text-base font-bold text-text-primary mb-2">
            Nomor HP / WhatsApp
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-500">
              <Phone className="h-5 w-5" />
            </div>
            <input
              id="student-phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              disabled={isLoading}
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Contoh: 081234567890"
              autoComplete="tel"
              className={inputClass}
            />
          </div>
          <p className="mt-2 text-sm text-text-muted">Pakai angka saja ya, tanpa spasi atau tanda strip.</p>
        </div>

        <div className="pt-1">
          <Button type="submit" variant="kid" size="xl" isLoading={isLoading} className="w-full">
            Ayo Mulai Tes!
          </Button>
        </div>
      </form>
    </Modal>
  );
};
