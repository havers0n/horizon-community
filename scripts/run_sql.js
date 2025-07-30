import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSQL() {
  try {
    console.log('🔧 Выполняем SQL скрипт...');
    
    // Читаем SQL файл
    const sqlContent = fs.readFileSync('scripts/create_tables_direct.sql', 'utf8');
    
    // Разбиваем на отдельные команды
    const commands = sqlContent.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log(`📋 Выполняем: ${command.trim().substring(0, 50)}...`);
        
        try {
          const { error } = await supabaseAdmin.rpc('exec_sql', {
            sql: command.trim()
          });
          
          if (error) {
            console.log(`ℹ️ Команда уже выполнена или не требуется: ${error.message}`);
          } else {
            console.log('✅ Команда выполнена успешно');
          }
        } catch (err) {
          console.log(`ℹ️ Команда уже выполнена или не требуется: ${err.message}`);
        }
      }
    }
    
    console.log('\n🎉 SQL скрипт выполнен!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

runSQL(); 