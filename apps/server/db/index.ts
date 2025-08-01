// ===== АДАПТЕР ДЛЯ СОВМЕСТИМОСТИ С СТАРЫМИ ИМПОРТАМИ =====
// Этот файл обеспечивает обратную совместимость с кодом, который импортирует из '../db/index'

import { supabase } from '../lib/supabase.js';
import { storage } from '../storage.js';

// Экспортируем объекты для совместимости со старым кодом
export const pool = {
  query: async (sql: string, params: any[] = []) => {
    // Простой адаптер для SQL запросов через Supabase
    // Внимание: это базовая реализация, для сложных запросов лучше использовать сервисы
    try {
      // Извлекаем имя таблицы из SQL запроса
      const tableMatch = sql.match(/FROM\s+(\w+)/i);
      if (!tableMatch) {
        throw new Error('Could not extract table name from SQL query');
      }
      
      const tableName = tableMatch[1];
      
      // Простая обработка SELECT запросов
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*');
          
        if (error) throw error;
        
        return {
          rows: data || [],
          rowCount: data?.length || 0
        };
      }
      
      // Простая обработка INSERT запросов
      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        // Извлекаем данные из params или создаем пустой объект
        const insertData = params[0] || {};
        
        const { data, error } = await supabase
          .from(tableName)
          .insert(insertData)
          .select();
          
        if (error) throw error;
        
        return {
          rows: data || [],
          rowCount: data?.length || 0
        };
      }
      
      // Простая обработка UPDATE запросов
      if (sql.trim().toUpperCase().startsWith('UPDATE')) {
        // Извлекаем ID из WHERE условия
        const idMatch = sql.match(/WHERE\s+id\s*=\s*\$\d+/i);
        if (!idMatch) {
          throw new Error('UPDATE query must have WHERE id = condition');
        }
        
        const idIndex = parseInt(idMatch[0].match(/\$(\d+)/)?.[1] || '1') - 1;
        const id = params[idIndex];
        const updateData = params[params.length - 1] || {};
        
        const { data, error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', id)
          .select();
          
        if (error) throw error;
        
        return {
          rows: data || [],
          rowCount: data?.length || 0
        };
      }
      
      // Простая обработка DELETE запросов
      if (sql.trim().toUpperCase().startsWith('DELETE')) {
        const idMatch = sql.match(/WHERE\s+id\s*=\s*\$\d+/i);
        if (!idMatch) {
          throw new Error('DELETE query must have WHERE id = condition');
        }
        
        const idIndex = parseInt(idMatch[0].match(/\$(\d+)/)?.[1] || '1') - 1;
        const id = params[idIndex];
        
        const { data, error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id)
          .select();
          
        if (error) throw error;
        
        return {
          rows: data || [],
          rowCount: data?.length || 0
        };
      }
      
      throw new Error(`Unsupported SQL operation: ${sql}`);
    } catch (error) {
      console.error('SQL query error:', error);
      throw error;
    }
  }
};

// Экспортируем объект db для совместимости
export const db = {
  // Простые методы для совместимости
  query: pool.query,
  
  // Методы для работы с таблицами
  from: (tableName: string) => supabase.from(tableName),
  
  // Методы для аутентификации
  auth: supabase.auth,
  
  // Методы для storage
  storage: supabase.storage
};

// Экспортируем storage для совместимости
export { storage };

// Экспортируем supabase клиент
export { supabase }; 