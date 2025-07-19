import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';
import { storage } from '../storage';
import type { User } from '@shared/schema';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export async function getAuthenticatedUser(req: Request): Promise<User | null> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('🔍 getAuthenticatedUser - Token:', token);
  
  if (!token) {
    console.log('❌ No token provided');
    return null;
  }
  
  try {
    // Проверяем, является ли это mock токеном для тестирования
    if (token.startsWith('mock-token-')) {
      console.log('🔧 Processing mock token');
      // Извлекаем ID пользователя из токена
      const tokenParts = token.split('-');
      const mockUserId = parseInt(tokenParts[2]); // mock-token-{userId}-{timestamp}
      
      if (isNaN(mockUserId)) {
        console.error('Invalid mock token format:', token);
        return null;
      }
      
      console.log(`🔧 Mock user ID: ${mockUserId}`);
      const dbUser = await storage.getUser(mockUserId);
      console.log(`🔧 DB user found:`, dbUser ? `${dbUser.email} (ID: ${dbUser.id})` : 'null');
      return dbUser || null;
    }
    
    console.log('🔧 Processing real JWT token');
    // Используем admin клиент для проверки токена
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      console.log('❌ JWT token validation failed:', error);
      return null;
    }
    
    console.log(`🔧 JWT user ID: ${user.id}`);
    const dbUser = await storage.getUserByAuthId(user.id);
    console.log(`🔧 DB user found:`, dbUser ? `${dbUser.email} (ID: ${dbUser.id})` : 'null');
    return dbUser || null;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export async function requireAuthentication(req: Request): Promise<User> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireSupervisorOrAdmin(req: Request): Promise<User> {
  const user = await requireAuthentication(req);
  if (!['supervisor', 'admin'].includes(user.role)) {
    throw new Error('Supervisor or admin role required');
  }
  return user;
}

export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

export async function validateSupabaseToken(token: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return { user, error };
  } catch (error) {
    return { user: null, error };
  }
}
