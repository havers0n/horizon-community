#!/usr/bin/env node

/**
 * Скрипт для исправления критических проблем безопасности
 * 
 * ПРИОРИТЕТ 1: Исправление parseInt() для UUID
 * ПРИОРИТЕТ 2: Замена прямых запросов на RPC
 * ПРИОРИТЕТ 3: Добавление валидации UUID
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const CONFIG = {
  // Файлы для исправления parseInt
  parseIntFiles: [
    'apps/server/routes.ts',
    'apps/server/routes/adminTests.ts',
    'apps/server/routes/filledReports.ts',
    'apps/server/routes/tests.ts',
    'apps/server/routes/cad.ts',
    'apps/server/routes/reportTemplates.ts',
    'apps/server/routes/admin/support.routes.ts',
    'apps/client/src/lib/adapters.ts',
    'apps/client/src/pages/TestExam.tsx',
    'apps/mdtclient/src/shared/ui/widgets/CallQueueWidget.tsx'
  ],
  
  // Файлы с прямыми запросами к защищенным схемам
  directQueryFiles: [
    'apps/server/test-schema-connection.js',
    'apps/server/test-bolo-units.js',
    'scripts/check-db-structure.js',
    'apps/server/services/CharacterServiceUpdated.ts'
  ],
  
  // RPC функции для замены прямых запросов
  rpcReplacements: {
    'SELECT \\* FROM characters WHERE id = \\$1': 'SELECT * FROM public.get_character_by_id($1)',
    'SELECT \\* FROM characters': 'SELECT * FROM public.get_all_characters()',
    'SELECT COUNT\\(\\*\\) FROM characters': 'SELECT public.get_character_count()',
    'SELECT first_name, last_name FROM characters WHERE id = \\$1': 'SELECT first_name, last_name FROM public.get_character_by_id($1)',
    'SELECT \\* FROM tests ORDER BY id DESC': 'SELECT * FROM public.get_all_tests()',
    'SELECT \\* FROM test_results WHERE test_id = \\$1': 'SELECT * FROM public.get_test_results_by_test_id($1)',
    'SELECT \\* FROM filled_reports WHERE id = \\$1': 'SELECT * FROM public.get_filled_report_by_id($1)',
    'SELECT \\* FROM report_templates WHERE id = \\$1': 'SELECT * FROM public.get_report_template_by_id($1)'
  }
};

// Утилиты
const utils = {
  // Проверка валидности UUID
  isValidUUID: (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  },
  
  // Генерация UUID валидации
  generateUUIDValidation: (paramName) => {
    return `
    // UUID валидация
    if (!utils.isValidUUID(${paramName})) {
      return res.status(400).json({ 
        message: 'Invalid UUID format', 
        field: '${paramName}',
        value: ${paramName}
      });
    }`;
  },
  
  // Замена parseInt на UUID валидацию
  replaceParseInt: (content, filePath) => {
    let modified = false;
    
    // Паттерны для замены
    const patterns = [
      {
        regex: /const\s+(\w+)\s*=\s*parseInt\(req\.params\.(\w+)\)/g,
        replacement: (match, varName, paramName) => {
          modified = true;
          return `const ${varName} = req.params.${paramName};
    // UUID валидация
    if (!utils.isValidUUID(${varName})) {
      return res.status(400).json({ 
        message: 'Invalid UUID format', 
        field: '${paramName}',
        value: ${varName}
      });
    }`;
        }
      },
      {
        regex: /parseInt\((\w+)\)/g,
        replacement: (match, varName) => {
          modified = true;
          return varName; // Просто убираем parseInt
        }
      }
    ];
    
    patterns.forEach(pattern => {
      content = content.replace(pattern.regex, pattern.replacement);
    });
    
    return { content, modified };
  },
  
  // Замена прямых запросов на RPC
  replaceDirectQueries: (content, filePath) => {
    let modified = false;
    
    Object.entries(CONFIG.rpcReplacements).forEach(([pattern, replacement]) => {
      const regex = new RegExp(pattern, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        modified = true;
      }
    });
    
    return { content, modified };
  }
};

// Основные функции
const fixer = {
  // Исправление parseInt для UUID
  fixParseIntIssues: () => {
    console.log('🔧 Исправление parseInt() для UUID...');
    
    CONFIG.parseIntFiles.forEach(filePath => {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Файл не найден: ${filePath}`);
        return;
      }
      
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const { content: newContent, modified } = utils.replaceParseInt(content, filePath);
        
        if (modified) {
          // Добавляем импорт utils если нужно
          if (newContent.includes('utils.isValidUUID') && !newContent.includes('import.*utils')) {
            const utilsImport = "import { isValidUUID } from '../utils/uuid';\n";
            newContent = utilsImport + newContent;
          }
          
          fs.writeFileSync(filePath, newContent);
          console.log(`✅ Исправлен: ${filePath}`);
        } else {
          console.log(`ℹ️  Изменений не требуется: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
      }
    });
  },
  
  // Замена прямых запросов на RPC
  fixDirectQueries: () => {
    console.log('🔧 Замена прямых запросов на RPC...');
    
    CONFIG.directQueryFiles.forEach(filePath => {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Файл не найден: ${filePath}`);
        return;
      }
      
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const { content: newContent, modified } = utils.replaceDirectQueries(content, filePath);
        
        if (modified) {
          fs.writeFileSync(filePath, newContent);
          console.log(`✅ Исправлен: ${filePath}`);
        } else {
          console.log(`ℹ️  Изменений не требуется: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
      }
    });
  },
  
  // Создание утилит для UUID
  createUUIDUtils: () => {
    console.log('🔧 Создание утилит для UUID...');
    
    const utilsContent = `/**
 * Утилиты для работы с UUID
 */

