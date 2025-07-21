import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Получаем переменные окружения с значениями по умолчанию
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://axgtvvcimqoyxbfvdrok.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдена переменная окружения SUPABASE_SERVICE_ROLE_KEY');
  console.log('Для применения миграции вам нужно:');
  console.log('1. Получить Service Role Key из панели Supabase');
  console.log('2. Установить переменную окружения:');
  console.log('   set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('Или запустить команду:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/apply_test_migration.js');
  process.exit(1);
}

console.log('🔗 Подключение к Supabase:', supabaseUrl);

// Создаем клиент Supabase с правами администратора
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Применение миграции системы тестирования...');
    
    // Читаем файл миграции
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '004_test_system.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Файл миграции не найден:', migrationPath);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Читаем файл миграции:', migrationPath);
    
    // Разбиваем SQL на раздельные команды
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📋 Найдено ${commands.length} SQL команд для выполнения`);
    
    // Выполняем команды по одной
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⚡ Выполняем команду ${i + 1}/${commands.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Ошибка в команде ${i + 1}:`, error);
          console.error('Проблемная команда:', command.substring(0, 100) + '...');
          process.exit(1);
        }
      }
    }
    
    console.log('✅ Миграция успешно применена!');
    console.log('📋 Созданы таблицы:');
    console.log('   - test_sessions (сессии тестов)');
    console.log('   - test_results (результаты тестов)');
    console.log('   - индексы для оптимизации');
    console.log('   - RLS политики безопасности');
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error);
    process.exit(1);
  }
}

// Запускаем миграцию
applyMigration(); 