import { TargetLevel, SessionStatus, FinalLevel } from "@/types/student";

export interface StudentRecord {
  id: string;
  fullName: string;
  phone: string;
  targetLevel: TargetLevel;
  status: SessionStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  score?: number;
  totalQuestions?: number;
  elapsedSeconds?: number;
  finalLevel?: FinalLevel;
  notes?: string;
  resetCount?: number;
  lastResetAt?: string;
  resetReason?: string;
}

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "std-001",
    fullName: "Ahmad Dahlan",
    phone: "081234567890",
    targetLevel: "ELEMENTARY",
    status: "IN_PROGRESS",
    createdAt: "2026-10-11T08:15:00Z",
    startedAt: "2026-10-11T08:20:00Z",
    score: 0,
    totalQuestions: 10,
  },
  {
    id: "std-002",
    fullName: "Siti Rahmawati",
    phone: "085712345678",
    targetLevel: "HIGH_SCHOOL",
    status: "COMPLETED",
    createdAt: "2026-10-11T07:30:00Z",
    startedAt: "2026-10-11T07:35:00Z",
    completedAt: "2026-10-11T07:55:00Z",
    score: 8,
    totalQuestions: 10,
    finalLevel: "INTERMEDIATE",
    notes: "Kemampuan grammar sangat baik, perlu pendalaman pada passive voice.",
  },
  {
    id: "std-003",
    fullName: "Budi Santoso",
    phone: "081398765432",
    targetLevel: "ELEMENTARY",
    status: "NOT_STARTED",
    createdAt: "2026-10-11T09:00:00Z",
    totalQuestions: 10,
  },
  {
    id: "std-004",
    fullName: "Nadia Putri",
    phone: "087811223344",
    targetLevel: "HIGH_SCHOOL",
    status: "COMPLETED",
    createdAt: "2026-10-10T14:10:00Z",
    startedAt: "2026-10-10T14:15:00Z",
    completedAt: "2026-10-10T14:40:00Z",
    score: 10,
    totalQuestions: 10,
    finalLevel: "ADVANCED",
    notes: "Penguasaan kosa kata dan struktur kalimat mendekati penutur asli.",
  },
  {
    id: "std-005",
    fullName: "Fajar Pratama",
    phone: "082155667788",
    targetLevel: "ELEMENTARY",
    status: "RESET",
    createdAt: "2026-10-10T11:00:00Z",
    startedAt: "2026-10-10T11:05:00Z",
    totalQuestions: 10,
    resetCount: 1,
    lastResetAt: "2026-10-10T11:20:00Z",
    resetReason: "Koneksi terputus dan ganti ponsel",
  },
  {
    id: "std-006",
    fullName: "Citra Lestari",
    phone: "085299887766",
    targetLevel: "HIGH_SCHOOL",
    status: "NOT_STARTED",
    createdAt: "2026-10-11T09:15:00Z",
    totalQuestions: 10,
  },
];

const STORAGE_KEY = "up_speaking_mock_students";

export function getMockStudents(): StudentRecord[] {
  if (typeof window === "undefined") return INITIAL_STUDENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function saveMockStudents(students: StudentRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch {
    // ignore
  }
}

export function addMockStudent(newStudent: {
  fullName: string;
  phone: string;
  targetLevel: TargetLevel;
}): StudentRecord {
  const current = getMockStudents();
  const student: StudentRecord = {
    id: `std-${Date.now().toString().slice(-4)}`,
    fullName: newStudent.fullName.trim(),
    phone: newStudent.phone.trim(),
    targetLevel: newStudent.targetLevel,
    status: "NOT_STARTED",
    createdAt: new Date().toISOString(),
    totalQuestions: 10,
  };
  const updated = [student, ...current];
  saveMockStudents(updated);
  return student;
}

export function resetMockStudentSession(
  studentId: string,
  reason: string
): StudentRecord | null {
  const current = getMockStudents();
  let updatedRecord: StudentRecord | null = null;

  const updated = current.map((std) => {
    if (std.id === studentId) {
      const resetCount = (std.resetCount || 0) + 1;
      updatedRecord = {
        ...std,
        status: "NOT_STARTED", // Terbitkan status sesi baru NOT_STARTED sesuai PRD FR-010
        resetCount,
        lastResetAt: new Date().toISOString(),
        resetReason: reason || "Permintaan Admin",
        startedAt: undefined,
        completedAt: undefined,
        score: undefined,
        finalLevel: undefined,
      };
      return updatedRecord;
    }
    return std;
  });

  saveMockStudents(updated);
  return updatedRecord;
}

export function finalizeMockStudentEvaluation(
  studentId: string,
  evaluation: {
    finalLevel: FinalLevel;
    notes?: string;
  }
): StudentRecord | null {
  const current = getMockStudents();
  let updatedRecord: StudentRecord | null = null;

  const updated = current.map((std) => {
    if (std.id === studentId) {
      updatedRecord = {
        ...std,
        status: "FINALIZED",
        finalLevel: evaluation.finalLevel,
        notes: evaluation.notes ? evaluation.notes.trim() : undefined,
      };
      return updatedRecord;
    }
    return std;
  });

  saveMockStudents(updated);
  return updatedRecord;
}

export function updateMockStudent(
  studentId: string,
  updatedData: {
    fullName: string;
    phone: string;
    targetLevel: TargetLevel;
  }
): StudentRecord | null {
  const current = getMockStudents();
  let updatedRecord: StudentRecord | null = null;

  const updated = current.map((std) => {
    if (std.id === studentId) {
      updatedRecord = {
        ...std,
        fullName: updatedData.fullName.trim(),
        phone: updatedData.phone.trim(),
        targetLevel: updatedData.targetLevel,
      };
      return updatedRecord;
    }
    return std;
  });

  saveMockStudents(updated);
  return updatedRecord;
}

export function deleteMockStudent(studentId: string): void {
  const current = getMockStudents();
  const updated = current.filter((std) => std.id !== studentId);
  saveMockStudents(updated);
}

