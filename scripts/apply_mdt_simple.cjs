const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function applyMDTMigration() {
    console.log('🚀 ПРИМЕНЕНИЕ MDT МИГРАЦИИ...');
    console.log('============================================================');

    // Проверка переменных окружения
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Ошибка: Не найдены переменные окружения');
        console.error('   SUPABASE_URL:', supabaseUrl ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
        console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'НАЙДЕН' : 'НЕ НАЙДЕН');
        process.exit(1);
    }

    console.log('✅ Переменные окружения найдены');
    console.log('   URL:', supabaseUrl);

    // Создание клиента Supabase
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    try {
        // Чтение файла миграции
        const fs = require('fs');
        const path = require('path');
        const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_mdt_system.sql');
        
        if (!fs.existsSync(migrationPath)) {
            console.error('❌ Файл миграции не найден:', migrationPath);
            process.exit(1);
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log('✅ Файл миграции загружен');

        // Применение миграции
        console.log('📊 Применение миграции...');
        const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

        if (error) {
            console.error('❌ Ошибка применения миграции:', error);
            process.exit(1);
        }

        console.log('✅ Миграция успешно применена!');
        console.log('============================================================');
        console.log('🎉 MDT система готова к использованию!');
        console.log('');
        console.log('📋 Созданные таблицы:');
        console.log('   • mdt_units - Юниты MDT');
        console.log('   • mdt_calls_911 - Вызовы 911');
        console.log('   • mdt_signals - Сигналы');
        console.log('   • law_reports - Отчеты правоохранительных органов');
        console.log('   • ems_fd_reports - Отчеты EMS/FD');
        console.log('   • impound_lots - Штрафстоянки');
        console.log('   • companies - Компании');
        console.log('   • И еще 6 таблиц...');
        console.log('');
        console.log('🚀 Следующие шаги:');
        console.log('   1. Запустите сервер: npm run dev');
        console.log('   2. Протестируйте API эндпоинты');
        console.log('   3. Интегрируйте с клиентской частью');

    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    }
}

applyMDTMigration(); 