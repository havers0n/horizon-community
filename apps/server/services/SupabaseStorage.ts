import { supabase, commonClient, mdtClient } from '../lib/supabase.js';
import bcrypt from 'bcrypt';

// ===== БАЗОВЫЙ SUPABASE STORAGE - ТОЛЬКО ПРИМИТИВНЫЕ ОПЕРАЦИИ =====

export class SupabaseStorage {
  
  // ===== КОНФИГУРАЦИЯ СХЕМ =====
  
  private getClientForTable(table: string) {
    // Таблицы в схеме common
    const commonTables = [
      'departments', 'divisions', 'ranks', 'units', 'characters', 
      'vehicles', 'weapons', 'companies', 'company_employees',
      'leo_profiles', 'ems_profiles', 'fire_profiles', 'cargo_shipments',
      'character_career_history', 'character_qualifications', 'qualifications',
      'impound_lots', 'impounded_vehicles', 'pets'
    ];
    
    // Таблицы в схеме mdt
    const mdtTables = [
      'applications', 'calls', 'bolos', 'complaints', 'ems_fd_reports',
      'law_reports', 'mdt_signals', 'mdt_signal_notifications',
      'notebook_notes', 'notifications', 'support_tickets',
      'tests', 'test_sessions', 'test_results', 'units_on_duty'
    ];
    
    if (commonTables.includes(table)) {
      return commonClient;
    } else if (mdtTables.includes(table)) {
      return mdtClient;
    } else {
      return supabase; // public schema
    }
  }
  
  // ===== БАЗОВЫЕ CRUD ОПЕРАЦИИ =====
  
  async insert(table: string, data: any): Promise<any | null> {
    const client = this.getClientForTable(table);
    const { data: result, error } = await client
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      return null;
    }
    
    return result;
  }

  async update(table: string, id: number, data: any): Promise<any | null> {
    const client = this.getClientForTable(table);
    const { data: result, error } = await client
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      return null;
    }
    
    return result;
  }

  async delete(table: string, id: number): Promise<boolean> {
    const client = this.getClientForTable(table);
    const { error } = await client
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      return false;
    }
    
    return true;
  }

  async getById(table: string, id: number): Promise<any | null> {
    const client = this.getClientForTable(table);
    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error getting ${table} by id:`, error);
      return null;
    }
    
    return data;
  }

  async getByField(table: string, field: string, value: any): Promise<any | null> {
    const client = this.getClientForTable(table);
    const { data, error } = await client
      .from(table)
      .select('*')
      .eq(field, value)
      .single();
    
    if (error) {
      console.error(`Error getting ${table} by ${field}:`, error);
      return null;
    }
    
    return data;
  }

  async list(
    table: string,
    filters: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: { column: string; ascending?: boolean };
    } = {}
  ): Promise<any[]> {
    const client = this.getClientForTable(table);
    let query = client.from(table).select('*');
    
    // Применяем фильтры
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });
    
    // Применяем сортировку
    if (options.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true
      });
    }
    
    // Применяем пагинацию
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error listing ${table}:`, error);
      return [];
    }
    
    return data || [];
  }

  async count(table: string, filters: Record<string, any> = {}): Promise<number> {
    const client = this.getClientForTable(table);
    let query = client.from(table).select('*', { count: 'exact', head: true });
    
    // Применяем фильтры
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { count, error } = await query;
    
    if (error) {
      console.error(`Error counting ${table}:`, error);
      return 0;
    }
    
    return count || 0;
  }

  // ===== СПЕЦИАЛЬНЫЕ ОПЕРАЦИИ =====
  
  async search(
    table: string,
    searchFields: string[],
    query: string,
    limit: number = 10
  ): Promise<any[]> {
    const client = this.getClientForTable(table);
    const searchConditions = searchFields.map(field => `${field}.ilike.%${query}%`).join(',');
    
    const { data, error } = await client
      .from(table)
      .select('*')
      .or(searchConditions)
      .limit(limit);
    
    if (error) {
      console.error(`Error searching ${table}:`, error);
      return [];
    }
    
    return data || [];
  }

  async batchInsert(table: string, data: any[]): Promise<any[]> {
    const client = this.getClientForTable(table);
    const { data: result, error } = await client
      .from(table)
      .insert(data)
      .select();
    
    if (error) {
      console.error(`Error batch inserting into ${table}:`, error);
      return [];
    }
    
    return result || [];
  }

  async batchUpdate(table: string, updates: Array<{ id: number; data: any }>): Promise<any[]> {
    const results: any[] = [];
    
    for (const update of updates) {
      const result = await this.update(table, update.id, update.data);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  // ===== УТИЛИТЫ =====
  
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // ===== КЭШ (ЗАГЛУШКИ) =====
  
  invalidateCache(): void {
    console.log('Cache invalidation requested');
  }

  getCacheInfo(): { size: number; keys: string[] } {
    return { size: 0, keys: [] };
  }
}

// Экспортируем единственный экземпляр
export const supabaseStorage = new SupabaseStorage(); 