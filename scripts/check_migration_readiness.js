import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;
const dbPassword = process.env.DB_PASSWORD;

async function checkMigrationReadiness() {
  console.log('🔍 ПРОВЕРКА ГОТОВНОСТИ К MDT МИГРАЦИИ...');
  console.log('='.repeat(60));
  
  let allChecksPassed = true;
  
  // Проверка 1: Переменные окружения
  console.log('\n📋 Проверка переменных окружения...');
  
  if (!supabaseUrl) {
    console.log('❌ VITE_SUPABASE_URL не найден');
    allChecksPassed = false;
  } else {
    console.log('✅ VITE_SUPABASE_URL найден');
  }
  
  if (!supabaseServiceKey) {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY не найден');
    allChecksPassed = false;
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY найден');
  }
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL не найден');
    allChecksPassed = false;
  } else {
    console.log('✅ DATABASE_URL найден');
  }
  
  if (!dbPassword) {
    console.log('❌ DB_PASSWORD не найден');
    allChecksPassed = false;
  } else {
    console.log('✅ DB_PASSWORD найден');
  }
  
  // Проверка 2: Файл миграции
  console.log('\n📁 Проверка файла миграции...');
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '004_mdt_system.sql');
  
  try {
    await fs.access(migrationPath);
    const stats = await fs.stat(migrationPath);
    console.log('✅ Файл миграции найден');
    console.log(`   Размер: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.log('❌ Файл миграции не найден');
    console.log(`   Ожидаемый путь: ${migrationPath}`);
    allChecksPassed = false;
  }
  
  // Проверка 3: Подключение к базе данных
  console.log('\n🔌 Проверка подключения к базе данных...');
  
  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log('❌ Ошибка подключения к базе данных');
        console.log(`   Ошибка: ${error.message}`);
        allChecksPassed = false;
      } else {
        console.log('✅ Подключение к базе данных успешно');
      }
    } catch (error) {
      console.log('❌ Ошибка подключения к Supabase');
      console.log(`   Ошибка: ${error.message}`);
      allChecksPassed = false;
    }
  } else {
    console.log('⚠️  Пропущено - отсутствуют переменные окружения');
  }
  
  // Проверка 4: Существующие таблицы
  console.log('\n📊 Проверка существующих таблиц...');
  
  if (supabaseUrl && supabaseServiceKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Проверяем основные таблицы
      const tablesToCheck = [
        'users',
        'characters', 
        'departments',
        'vehicles'
      ];
      
      for (const tableName of tablesToCheck) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);
          
          if (error) {
            console.log(`❌ Таблица ${tableName} не найдена`);
            allChecksPassed = false;
          } else {
            console.log(`✅ Таблица ${tableName} найдена`);
          }
        } catch (error) {
          console.log(`❌ Ошибка проверки таблицы ${tableName}`);
          allChecksPassed = false;
        }
      }
      
      // Проверяем MDT таблицы (должны отсутствовать)
      const mdtTablesToCheck = [
        'mdt_units',
        'mdt_calls_911',
        'mdt_signals'
      ];
      
      for (const tableName of mdtTablesToCheck) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);
          
          if (error && error.message.includes('does not exist')) {
            console.log(`✅ MDT таблица ${tableName} отсутствует (ожидаемо)`);
          } else {
            console.log(`⚠️  MDT таблица ${tableName} уже существует`);
          }
        } catch (error) {
          if (error.message.includes('does not exist')) {
            console.log(`✅ MDT таблица ${tableName} отсутствует (ожидаемо)`);
          } else {
            console.log(`❌ Ошибка проверки MDT таблицы ${tableName}`);
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Ошибка проверки таблиц');
      console.log(`   Ошибка: ${error.message}`);
      allChecksPassed = false;
    }
  } else {
    console.log('⚠️  Пропущено - отсутствуют переменные окружения');
  }
  
  // Проверка 5: Зависимости
  console.log('\n📦 Проверка зависимостей...');
  
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      '@supabase/supabase-js',
      'dotenv'
    ];
    
    for (const dep of requiredDeps) {
      if (dependencies[dep]) {
        console.log(`✅ ${dep} установлен`);
      } else {
        console.log(`❌ ${dep} не установлен`);
        allChecksPassed = false;
      }
    }
  } catch (error) {
    console.log('❌ Ошибка проверки зависимостей');
    console.log(`   Ошибка: ${error.message}`);
    allChecksPassed = false;
  }
  
  // Итоговый результат
  console.log('\n' + '='.repeat(60));
  console.log('📊 РЕЗУЛЬТАТ ПРОВЕРКИ:');
  
  if (allChecksPassed) {
    console.log('🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!');
    console.log('✅ Система готова к применению MDT миграции');
    console.log('\n🚀 Следующие шаги:');
    console.log('   1. Запустите: node scripts/apply_mdt_migration.js');
    console.log('   2. Или: node scripts/apply_mdt_migration_drizzle.js');
    console.log('   3. Проверьте результаты в Supabase Dashboard');
  } else {
    console.log('❌ ОБНАРУЖЕНЫ ПРОБЛЕМЫ!');
    console.log('⚠️  Исправьте указанные проблемы перед применением миграции');
    console.log('\n💡 Рекомендации:');
    console.log('   1. Проверьте файл .env');
    console.log('   2. Убедитесь в правильности переменных окружения');
    console.log('   3. Проверьте подключение к Supabase');
    console.log('   4. Установите недостающие зависимости');
  }
  
  console.log('\n📚 Дополнительная информация:');
  console.log('   • Руководство: docs/MDT_MIGRATION_GUIDE.md');
  console.log('   • Отчет о реализации: docs/MDT_IMPLEMENTATION_SUMMARY.md');
}

// Запускаем проверку
checkMigrationReadiness(); 