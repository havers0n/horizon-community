import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения
import dotenv from 'dotenv';
dotenv.config();

async function applyDevSchemaMigration() {
  console.log('🚀 Starting dev_schema migration...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    
    // Создаем схему dev_schema если она не существует
    console.log('📋 Creating dev_schema if not exists...');
    await client.query('CREATE SCHEMA IF NOT EXISTS dev_schema');
    
    // Устанавливаем схему поиска
    await client.query('SET search_path TO dev_schema, public');
    
    // Читаем файл миграции
    const migrationPath = path.join(__dirname, '..', 'migrations', '0002_nitialchema.sql');
    console.log('📖 Reading migration file:', migrationPath);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error('Migration file not found: ' + migrationPath);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Разбиваем SQL на отдельные команды
    const commands = migrationSQL
      .split('--> statement-breakpoint')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`🔧 Found ${commands.length} SQL commands to execute`);
    
    // Выполняем каждую команду
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⚡ Executing command ${i + 1}/${commands.length}...`);
        try {
          await client.query(command);
          console.log(`✅ Command ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing command ${i + 1}:`, error.message);
          // Продолжаем выполнение других команд
        }
      }
    }
    
    console.log('🎉 Dev schema migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Запускаем миграцию
applyDevSchemaMigration()
  .then(() => {
    console.log('✅ Dev schema migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Dev schema migration script failed:', error);
    process.exit(1);
  }); 