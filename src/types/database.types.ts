export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      placement_evaluations: {
        Row: {
          assigned_level: string
          finalized_at: string
          id: string
          session_id: string
          tutor_id: string
          tutor_notes: string | null
        }
        Insert: {
          assigned_level: string
          finalized_at?: string
          id?: string
          session_id: string
          tutor_id: string
          tutor_notes?: string | null
        }
        Update: {
          assigned_level?: string
          finalized_at?: string
          id?: string
          session_id?: string
          tutor_id?: string
          tutor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placement_evaluations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_evaluations_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          id: string
          is_correct: boolean
          option_text: string
          question_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_correct?: boolean
          option_text: string
          question_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_correct?: boolean
          option_text?: string
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          question_text: string
          target_level: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          question_text: string
          target_level: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          question_text?: string
          target_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone_number: string
          target_level: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          phone_number: string
          target_level: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone_number?: string
          target_level?: string
        }
        Relationships: []
      }
      test_responses: {
        Row: {
          display_order: number
          id: string
          question_id: string
          selected_option_id: string | null
          session_id: string
          synced_at: string
        }
        Insert: {
          display_order: number
          id?: string
          question_id: string
          selected_option_id?: string | null
          session_id: string
          synced_at?: string
        }
        Update: {
          display_order?: number
          id?: string
          question_id?: string
          selected_option_id?: string | null
          session_id?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_responses_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sessions: {
        Row: {
          created_at: string
          device_token: string
          elapsed_seconds: number
          id: string
          score_percentage: number
          started_at: string
          status: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          created_at?: string
          device_token: string
          elapsed_seconds?: number
          id?: string
          score_percentage?: number
          started_at?: string
          status?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          created_at?: string
          device_token?: string
          elapsed_seconds?: number
          id?: string
          score_percentage?: number
          started_at?: string
          status?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// Convenience type aliases for application code
export type Student = Database['public']['Tables']['students']['Row']
export type StudentInsert = Database['public']['Tables']['students']['Insert']
export type TestSession = Database['public']['Tables']['test_sessions']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type QuestionOption = Database['public']['Tables']['question_options']['Row']
export type TestResponse = Database['public']['Tables']['test_responses']['Row']
export type PlacementEvaluation = Database['public']['Tables']['placement_evaluations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
