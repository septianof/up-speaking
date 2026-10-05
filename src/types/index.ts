/**
 * Definisi TypeScript Types untuk Up Speaking Placement Test System
 */

// ==============================================================================
// 1. DATABASE ENTITIES (Sesuai Skema Supabase)
// ==============================================================================

export type EducationLevel = 'elementary' | 'high_school';
export type UserRole = 'admin' | 'tutor';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  education_level: EducationLevel | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: number;
  test_duration_minutes: number;
  tutor_elementary_name: string;
  tutor_elementary_whatsapp: string;
  tutor_highschool_name: string;
  tutor_highschool_whatsapp: string;
  updated_at: string;
}

export interface Level {
  id: number;
  name: string;
  min_score_percent: number;
  max_score_percent: number;
  max_duration_minutes: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  question_text: string;
  education_level: EducationLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

export type TestSessionStatus = 
  | 'registered' 
  | 'in_progress' 
  | 'submitted' 
  | 'graded' 
  | 'completed' 
  | 'expired';

export interface TestSession {
  id: string;
  student_name: string;
  whatsapp_number: string;
  education_level: EducationLevel;
  start_time: string;
  end_time: string;
  duration_minutes: number | null;
  status: TestSessionStatus;
  total_questions: number;
  correct_answers: number;
  final_score_percent: number | null;
  assigned_level_id: number | null;
  can_retest: boolean;
  reviewed_by?: string | null;
  created_at: string;
  completed_at: string | null;
  // Field join relasi opsional
  level?: Level | null;
  reviewer?: Profile | null;
}

export interface StudentAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option_id: string | null;
  created_at: string;
  updated_at: string;
}

// ==============================================================================
// 2. CLIENT-SAFE / SANITIZED TYPES (Untouchable Answer Key)
// Menjamin kunci jawaban ('is_correct') tidak pernah bocor ke browser siswa
// ==============================================================================

export interface SanitizedOption {
  id: string;
  question_id: string;
  option_text: string;
}

export interface SanitizedQuestion {
  id: string;
  question_text: string;
  education_level?: EducationLevel;
  options: SanitizedOption[];
}

export interface SessionInfo {
  id: string;
  student_name: string;
  whatsapp_number: string;
  education_level?: EducationLevel;
  start_time: string;
  end_time?: string | null;
  total_questions: number;
}

// ==============================================================================
// 3. SERVER ACTION RESPONSES
// ==============================================================================

export type StartSessionResult =
  | {
      success: true;
      isResumed: boolean;
      session: SessionInfo;
      questions: SanitizedQuestion[];
      savedAnswers?: Record<string, string>; // questionId -> selectedOptionId
    }
  | {
      success: false;
      error: string;
      code: 'INVALID_INPUT' | 'SESSION_BLOCKED' | 'SERVER_ERROR' | 'NOT_REGISTERED';
    };

export type SaveAnswerResult =
  | {
      success: true;
      questionId: string;
      selectedOptionId: string;
    }
  | {
      success: false;
      error: string;
    };

export interface TutorContact {
  name: string;
  whatsapp: string;
}

export interface ExamResultData {
  sessionId: string;
  studentName: string;
  whatsappNumber: string;
  educationLevel?: EducationLevel;
  status: TestSessionStatus;
  durationMinutes: number;
  totalQuestions: number;
  correctAnswers: number;
  finalScorePercent: number;
  level: {
    id: number;
    name: string;
    description: string | null;
  } | null;
  tutor?: TutorContact;
  completedAt: string;
}

export type SubmitExamResult =
  | {
      success: true;
      result: ExamResultData;
    }
  | {
      success: false;
      error: string;
    };

export type GetSessionResultResponse =
  | {
      success: true;
      result: ExamResultData;
    }
  | {
      success: false;
      error: string;
    };

export interface RegisteredStudentSession {
  id: string;
  studentName: string;
  whatsappNumber: string;
  educationLevel: EducationLevel;
  status: TestSessionStatus;
  createdAt: string;
}

export type RegisterStudentResult =
  | {
      success: true;
      session: RegisteredStudentSession;
    }
  | {
      success: false;
      error: string;
      code?: 'INVALID_INPUT' | 'SESSION_EXISTS' | 'PREVIOUSLY_COMPLETED' | 'SERVER_ERROR';
    };

export interface VerifyStudentAccessResult {
  success: boolean;
  error?: string;
  code?: 'NOT_REGISTERED' | 'SESSION_BLOCKED' | 'READY_TO_START' | 'IN_PROGRESS' | 'SERVER_ERROR' | 'INVALID_INPUT';
  session?: {
    id: string;
    studentName: string;
    whatsappNumber: string;
    educationLevel: EducationLevel;
    status: TestSessionStatus;
  };
}

export interface TutorQueueItem {
  id: string;
  studentName: string;
  whatsappNumber: string;
  educationLevel: EducationLevel;
  status: TestSessionStatus;
  durationMinutes: number | null;
  totalQuestions: number;
  correctAnswers: number;
  finalScorePercent: number;
  completedAt: string;
  assignedLevelId: number | null;
  levelName: string | null;
  reviewedBy: string | null;
  reviewerName: string | null;
}

export type GetTutorQueueResult =
  | {
      success: true;
      data: TutorQueueItem[];
    }
  | {
      success: false;
      error: string;
    };

export type GradeSessionResult =
  | {
      success: true;
      message: string;
      session: {
        id: string;
        studentName: string;
        educationLevel: EducationLevel;
        status: TestSessionStatus;
        levelId: number;
        levelName: string;
        reviewedBy: string;
      };
    }
  | {
      success: false;
      error: string;
    };

