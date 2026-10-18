import { TargetLevel, SessionStatus, FinalLevel } from "@/types/student";

/**
 * Tipe data representasi siswa untuk UI komponen staf (Admin & Tutor).
 */
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
  answers?: Record<string, string>;
  elapsedSeconds?: number;
  finalLevel?: FinalLevel;
  notes?: string;
  resetCount?: number;
  lastResetAt?: string;
  resetReason?: string;
  sessionId?: string;
}
