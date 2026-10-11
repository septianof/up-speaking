import { StaffUser } from "@/types/staff";

const STAFF_STORAGE_KEY = "up_speaking_staff_user";

export function getActiveStaff(): StaffUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Gagal membaca staff session:", error);
    return null;
  }
}

export function saveStaffSession(user: StaffUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Gagal menyimpan staff session:", error);
  }
}

export function clearStaffSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STAFF_STORAGE_KEY);
  } catch (error) {
    console.error("Gagal menghapus staff session:", error);
  }
}
