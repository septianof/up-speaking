export type TargetLevel = "ELEMENTARY" | "HIGH_SCHOOL";

export type SessionStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "FINALIZED" | "RESET";

export type FinalLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface QuestionOption {
  id: string;
  optionText: string;
}

export interface QuestionItem {
  id: string;
  questionText: string;
  targetLevel: TargetLevel;
  options: QuestionOption[];
  correctOptionId?: string;
  displayOrder?: number;
}

export interface StudentSession {
  sessionId: string;
  studentId: string;
  fullName: string;
  phone: string;
  targetLevel: TargetLevel;
  status: SessionStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: Record<string, string>; // questionId -> optionId
  elapsedSeconds: number;
  deviceToken: string;
  startedAt: string;
  completedAt?: string;
  finalLevel?: FinalLevel;
  notes?: string;
  scorePercentage?: number;
  questions?: QuestionItem[];
}
