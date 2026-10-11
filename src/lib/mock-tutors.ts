import { TargetLevel } from "@/types/student";

export interface TutorAccount {
  id: string;
  fullName: string;
  email: string;
  targetLevel: TargetLevel;
  isActive: boolean;
  createdAt: string;
}

export const INITIAL_TUTORS: TutorAccount[] = [
  {
    id: "tut-001",
    fullName: "Dewi Sartika, S.Pd.",
    email: "dewi.elementary@upspeaking.com",
    targetLevel: "ELEMENTARY",
    isActive: true,
    createdAt: "2026-10-01T08:00:00Z",
  },
  {
    id: "tut-002",
    fullName: "Rian Hidayat, M.Hum.",
    email: "rian.highschool@upspeaking.com",
    targetLevel: "HIGH_SCHOOL",
    isActive: true,
    createdAt: "2026-10-02T09:30:00Z",
  },
  {
    id: "tut-003",
    fullName: "Anisa Permata, S.Li.",
    email: "anisa.tutor@upspeaking.com",
    targetLevel: "ELEMENTARY",
    isActive: true,
    createdAt: "2026-10-05T10:15:00Z",
  },
];

const TUTOR_STORAGE_KEY = "up_speaking_mock_tutors";

export function getMockTutors(): TutorAccount[] {
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
  const current = getMockTutors();
  const tutor: TutorAccount = {
    id: `tut-${Date.now().toString().slice(-4)}`,
    fullName: newTutor.fullName.trim(),
    email: newTutor.email.trim().toLowerCase(),
    targetLevel: newTutor.targetLevel,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  const updated = [tutor, ...current];
  saveMockTutors(updated);
  return tutor;
}

export function toggleMockTutorStatus(tutorId: string): TutorAccount | null {
  const current = getMockTutors();
  let updatedRecord: TutorAccount | null = null;

  const updated = current.map((t) => {
    if (t.id === tutorId) {
      updatedRecord = { ...t, isActive: !t.isActive };
      return updatedRecord;
    }
    return t;
  });

  saveMockTutors(updated);
  return updatedRecord;
}
