import type { User } from '@roleplay-identity/shared-schema';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@roleplay-identity/db-types';

// Набор пер-запросных клиентов Supabase по схемам
export interface SupabaseRequestClients {
  public: SupabaseClient<Database>;
  common: SupabaseClient<Database, 'common'>;
  mdt: SupabaseClient<Database, 'mdt'>;
  system: SupabaseClient<Database, 'system'>;
}

// Типизированные данные сессии, собираемые в authenticateToken
export interface SessionData {
  user: { id: string; username: string | null };
  roles: { code: string; name: string }[] | string[];
  permissions: string[];
  statuses: string[];
  cadetTracks?: any[];
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      character?: Database['common']['Tables']['characters']['Row'];
      supabase?: SupabaseRequestClients;
      session?: SessionData;
    }
  }
}

export {}; 