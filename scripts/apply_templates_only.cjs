const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Ошибка: Не найдены переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyTemplatesMigration() {
  try {
    console.log('Применяем миграцию шаблонов...');

    // Читаем миграцию 010_report_templates_system.sql
    const migration010Path = path.join(__dirname, '../supabase/migrations/010_report_templates_system.sql');
    const migration010 = fs.readFileSync(migration010Path, 'utf8');

    // Читаем миграцию 011_enhanced_report_templates.sql
    const migration011Path = path.join(__dirname, '../supabase/migrations/011_enhanced_report_templates.sql');
    const migration011 = fs.readFileSync(migration011Path, 'utf8');

    // Разбиваем SQL на команды
    const commands010 = migration010.split(';').filter(cmd => cmd.trim());
    const commands011 = migration011.split(';').filter(cmd => cmd.trim());

    console.log('Применяем базовую миграцию шаблонов...');
    for (const command of commands010) {
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            console.error('Ошибка выполнения команды:', error.message);
          }
        } catch (err) {
          console.error('Ошибка выполнения команды:', err.message);
        }
      }
    }

    console.log('Применяем расширенную миграцию шаблонов...');
    for (const command of commands011) {
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            console.error('Ошибка выполнения команды:', error.message);
          }
        } catch (err) {
          console.error('Ошибка выполнения команды:', err.message);
        }
      }
    }

    console.log('✅ Миграции шаблонов применены!');

    // Проверяем результат
    const { data: templates, error } = await supabase
      .from('report_templates')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Ошибка проверки:', error);
    } else {
      console.log(`Найдено ${templates.length} шаблонов`);
      if (templates.length > 0) {
        console.log('Пример шаблона:', {
          title: templates[0].title,
          category: templates[0].category,
          difficulty: templates[0].difficulty,
          tags: templates[0].tags
        });
      }
    }

  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

applyTemplatesMigration(); 