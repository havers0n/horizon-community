import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config();

async function fixDevSchemaMigration() {
  console.log('🔧 Fixing dev_schema migration...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    
    // Устанавливаем схему поиска
    await client.query('SET search_path TO dev_schema, public');
    
    // Список недостающих таблиц
    const missingTables = [
      'users',
      'departments', 
      'tests',
      'reports',
      'support_tickets',
      'complaints',
      'applications',
      'notifications'
    ];
    
    console.log('📋 Creating missing tables...');
    
    // Создаем недостающие таблицы
    for (const tableName of missingTables) {
      console.log(`🔨 Creating table: ${tableName}`);
      
      try {
        // Проверяем, существует ли таблица
        const existsResult = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'dev_schema' 
            AND table_name = $1
          )
        `, [tableName]);
        
        if (existsResult.rows[0].exists) {
          console.log(`  ✅ Table ${tableName} already exists`);
          continue;
        }
        
        // Создаем базовую структуру таблицы
        let createSQL = '';
        
        switch (tableName) {
          case 'users':
            createSQL = `
              CREATE TABLE dev_schema.users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'candidate',
                status TEXT NOT NULL DEFAULT 'active',
                department_id INTEGER,
                secondary_department_id INTEGER,
                rank TEXT,
                division TEXT,
                qualifications TEXT[] DEFAULT '{}',
                game_warnings INTEGER NOT NULL DEFAULT 0,
                admin_warnings INTEGER NOT NULL DEFAULT 0,
                cad_token TEXT UNIQUE,
                discord_id TEXT UNIQUE,
                discord_username TEXT,
                discord_access_token TEXT,
                discord_refresh_token TEXT,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                auth_id TEXT UNIQUE
              )
            `;
            break;
            
          case 'departments':
            createSQL = `
              CREATE TABLE dev_schema.departments (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                full_name TEXT NOT NULL,
                logo_url TEXT,
                description TEXT,
                gallery TEXT[] DEFAULT '{}'
              )
            `;
            break;
            
          case 'tests':
            createSQL = `
              CREATE TABLE dev_schema.tests (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                related_to JSONB NOT NULL,
                duration_minutes INTEGER NOT NULL,
                questions JSONB NOT NULL
              )
            `;
            break;
            
          case 'reports':
            createSQL = `
              CREATE TABLE dev_schema.reports (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                author_id INTEGER NOT NULL,
                department_id INTEGER,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL
              )
            `;
            break;
            
          case 'support_tickets':
            createSQL = `
              CREATE TABLE dev_schema.support_tickets (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'open',
                priority INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
              )
            `;
            break;
            
          case 'complaints':
            createSQL = `
              CREATE TABLE dev_schema.complaints (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                complainant_id INTEGER NOT NULL,
                accused_id INTEGER,
                status TEXT NOT NULL DEFAULT 'pending',
                evidence JSONB,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL
              )
            `;
            break;
            
          case 'applications':
            createSQL = `
              CREATE TABLE dev_schema.applications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                department_id INTEGER NOT NULL,
                position TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                answers JSONB NOT NULL,
                test_score INTEGER,
                interview_score INTEGER,
                notes TEXT,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
                character_id INTEGER,
                status_history JSONB DEFAULT '[]'::jsonb NOT NULL
              )
            `;
            break;
            
          case 'notifications':
            createSQL = `
              CREATE TABLE dev_schema.notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT NOT NULL DEFAULT 'info',
                is_read BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
              )
            `;
            break;
        }
        
        if (createSQL) {
          await client.query(createSQL);
          console.log(`  ✅ Table ${tableName} created successfully`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error creating table ${tableName}:`, error.message);
      }
    }
    
    console.log('🎉 Dev schema fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixDevSchemaMigration()
  .then(() => {
    console.log('✅ Dev schema fix script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Dev schema fix script failed:', error);
    process.exit(1);
  }); 