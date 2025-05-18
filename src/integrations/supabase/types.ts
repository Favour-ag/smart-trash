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
      areas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      collection_schedules: {
        Row: {
          area_id: string
          collection_day: string
          collection_time: string | null
          created_at: string
          id: string
          updated_at: string
          waste_type: string
        }
        Insert: {
          area_id: string
          collection_day: string
          collection_time?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          waste_type: string
        }
        Update: {
          area_id?: string
          collection_day?: string
          collection_time?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          waste_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_schedules_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          collection_date: string
          collector_notes: string | null
          completed_by: string | null
          created_at: string
          id: string
          schedule_id: string
          status: Database["public"]["Enums"]["collection_status"]
          updated_at: string
        }
        Insert: {
          collection_date: string
          collector_notes?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          schedule_id: string
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Update: {
          collection_date?: string
          collector_notes?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          schedule_id?: string
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "collection_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_response: string | null
          area_id: string | null
          created_at: string
          description: string
          feedback_type: string | null
          id: string
          status: Database["public"]["Enums"]["feedback_status"]
          subject: string
          updated_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          area_id?: string | null
          created_at?: string
          description: string
          feedback_type?: string | null
          id?: string
          status?: Database["public"]["Enums"]["feedback_status"]
          subject: string
          updated_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          area_id?: string | null
          created_at?: string
          description?: string
          feedback_type?: string | null
          id?: string
          status?: Database["public"]["Enums"]["feedback_status"]
          subject?: string
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_receipts: {
        Row: {
          created_at: string
          id: string
          receipt_url: string
          resident_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receipt_url: string
          resident_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receipt_url?: string
          resident_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "resident_info"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      resident_info: {
        Row: {
          created_at: string
          full_name: string
          house_number: string
          id: string
          payment_receipt_url: string | null
          payment_status: string | null
          street_address: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          house_number: string
          id?: string
          payment_receipt_url?: string | null
          payment_status?: string | null
          street_address: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          house_number?: string
          id?: string
          payment_receipt_url?: string | null
          payment_status?: string | null
          street_address?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_areas: {
        Row: {
          area_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          area_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          area_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_areas_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          collection_reminders: boolean
          created_at: string
          data_analytics: boolean
          email_notifications: boolean
          feedback_notifications: boolean
          high_contrast: boolean
          id: string
          language: string
          location_sharing: boolean
          news_updates: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_reminders?: boolean
          created_at?: string
          data_analytics?: boolean
          email_notifications?: boolean
          feedback_notifications?: boolean
          high_contrast?: boolean
          id?: string
          language?: string
          location_sharing?: boolean
          news_updates?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collection_reminders?: boolean
          created_at?: string
          data_analytics?: boolean
          email_notifications?: boolean
          feedback_notifications?: boolean
          high_contrast?: boolean
          id?: string
          language?: string
          location_sharing?: boolean
          news_updates?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      collection_status: "PENDING" | "COLLECTED" | "MISSED" | "CANCELLED"
      feedback_status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"
      user_role: "ADMIN" | "RESIDENT"
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
    Enums: {
      collection_status: ["PENDING", "COLLECTED", "MISSED", "CANCELLED"],
      feedback_status: ["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED"],
      user_role: ["ADMIN", "RESIDENT"],
    },
  },
} as const
