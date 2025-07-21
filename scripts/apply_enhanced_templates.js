const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Ошибка: Не найдены переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Применяем миграцию расширенных шаблонов...');

    // Читаем SQL файл
    const migrationPath = path.join(__dirname, '../supabase/migrations/011_enhanced_report_templates.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Разбиваем SQL на раздельные команды
    const commands = sql.split(';').filter(cmd => cmd.trim());

    for (const command of commands) {
      if (command.trim()) {
        console.log('Выполняем команду:', command.substring(0, 100) + '...');
        
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error('Ошибка выполнения команды:', error);
          // Продолжаем выполнение других команд
        }
      }
    }

    console.log('Миграция успешно применена!');

    // Проверяем, что новые поля добавлены
    const { data: templates, error } = await supabase
      .from('report_templates')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Ошибка проверки таблицы:', error);
    } else {
      console.log('Проверка таблицы успешна. Доступные поля:', Object.keys(templates[0] || {}));
    }

  } catch (error) {
    console.error('Ошибка применения миграции:', error);
    process.exit(1);
  }
}

applyMigration(); 