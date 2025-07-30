import { createClient } from '@supabase/supabase-js';

// Проверяем наличие необходимых переменных окружения
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Создаем клиент с правами администратора для всех операций
export const supabase = createClient(
  supabaseUrl || 'https://axgtvvcimqoyxbfvdrok.supabase.co', 
  supabaseServiceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU',
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
          department_id?: number;
          secondary_department_id?: number;
          rank?: string;
          division?: string;
          qualifications: string[];
          game_warnings: number;
          admin_warnings: number;
          auth_id?: string;
          api_token?: string;
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
          department_id?: number;
          secondary_department_id?: number;
          rank?: string;
          division?: string;
          qualifications?: string[];
          game_warnings?: number;
          admin_warnings?: number;
          auth_id?: string;
          api_token?: string;
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
          department_id?: number;
          secondary_department_id?: number;
          rank?: string;
          division?: string;
          qualifications?: string[];
          game_warnings?: number;
          admin_warnings?: number;
          auth_id?: string;
          api_token?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: number;
          name: string;
          description?: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
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
          phone_number?: string;
          address?: string;
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
          phone_number?: string;
          address?: string;
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
          phone_number?: string;
          address?: string;
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
          content: any;
          submitted_at: string;
          reviewed_at?: string;
          reviewed_by?: number;
          notes?: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          type: string;
          status?: string;
          content: any;
          submitted_at?: string;
          reviewed_at?: string;
          reviewed_by?: number;
          notes?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          type?: string;
          status?: string;
          content?: any;
          submitted_at?: string;
          reviewed_at?: string;
          reviewed_by?: number;
          notes?: string;
        };
      };
      reports: {
        Row: {
          id: number;
          user_id: number;
          title: string;
          content: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          title: string;
          content: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          title?: string;
          content?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: number;
          user_id: number;
          subject: string;
          message: string;
          status: string;
          priority: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          subject: string;
          message: string;
          status?: string;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          subject?: string;
          message?: string;
          status?: string;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Экспортируем типы для использования в других модулях
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']; 