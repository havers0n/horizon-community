import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../packages/db-types/src/index';

// TODO: Regenerate DB types to include filled_reports
const TABLE_NAME = 'filled_reports' as any;

export class FilledReportService {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  // Methods for filled reports will be added here

}
