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

declare global {
  namespace Express {
    interface Request {
      user?: User;
      character?: Database['common']['Tables']['characters']['Row'];
      supabase?: SupabaseRequestClients;
    }
  }
}

export {}; 