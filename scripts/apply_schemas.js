import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applySchemas() {
  try {
    console.log('🔧 Применяем схемы и таблицы...');
    
    // Читаем SQL файл
    const sqlPath = path.join(process.cwd(), 'scripts', 'create_schemas.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL файл прочитан, размер:', sqlContent.length, 'символов');
    
    // Разбиваем SQL на отдельные команды
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`🔧 Найдено ${commands.length} SQL команд`);
    
    // Выполняем команды по одной
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`\n🔧 Выполняем команду ${i + 1}/${commands.length}:`);
        console.log(command.substring(0, 100) + (command.length > 100 ? '...' : ''));
        
        try {
          const { data, error } = await supabaseAdmin.rpc('exec_sql', {
            sql: command
          });
          
          if (error) {
            console.log(`  ❌ Ошибка: ${error.message}`);
          } else {
            console.log(`  ✅ Успешно`);
          }
        } catch (err) {
          console.log(`  ❌ Исключение: ${err.message}`);
        }
      }
    }
    
    console.log('\n🎉 Применение схем завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

applySchemas(); 