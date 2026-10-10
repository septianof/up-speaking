import { StudentSession } from "@/types/student";

const SESSION_STORAGE_KEY = "up_speaking_student_session";

export function getActiveSession(): StudentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: StudentSession = JSON.parse(raw);
    return session;
  } catch (error) {
    console.error("Gagal membaca session dari localStorage:", error);
    return null;
  }
}

export function saveSession(session: StudentSession): void {
  if (typeof window === "undefined") return null as unknown as void;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Gagal menyimpan session ke localStorage:", error);
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error("Gagal menghapus session dari localStorage:", error);
  }
}
