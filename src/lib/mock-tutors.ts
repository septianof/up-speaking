import { TargetLevel } from "@/types/student";

export interface TutorAccount {
  id: string;
  fullName: string;
  email: string;
  targetLevel: TargetLevel;
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
}

export const INITIAL_TUTORS: TutorAccount[] = [
  {
    id: "tut-001",
    fullName: "Dewi Sartika, S.Pd.",
    email: "dewi.elementary@upspeaking.com",
    targetLevel: "ELEMENTARY",
    isActive: true,
    isDeleted: false,
    createdAt: "2026-10-01T08:00:00Z",
  },
  {
    id: "tut-002",
    fullName: "Rian Hidayat, M.Hum.",
    email: "rian.highschool@upspeaking.com",
    targetLevel: "HIGH_SCHOOL",
    isActive: true,
    isDeleted: false,
    createdAt: "2026-10-02T09:30:00Z",
  },
  {
    id: "tut-003",
    fullName: "Anisa Permata, S.Li.",
    email: "anisa.tutor@upspeaking.com",
    targetLevel: "ELEMENTARY",
    isActive: true,
    isDeleted: false,
    createdAt: "2026-10-05T10:15:00Z",
  },
];

const TUTOR_STORAGE_KEY = "up_speaking_mock_tutors";

export function getAllMockTutors(): TutorAccount[] {
  if (typeof window === "undefined") return INITIAL_TUTORS;
  try {
    const raw = localStorage.getItem(TUTOR_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(INITIAL_TUTORS));
      return INITIAL_TUTORS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TUTORS;
  }
}

export function getMockTutors(options?: { includeDeleted?: boolean }): TutorAccount[] {
  const all = getAllMockTutors();
  if (options?.includeDeleted) {
    return all;
  }
  return all.filter((t) => !t.isDeleted);
}

export function saveMockTutors(tutors: TutorAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(tutors));
  } catch {
    // ignore
  }
}

export function addMockTutor(newTutor: {
  fullName: string;
  email: string;
  targetLevel: TargetLevel;
}): TutorAccount {
  const current = getAllMockTutors();
  const tutor: TutorAccount = {
    id: `tut-${Date.now().toString().slice(-4)}`,
    fullName: newTutor.fullName.trim(),
    email: newTutor.email.trim().toLowerCase(),
    targetLevel: newTutor.targetLevel,
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [tutor, ...current];
  saveMockTutors(updated);
  return tutor;
}

export function updateMockTutor(
  tutorId: string,
  updatedData: {
    fullName: string;
    email: string;
    targetLevel: TargetLevel;
  }
): TutorAccount | null {
  const current = getAllMockTutors();
  let updatedRecord: TutorAccount | null = null;

  const updated = current.map((t) => {
    if (t.id === tutorId) {
      updatedRecord = {
        ...t,
        fullName: updatedData.fullName.trim(),
        email: updatedData.email.trim().toLowerCase(),
        targetLevel: updatedData.targetLevel,
      };
      return updatedRecord;
    }
    return t;
  });

  saveMockTutors(updated);
  return updatedRecord;
}

/**
 * Soft Delete Akun Tutor (FR-017 & Best Practice Keamanan Data)
 * Akun ditandai isDeleted: true dan isActive: false tanpa menghapus baris data
 * agar riwayat penilaian dan audit trail ujian siswa masa lalu tidak rusak.
 */
export function softDeleteMockTutor(tutorId: string): TutorAccount | null {
  const current = getAllMockTutors();
  let updatedRecord: TutorAccount | null = null;

  const updated = current.map((t) => {
    if (t.id === tutorId) {
      updatedRecord = {
        ...t,
        isActive: false,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      };
      return updatedRecord;
    }
    return t;
  });

  saveMockTutors(updated);
  return updatedRecord;
}

export const deleteMockTutor = softDeleteMockTutor;
