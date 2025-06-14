export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ab_test_assignments: {
        Row: {
          assigned_at: string
          id: string
          session_id: string | null
          test_id: string | null
          variant_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          session_id?: string | null
          test_id?: string | null
          variant_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          session_id?: string | null
          test_id?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          target_pages: string[] | null
          traffic_split: Json
          updated_at: string
          variants: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          target_pages?: string[] | null
          traffic_split: Json
          updated_at?: string
          variants: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          target_pages?: string[] | null
          traffic_split?: Json
          updated_at?: string
          variants?: Json
        }
        Relationships: []
      }
      conversion_events: {
        Row: {
          ab_test_id: string | null
          event_data: Json | null
          goal_id: string | null
          id: string
          occurred_at: string
          session_id: string | null
          variant_id: string | null
        }
        Insert: {
          ab_test_id?: string | null
          event_data?: Json | null
          goal_id?: string | null
          id?: string
          occurred_at?: string
          session_id?: string | null
          variant_id?: string | null
        }
        Update: {
          ab_test_id?: string | null
          event_data?: Json | null
          goal_id?: string | null
          id?: string
          occurred_at?: string
          session_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversion_events_ab_test_id_fkey"
            columns: ["ab_test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "conversion_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_goals: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          goal_type: string
          id: string
          name: string
          target_selector: string | null
          target_value: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          goal_type: string
          id?: string
          name: string
          target_selector?: string | null
          target_value?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          goal_type?: string
          id?: string
          name?: string
          target_selector?: string | null
          target_value?: Json | null
        }
        Relationships: []
      }
      heatmap_data: {
        Row: {
          coordinates: Json
          count: number
          created_at: string
          element_selector: string | null
          id: string
          interaction_type: string
          last_updated: string
          page_url: string
        }
        Insert: {
          coordinates: Json
          count?: number
          created_at?: string
          element_selector?: string | null
          id?: string
          interaction_type: string
          last_updated?: string
          page_url: string
        }
        Update: {
          coordinates?: Json
          count?: number
          created_at?: string
          element_selector?: string | null
          id?: string
          interaction_type?: string
          last_updated?: string
          page_url?: string
        }
        Relationships: []
      }
      live_interactions: {
        Row: {
          coordinates: Json | null
          created_at: string
          data: Json | null
          element_content: string | null
          element_selector: string | null
          id: string
          interaction_type: string
          session_id: string | null
          timestamp_offset: number
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          data?: Json | null
          element_content?: string | null
          element_selector?: string | null
          id?: string
          interaction_type: string
          session_id?: string | null
          timestamp_offset: number
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          data?: Json | null
          element_content?: string | null
          element_selector?: string | null
          id?: string
          interaction_type?: string
          session_id?: string | null
          timestamp_offset?: number
        }
        Relationships: [
          {
            foreignKeyName: "live_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          ended_at: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          page_url: string
          session_token: string
          started_at: string
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          page_url: string
          session_token: string
          started_at?: string
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          page_url?: string
          session_token?: string
          started_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      main_pages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_flows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          flow_config: Json
          id: string
          name: string
          start_page_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          flow_config?: Json
          id?: string
          name: string
          start_page_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          flow_config?: Json
          id?: string
          name?: string
          start_page_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      session_data: {
        Row: {
          created_at: string | null
          form_data: Json | null
          id: string
          ip_address: string | null
          location: string | null
          session_id: string | null
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          form_data?: Json | null
          id?: string
          ip_address?: string | null
          location?: string | null
          session_id?: string | null
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          form_data?: Json | null
          id?: string
          ip_address?: string | null
          location?: string | null
          session_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_data_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_recordings: {
        Row: {
          created_at: string
          data: Json
          file_path: string | null
          id: string
          recording_type: string
          session_id: string | null
          timestamp_offset: number
        }
        Insert: {
          created_at?: string
          data: Json
          file_path?: string | null
          id?: string
          recording_type: string
          session_id?: string | null
          timestamp_offset: number
        }
        Update: {
          created_at?: string
          data?: Json
          file_path?: string | null
          id?: string
          recording_type?: string
          session_id?: string | null
          timestamp_offset?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          active: boolean | null
          created_at: string | null
          current_sub_page_id: string
          has_new_data: boolean | null
          id: string
          main_page_id: string
          page_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          current_sub_page_id: string
          has_new_data?: boolean | null
          id: string
          main_page_id: string
          page_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          current_sub_page_id?: string
          has_new_data?: boolean | null
          id?: string
          main_page_id?: string
          page_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      static_form_submissions: {
        Row: {
          form_id: string | null
          id: string
          ip_address: string | null
          submission_data: Json
          submitted_at: string
          user_agent: string | null
        }
        Insert: {
          form_id?: string | null
          id?: string
          ip_address?: string | null
          submission_data?: Json
          submitted_at?: string
          user_agent?: string | null
        }
        Update: {
          form_id?: string | null
          id?: string
          ip_address?: string | null
          submission_data?: Json
          submitted_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "static_form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "static_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      static_forms: {
        Row: {
          created_at: string
          created_by: string | null
          css: string | null
          description: string | null
          fields: Json
          html: string | null
          id: string
          is_active: boolean
          javascript: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          css?: string | null
          description?: string | null
          fields?: Json
          html?: string | null
          id?: string
          is_active?: boolean
          javascript?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          css?: string | null
          description?: string | null
          fields?: Json
          html?: string | null
          id?: string
          is_active?: boolean
          javascript?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_pages: {
        Row: {
          created_at: string | null
          css: string | null
          description: string | null
          fields: string[] | null
          html: string | null
          id: string
          javascript: string | null
          main_page_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          css?: string | null
          description?: string | null
          fields?: string[] | null
          html?: string | null
          id: string
          javascript?: string | null
          main_page_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          css?: string | null
          description?: string | null
          fields?: string[] | null
          html?: string | null
          id?: string
          javascript?: string | null
          main_page_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_pages_main_page_id_fkey"
            columns: ["main_page_id"]
            isOneToOne: false
            referencedRelation: "main_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          element_selector: string | null
          form_id: string | null
          id: string
          interaction_data: Json | null
          interaction_type: string
          ip_address: string | null
          page_url: string | null
          session_id: string | null
          timestamp: string
        }
        Insert: {
          element_selector?: string | null
          form_id?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          ip_address?: string | null
          page_url?: string | null
          session_id?: string | null
          timestamp?: string
        }
        Update: {
          element_selector?: string | null
          form_id?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          ip_address?: string | null
          page_url?: string | null
          session_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "static_forms"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
