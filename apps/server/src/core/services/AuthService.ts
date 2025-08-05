// apps/server/src/core/services/AuthService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js'; // Import createClient for admin operations
import { createSupabaseClient } from '../lib/supabase';
import { AppError } from '../../utils/AppError';
import type { Database, Profiles, ProfilesInsert } from '@roleplay-identity/db-types';

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
  // ✅ CORRECTED: We only need a client for the 'public' schema to access profiles.
  private supabasePublic: SupabaseClient<Database, 'public'>;
  // ✅ We need a special, non-schema-typed admin client for user management.
  private supabaseAdmin: SupabaseClient;

  constructor() {
    console.log('[AuthService] Initializing AuthService...');
    console.log('[AuthService] SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('[AuthService] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    
    // This client is for accessing our public.profiles table
    this.supabasePublic = createSupabaseClient('public');

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

    // Any client can be used for standard auth operations like signInWithPassword
    const { data: authData, error: authError } = await this.supabasePublic.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError || !authData.user) {
      throw new AppError('Invalid email or password.', 401); // 401 Unauthorized
    }

    const profile = await this.getUserProfile(authData.user.id);
    
    if (!profile) {
      throw new AppError('User profile not found.', 404); // 404 Not Found
    }

    return { profile, session: authData.session };
  }

  // ===== GET USER PROFILE =====
  async getUserProfile(userId: string): Promise<Profiles | null> {
    const { data, error } = await this.supabasePublic
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
        console.error(`[AuthService] Error fetching profile for ${userId}:`, error);
    }
    return data;
  }
}