import { createClient } from '@supabase/supabase-js';

// Проверяем наличие необходимых переменных окружения
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Создаем клиент с правами администратора для всех операций
export const supabase = createClient(
  supabaseUrl || 'https://axgtvvcimqoyxbfvdrok.supabase.co', 
  supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Типы для таблиц базы данных
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          username: string;
          email: string;
          password_hash: string;
          role: string;
          status: string;
          department_id: number | null;
          secondary_department_id: number | null;
          rank: string | null;
          division: string | null;
          qualifications: string[];
          game_warnings: number;
          admin_warnings: number;
          auth_id: string | null;
          api_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          username: string;
          email: string;
          password_hash: string;
          role: string;
          status: string;
          department_id?: number | null;
          secondary_department_id?: number | null;
          rank?: string | null;
          division?: string | null;
          qualifications?: string[];
          game_warnings?: number;
          admin_warnings?: number;
          auth_id?: string | null;
          api_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          username?: string;
          email?: string;
          password_hash?: string;
          role?: string;
          status?: string;
          department_id?: number | null;
          secondary_department_id?: number | null;
          rank?: string | null;
          division?: string | null;
          qualifications?: string[];
          game_warnings?: number;
          admin_warnings?: number;
          auth_id?: string | null;
          api_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: number;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
        };
      };
      characters: {
        Row: {
          id: number;
          owner_id: number;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: string;
          nationality: string;
          phone_number: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          owner_id: number;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: string;
          nationality: string;
          phone_number?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          owner_id?: number;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          gender?: string;
          nationality?: string;
          phone_number?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: number;
          user_id: number;
          type: string;
          status: string;
          data: any;
          reviewer_id: number | null;
          review_comment: string | null;
          character_id: number | null;
          status_history: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          type: string;
          status?: string;
          data: any;
          reviewer_id?: number | null;
          review_comment?: string | null;
          character_id?: number | null;
          status_history?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          type?: string;
          status?: string;
          data?: any;
          reviewer_id?: number | null;
          review_comment?: string | null;
          character_id?: number | null;
          status_history?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: number;
          user_id: number;
          status: string;
          file_url: string;
          supervisor_comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          status?: string;
          file_url: string;
          supervisor_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          status?: string;
          file_url?: string;
          supervisor_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: number;
          user_id: number;
          status: string;
          messages: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          status?: string;
          messages?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          status?: string;
          messages?: any[];
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: number;
          user_id: number;
          message: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          message: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          message?: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      complaints: {
        Row: {
          id: number;
          author_id: number;
          subject: string;
          content: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          author_id: number;
          subject: string;
          content: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          author_id?: number;
          subject?: string;
          content?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tests: {
        Row: {
          id: number;
          title: string;
          description: string;
          questions: any[];
          time_limit: number;
          passing_score: number;
          department_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          questions: any[];
          time_limit: number;
          passing_score: number;
          department_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          questions?: any[];
          time_limit?: number;
          passing_score?: number;
          department_id?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      test_sessions: {
        Row: {
          id: number;
          user_id: number;
          test_id: number;
          status: string;
          start_time: string;
          end_time: string | null;
          answers: any[];
          score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          test_id: number;
          status?: string;
          start_time: string;
          end_time?: string | null;
          answers?: any[];
          score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          test_id?: number;
          status?: string;
          start_time?: string;
          end_time?: string | null;
          answers?: any[];
          score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      test_results: {
        Row: {
          id: number;
          user_id: number;
          test_id: number;
          session_id: number;
          score: number;
          passed: boolean;
          completed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          test_id: number;
          session_id: number;
          score: number;
          passed: boolean;
          completed_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          test_id?: number;
          session_id?: number;
          score?: number;
          passed?: boolean;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']; 