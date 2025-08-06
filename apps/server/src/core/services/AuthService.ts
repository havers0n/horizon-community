// apps/server/src/core/services/AuthService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js'; // Import createClient for admin operations
import { supabase } from '../lib/supabase';
import { AppError } from '../../utils/AppError';
import type { Database } from '@roleplay-identity/db-types';

// Создаем локальные типы-алиасы из глобального типа Database
type Profiles = Database['public']['Tables']['profiles']['Row'];
type ProfilesInsert = Database['public']['Tables']['profiles']['Insert'];

// --- ОТЛАДКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ---
const keyForDebug = process.env.SUPABASE_SERVICE_ROLE_KEY || 'КЛЮЧ НЕ НАЙДЕН!';
console.log('--- ОТЛАДКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ---');
console.log(`[DEBUG] Загруженный SUPABASE_URL: ${process.env.SUPABASE_URL}`);
console.log(`[DEBUG] Длина ключа: ${keyForDebug.length}`);
console.log(`[DEBUG] Ключ начинается с: ${keyForDebug.substring(0, 8)}...`);
console.log('------------------------------------');

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  // ✅ Используем готовый клиент для схемы 'public'
  private db = supabase;
  // ✅ We need a special, non-schema-typed admin client for user management.
  private supabaseAdmin: SupabaseClient;

  constructor() {
    console.log('[AuthService] Initializing AuthService...');
    console.log('[AuthService] SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('[AuthService] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    
    // This special client is for auth.admin operations that require the service_role_key
    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    console.log('[AuthService] AuthService initialized successfully');
  }

  // ===== USER REGISTRATION =====
  async registerUser(data: RegisterData): Promise<Profiles> {
    const { username, email, password } = data;

    console.log('[AuthService] Starting user registration for:', email);

    try {
      // Use the admin client to create a user in the auth schema
      console.log('[AuthService] Creating user in Supabase Auth...');
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username },
      });

      if (authError) {
        console.error('[AuthService] Auth error:', authError);
        if (authError.message.includes('User already registered')) {
          throw new AppError('A user with this email or username already exists.', 409); // 409 Conflict
        }
        throw new AppError(authError.message, 500);
      }
      
      const newUser = authData.user;
      console.log('[AuthService] User created in Auth, ID:', newUser.id);

      // ✅ REMOVED: Manual profile creation - Supabase trigger will handle this automatically
      // The trigger will create the profile with the same ID as the user
      console.log('[AuthService] Waiting for Supabase trigger to create profile...');
      
      // Wait a moment for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch the created profile
      const profile = await this.getUserProfile(newUser.id);
      
      if (!profile) {
        console.error('[AuthService] Profile not found after trigger execution');
        // Critical error: user created in Auth, but profile not created by trigger. Rollback.
        await this.supabaseAdmin.auth.admin.deleteUser(newUser.id);
        throw new AppError('Failed to create user profile after registration.', 500);
      }

      console.log('[AuthService] Registration successful for:', email);
      return profile;
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  }

  // ===== USER LOGIN =====
  async loginUser(data: LoginData): Promise<{ profile: Profiles; session: any }> {
    const { email, password } = data;

    console.log('[AuthService] Starting user login for:', email);

    try {
      // Use the admin client for login
      const { data: authData, error: authError } = await this.supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('[AuthService] Login error:', authError);
        throw new AppError('Invalid email or password.', 401);
      }

      const { user, session } = authData;
      console.log('[AuthService] User logged in, ID:', user.id);

      // Fetch the user profile
      const profile = await this.getUserProfile(user.id);
      
      if (!profile) {
        console.error('[AuthService] Profile not found for logged in user');
        throw new AppError('User profile not found.', 500);
      }

      console.log('[AuthService] Login successful for:', email);
      return { profile, session };
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  }

  // ===== GET USER PROFILE =====
  async getUserProfile(userId: string): Promise<Profiles | null> {
    try {
      const { data, error } = await this.db
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('[AuthService] Error fetching user profile:', error);
        throw new AppError('Error fetching user profile.', 500);
      }

      return data;
    } catch (error) {
      console.error('[AuthService] Error in getUserProfile:', error);
      throw error;
    }
  }
}