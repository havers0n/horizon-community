import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения VITE_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMDTMigration() {
  try {
    console.log('🚀 ПРИМЕНЕНИЕ MDT МИГРАЦИИ...');
    console.log('='.repeat(60));
    
    // Проверяем подключение
    console.log('🔍 Проверяем подключение к базе данных...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Ошибка подключения к базе данных:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Подключение к базе данных успешно');
    
    // Читаем файл миграции
    console.log('\n📖 Читаем файл миграции...');
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '004_mdt_system.sql');
    
    try {
      const migrationContent = await fs.readFile(migrationPath, 'utf8');
      console.log('✅ Файл миграции успешно прочитан');
      
      // Разбиваем на отдельные команды
      const commands = migrationContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
        .map(cmd => cmd + ';');
      
      console.log(`🔧 Найдено ${commands.length} SQL команд для выполнения`);
      console.log('-'.repeat(60));
      
      let successCount = 0;
      let errorCount = 0;
      
      // Выполняем команды по очереди
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        
        // Пропускаем пустые команды
        if (!command || command.trim() === ';') {
          continue;
        }
        
        try {
          console.log(`  🔄 Выполняем команду ${i + 1}/${commands.length}...`);
          
          // Обрезаем команду для отображения
          const displayCommand = command.length > 80 
            ? command.substring(0, 80) + '...' 
            : command;
          console.log(`     SQL: ${displayCommand}`);
          
          // Используем прямой SQL запрос через REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql: command })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`    ❌ Ошибка выполнения команды: ${errorText}`);
            errorCount++;
          } else {
            console.log(`    ✅ Команда выполнена успешно`);
            successCount++;
          }
          
          // Небольшая пауза между командами
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`    ❌ Ошибка выполнения команды: ${error.message}`);
          errorCount++;
        }
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('📊 РЕЗУЛЬТАТЫ ПРИМЕНЕНИЯ МИГРАЦИИ:');
      console.log(`✅ Успешно выполнено: ${successCount} команд`);
      console.log(`❌ Ошибок: ${errorCount} команд`);
      
      if (errorCount === 0) {
        console.log('\n🎉 МИГРАЦИЯ MDT СИСТЕМЫ УСПЕШНО ПРИМЕНЕНА!');
        console.log('📋 Созданы следующие таблицы:');
        console.log('   • mdt_units - Юниты MDT системы');
        console.log('   • mdt_calls_911 - Вызовы 911');
        console.log('   • mdt_call_attachments - Привязка юнитов к вызовам');
        console.log('   • mdt_signals - Сигналы для экстренных служб');
        console.log('   • mdt_signal_notifications - Уведомления о сигналах');
        console.log('   • law_reports - Отчеты правоохранительных органов');
        console.log('   • ems_fd_reports - Отчеты EMS/FD служб');
        console.log('   • impound_lots - Штрафстоянки');
        console.log('   • impounded_vehicles - Конфискованные ТС');
        console.log('   • notebook_notes - Заметки офицеров');
        console.log('   • companies - Компании');
        console.log('   • company_employees - Сотрудники компаний');
        console.log('   • cargo_shipments - Грузоперевозки');
        console.log('\n🔧 Также добавлены:');
        console.log('   • Индексы для оптимизации запросов');
        console.log('   • RLS политики для безопасности');
        console.log('   • Внешние ключи с каскадным удалением');
        
        console.log('\n🚀 Следующие шаги:');
        console.log('   1. Протестировать API эндпоинты');
        console.log('   2. Интегрировать с клиентской частью');
        console.log('   3. Настроить WebSocket уведомления');
        
      } else {
        console.log('\n⚠️  МИГРАЦИЯ ЗАВЕРШЕНА С ОШИБКАМИ');
        console.log('🔍 Проверьте логи выше для деталей ошибок');
        console.log('💡 Некоторые команды могли уже существовать в базе данных');
      }
      
    } catch (fileError) {
      console.error('❌ Ошибка чтения файла миграции:', fileError.message);
      console.log('💡 Убедитесь, что файл supabase/migrations/004_mdt_system.sql существует');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    process.exit(1);
  }
}

// Запускаем миграцию
applyMDTMigration(); 