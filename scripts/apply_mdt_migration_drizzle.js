import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

async function applyMDTMigrationDrizzle() {
  try {
    console.log('🚀 ПРИМЕНЕНИЕ MDT МИГРАЦИИ ЧЕРЕЗ DRIZZLE CLI...');
    console.log('='.repeat(60));
    
    // Проверяем наличие переменных окружения
    const databaseUrl = process.env.DATABASE_URL;
    const dbPassword = process.env.DB_PASSWORD;
    
    if (!databaseUrl || !dbPassword) {
      console.error('❌ Ошибка: Не найдены переменные окружения DATABASE_URL или DB_PASSWORD');
      console.log('💡 Убедитесь, что в .env файле установлены:');
      console.log('   DATABASE_URL=postgresql://username:password@host:port/database');
      console.log('   DB_PASSWORD=your_password');
      process.exit(1);
    }
    
    console.log('✅ Переменные окружения найдены');
    
    // Проверяем, что Drizzle CLI установлен
    console.log('\n🔍 Проверяем установку Drizzle CLI...');
    try {
      await execAsync('npx drizzle-kit --version');
      console.log('✅ Drizzle CLI доступен');
    } catch (error) {
      console.error('❌ Drizzle CLI не найден');
      console.log('💡 Установите Drizzle CLI: npm install -g drizzle-kit');
      process.exit(1);
    }
    
    // Применяем миграцию через Drizzle
    console.log('\n🔧 Применяем миграцию через Drizzle...');
    console.log('-'.repeat(60));
    
    try {
      const { stdout, stderr } = await execAsync('npx drizzle-kit migrate', {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl.replace('[YOUR-PASSWORD]', encodeURIComponent(dbPassword))
        }
      });
      
      if (stderr) {
        console.log('⚠️  Предупреждения Drizzle:');
        console.log(stderr);
      }
      
      console.log('✅ Миграция успешно применена через Drizzle');
      console.log('\n📋 Результат выполнения:');
      console.log(stdout);
      
    } catch (error) {
      console.error('❌ Ошибка применения миграции через Drizzle:');
      console.error(error.message);
      
      // Пробуем альтернативный способ
      console.log('\n🔄 Пробуем альтернативный способ...');
      try {
        const { stdout, stderr } = await execAsync('npx drizzle-kit push', {
          cwd: process.cwd(),
          env: {
            ...process.env,
            DATABASE_URL: databaseUrl.replace('[YOUR-PASSWORD]', encodeURIComponent(dbPassword))
          }
        });
        
        if (stderr) {
          console.log('⚠️  Предупреждения Drizzle:');
          console.log(stderr);
        }
        
        console.log('✅ Схема успешно применена через Drizzle push');
        console.log('\n📋 Результат выполнения:');
        console.log(stdout);
        
      } catch (pushError) {
        console.error('❌ Ошибка применения схемы через Drizzle push:');
        console.error(pushError.message);
        console.log('\n💡 Попробуйте применить миграцию вручную:');
        console.log('   1. Откройте Supabase Dashboard');
        console.log('   2. Перейдите в SQL Editor');
        console.log('   3. Скопируйте содержимое файла supabase/migrations/004_mdt_system.sql');
        console.log('   4. Выполните SQL команды');
        process.exit(1);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 МИГРАЦИЯ MDT СИСТЕМЫ УСПЕШНО ПРИМЕНЕНА!');
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
    
    console.log('\n🚀 Следующие шаги:');
    console.log('   1. Протестировать API эндпоинты');
    console.log('   2. Интегрировать с клиентской частью');
    console.log('   3. Настроить WebSocket уведомления');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    process.exit(1);
  }
}

// Запускаем миграцию
applyMDTMigrationDrizzle(); 