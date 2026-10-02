/**
 * Definisi TypeScript Types untuk Up Speaking Placement Test System
 */

// ==============================================================================
// 1. DATABASE ENTITIES (Sesuai Skema Supabase)
// ==============================================================================

export interface Setting {
  id: number;
  test_duration_minutes: number;
  updated_at: string;
}

export interface Level {
  id: number;
  name: string;
  min_score_percent: number;
  max_score_percent: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  question_text: string;
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

export type TestSessionStatus = 'in_progress' | 'completed' | 'expired';

export interface TestSession {
  id: string;
  student_name: string;
  whatsapp_number: string;
  start_time: string;
  end_time: string;
  status: TestSessionStatus;
  total_questions: number;
  correct_answers: number;
  final_score_percent: number | null;
  assigned_level_id: number | null;
  can_retest: boolean;
  created_at: string;
  completed_at: string | null;
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
  options: SanitizedOption[];
}

export interface SessionInfo {
  id: string;
  student_name: string;
  whatsapp_number: string;
  start_time: string;
  end_time: string;
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
      code: 'INVALID_INPUT' | 'SESSION_BLOCKED' | 'SERVER_ERROR';
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

export type SubmitExamResult =
  | {
      success: true;
      result: {
        sessionId: string;
        studentName: string;
        whatsappNumber: string;
        totalQuestions: number;
        correctAnswers: number;
        finalScorePercent: number;
        level: {
          id: number;
          name: string;
          description: string | null;
        };
        completedAt: string;
      };
    }
  | {
      success: false;
      error: string;
    };