export const isValidUUID = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const validateUUID = (str: string, fieldName: string = 'id'): string => {
  if (!isValidUUID(str)) {
    throw new Error(\`Invalid UUID format for field '\${fieldName}': \${str}\`);
  }
  return str;
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
`;
    
    const utilsPath = 'apps/server/utils/uuid.ts';
    const utilsDir = path.dirname(utilsPath);
    
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }
    
    fs.writeFileSync(utilsPath, utilsContent);
    console.log(`✅ Создан: ${utilsPath}`);
  },
  
  // Создание RPC функций для недостающих операций
  createMissingRPCFunctions: () => {
    console.log('🔧 Создание недостающих RPC функций...');
    
    const rpcContent = `-- Дополнительные RPC функции для исправления архитектуры
-- Добавить в новую миграцию

-- Функции для тестов
CREATE OR REPLACE FUNCTION public.get_all_tests()
RETURNS SETOF tests 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM tests ORDER BY id DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_test_results_by_test_id(p_test_id UUID)
RETURNS SETOF test_results 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM test_results WHERE test_id = p_test_id;
END;
$$;

-- Функции для заполненных рапортов
CREATE OR REPLACE FUNCTION public.get_filled_report_by_id(p_report_id UUID)
RETURNS SETOF filled_reports 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM filled_reports WHERE id = p_report_id;
END;
$$;

-- Функции для шаблонов рапортов
CREATE OR REPLACE FUNCTION public.get_report_template_by_id(p_template_id UUID)
RETURNS SETOF report_templates 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM report_templates WHERE id = p_template_id;
END;
$$;

-- Функции для поддержки
CREATE OR REPLACE FUNCTION public.get_support_ticket_by_id(p_ticket_id UUID)
RETURNS SETOF support_tickets 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT * FROM support_tickets WHERE id = p_ticket_id;
END;
$$;
`;
    
    const rpcPath = 'supabase/migrations/025_fix_architecture_rpc.sql';
    fs.writeFileSync(rpcPath, rpcContent);
    console.log(`✅ Создан: ${rpcPath}`);
  },
  
  // Создание типов для фронтенда
  createFrontendTypes: () => {
    console.log('🔧 Создание типов для фронтенда...');
    
    const typesContent = `/**
 * Типы для фронтенда из packages/db-types
 * Автоматически сгенерировано
 */

// Импорт типов из packages/db-types
export type { Database, Tables } from '../../../packages/db-types/src/index';

// Алиасы для удобства
export type User = Tables['users'];
export type Character = Tables['characters'];
export type Department = Tables['departments'];
export type Application = Tables['applications'];
export type Report = Tables['filled_reports'];
export type Test = Tables['tests'];
export type TestResult = Tables['test_results'];
export type Notification = Tables['notifications'];
export type SupportTicket = Tables['support_tickets'];

// Типы для API ответов
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Типы для форм
export interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  departmentId?: string;
}

export interface CreateCharacterForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone_number?: string;
  address?: string;
  occupation?: string;
}

export interface CreateApplicationForm {
  type: string;
  data?: Record<string, any>;
}
`;
    
    const clientTypesPath = 'apps/client/src/types/database.ts';
    const mdtTypesPath = 'apps/mdtclient/src/types/database.ts';
    
    // Создаем директории
    [clientTypesPath, mdtTypesPath].forEach(filePath => {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, typesContent);
      console.log(`✅ Создан: ${filePath}`);
    });
  }
};

// Главная функция
const main = () => {
  console.log('🚀 Запуск исправления критических проблем...\n');
  
  try {
    // Приоритет 1: UUID проблемы
    fixer.fixParseIntIssues();
    console.log('');
    
    // Приоритет 2: Прямые запросы
    fixer.fixDirectQueries();
    console.log('');
    
    // Приоритет 3: Утилиты
    fixer.createUUIDUtils();
    console.log('');
    
    // Приоритет 4: RPC функции
    fixer.createMissingRPCFunctions();
    console.log('');
    
    // Приоритет 5: Типы для фронтенда
    fixer.createFrontendTypes();
    console.log('');
    
    console.log('✅ Исправление завершено!');
    console.log('\n📋 Следующие шаги:');
    console.log('1. Проверьте изменения в файлах');
    console.log('2. Запустите миграцию: supabase db push');
    console.log('3. Обновите импорты в файлах');
    console.log('4. Добавьте тесты для новых функций');
    console.log('5. Проверьте работу приложения');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
};

// Запуск
if (require.main === module) {
  main();
}

module.exports = { fixer, utils, CONFIG };