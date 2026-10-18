import { TargetLevel } from "@/types/student";

/**
 * Tipe data akun tutor untuk UI manajemen staf.
 */
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
