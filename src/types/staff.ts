export type StaffRole = "ADMIN" | "TUTOR";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  targetLevel?: "ELEMENTARY" | "HIGH_SCHOOL"; // Khusus peran TUTOR
}
