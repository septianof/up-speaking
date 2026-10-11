"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button } from "@/components/ui";
import { Mascot } from "@/components/student/Mascot";
import { saveSession } from "@/lib/session";
import { StudentSession } from "@/types/student";
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
      setError("Ada kendala saat memeriksa datamu. Coba lagi ya, atau tanya Kak Tutor.");
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
      title="Halo! Siapa namamu?"
      description="Isi nama dan nomor HP yang didaftarkan di Up Speaking, lalu kita mulai!"
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
