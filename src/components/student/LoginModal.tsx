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
      // 1. Verifikasi data siswa via API
      const verifyRes = await fetch("/api/student/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmedName,
          phoneNumber: cleanPhone,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(
          verifyData.error ||
            "Data siswa tidak ditemukan. Pastikan nama lengkap dan nomor HP sesuai dengan pendaftaran di Up Speaking."
        );
        return;
      }

      // 2. Jika status tes sudah COMPLETED atau FINALIZED, arahkan ke /result
      if (verifyData.status === "FINALIZED" || verifyData.status === "COMPLETED") {
        const resultSession = {
          sessionId: verifyData.sessionId || `sess_${verifyData.studentId}`,
          studentId: verifyData.studentId,
          fullName: verifyData.fullName,
          phone: verifyData.phoneNumber,
          targetLevel: verifyData.targetLevel,
          status: verifyData.status,
          currentQuestionIndex: 0,
          totalQuestions: 10,
          answers: {},
          elapsedSeconds: 0,
          deviceToken: "readonly",
          startedAt: new Date().toISOString(),
        };
        saveSession(resultSession);
        onClose();
        router.push("/result");
        return;
      }

      // 3. Status NOT_STARTED, RESET, atau IN_PROGRESS -> Mulai / lanjutkan tes
      let deviceToken = localStorage.getItem("up_speaking_device_token");
      if (!deviceToken) {
        deviceToken =
          "dev_" +
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 10));
        localStorage.setItem("up_speaking_device_token", deviceToken);
      }

      const startRes = await fetch("/api/student/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: verifyData.studentId,
          deviceToken,
        }),
      });

      const startData = await startRes.json();

      if (!startRes.ok) {
        setError(
          startData.error ||
            "Gagal menyiapkan lembar ujian. Silakan coba lagi atau hubungi admin."
        );
        return;
      }

      // Ekstrak jawaban yang mungkin sudah tersimpan sebelumnya (jika melanjutkan sesi)
      const existingAnswers: Record<string, string> = {};
      const questionsList = startData.session?.questions || [];
      questionsList.forEach((q: { id: string; selectedOptionId?: string | null }) => {
        if (q.selectedOptionId) {
          existingAnswers[q.id] = q.selectedOptionId;
        }
      });

      const studentSession = {
        sessionId: startData.session.id,
        studentId: verifyData.studentId,
        fullName: verifyData.fullName,
        phone: verifyData.phoneNumber,
        targetLevel: verifyData.targetLevel,
        status: "IN_PROGRESS" as const,
        currentQuestionIndex: 0,
        totalQuestions: questionsList.length,
        answers: existingAnswers,
        elapsedSeconds: startData.session.elapsedSeconds || 0,
        deviceToken,
        startedAt: startData.session.startedAt,
        questions: questionsList,
      };

      saveSession(studentSession);
      onClose();
      router.push("/test");
    } catch {
      setError(
        "Ada kendala saat memeriksa datamu. Coba lagi ya, atau hubungi admin Up Speaking."
      );
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
      title="Masuk ke Placement Test"
      description="Masukkan nama dan nomor HP yang terdaftar untuk memulai placement test."
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
