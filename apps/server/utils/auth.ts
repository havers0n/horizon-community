import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { storage } from '../storage';
import { User } from '../types';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function getAuthenticatedUser(req: AuthenticatedRequest): Promise<User | null> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  // Mock token for testing
  if (token === 'mock-token') {
    const mockUserId = 1;
    console.log(`🔧 Mock user ID: ${mockUserId}`);
    const dbUser = await storage.getUser(mockUserId);
    console.log(`🔧 DB user found:`, dbUser ? `${dbUser.email} (ID: ${dbUser.id})` : 'null');      
    return dbUser || null;
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
    const dbUser = await storage.getUserByAuthId(user.id);
    console.log(`🔧 DB user found:`, dbUser ? `${dbUser.email} (ID: ${dbUser.id})` : 'null');        
    return dbUser || null;
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
