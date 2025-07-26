import { Express } from 'express';
import { createClient } from '@supabase/supabase-js';
import { users } from '@roleplay-identity/shared-schema';
import { storage } from '../storage';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export function authRoutes(app: Express) {
  // POST /api/auth/register
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, username } = req.body;
    
    // Создать пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) return res.status(400).json({ error: authError.message });
    
    // Создать запись в таблице users
    try {
      await storage.createUser({
        email,
        username,
        authId: authData.user.id,
        passwordHash: '' // Больше не нужен
      });
    } catch (userError) {
      return res.status(400).json({ error: (userError as Error).message });
    }
    
    res.json({ user: authData.user });
  });
}
