import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '../core/lib/supabase.js';
import type { Database } from '@roleplay-identity/db-types';
import type { User } from '@roleplay-identity/shared-schema';

// Типы из packages/db-types
type Profile = Database['public']['Tables']['profiles']['Row'];

// Расширяем типы Express для совместимости
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

export type AuthenticatedRequest = Request;

export async function getAuthenticatedUser(req: AuthenticatedRequest): Promise<User | null> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  // Mock token for testing
  if (token === 'mock-token') {
    console.log(`🔧 Mock user authentication`);
    // Возвращаем mock профиль для тестирования
    return {
      id: 'mock-user-id',
      username: 'mock-user',
      email: 'mock@example.com',
      role: 'candidate'
    };
  }

  console.log('🔧 Processing real JWT token');
  
  if (!supabaseAdmin) {
    console.error('🔧 Supabase admin client not initialized');
    return null;
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.error('🔧 JWT verification failed:', error);
      return null;
    }

    console.log(`🔧 JWT user ID: ${user.id}`);
    
    // Получаем профиль из таблицы profiles
    const publicClient = createSupabaseClient('public');
    const { data: profile, error: profileError } = await publicClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.error('🔧 Profile not found for user:', user.id);
      return null;
    }
    
    console.log(`🔧 Profile found:`, profile.email);
    // Преобразуем Profile в User
    return {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      role: profile.role
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export function requireAuthentication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  getAuthenticatedUser(req).then(user => {
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  }).catch(error => {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
}

export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
