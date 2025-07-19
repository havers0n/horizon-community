#!/usr/bin/env node

/**
 * Скрипт для миграции данных из локального Supabase в облачный
 * Использование: node scripts/migrate-to-cloud.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Загружаем переменные окружения
dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '.env.production') })

// Локальный Supabase клиент
const localSupabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
)

// Облачный Supabase клиент
const cloudSupabase = createClient(
  process.env.VITE_SUPABASE_URL_CLOUD || 'https://axgtvvcimqoyxbfvdrok.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY_CLOUD || process.env.SUPABASE_ANON_KEY
)

const TABLES = [
  'departments',
  'users',
  'tests',
  'applications',
  'support_tickets',
  'complaints',
  'reports',
  'notifications'
]

async function migrateTable(tableName) {
  console.log(`📊 Migrating ${tableName}...`)
  
  try {
    // Получаем данные из локальной БД
    const { data: localData, error: localError } = await localSupabase
      .from(tableName)
      .select('*')
    
    if (localError) {
      console.error(`❌ Error reading from local ${tableName}:`, localError)
      return false
    }
    
    if (!localData || localData.length === 0) {
      console.log(`✅ ${tableName} is empty, skipping`)
      return true
    }
    
    // Очищаем таблицу в облачной БД (осторожно!)
    const { error: deleteError } = await cloudSupabase
      .from(tableName)
      .delete()
      .neq('id', 0) // Удаляем все записи
    
    if (deleteError) {
      console.warn(`⚠️  Warning cleaning ${tableName}:`, deleteError)
    }
    
    // Вставляем данные в облачную БД
    const { error: insertError } = await cloudSupabase
      .from(tableName)
      .insert(localData)
    
    if (insertError) {
      console.error(`❌ Error inserting into cloud ${tableName}:`, insertError)
      return false
    }
    
    console.log(`✅ Successfully migrated ${localData.length} records to ${tableName}`)
    return true
    
  } catch (error) {
    console.error(`❌ Unexpected error migrating ${tableName}:`, error)
    return false
  }
}

async function migrateAllData() {
  console.log('🚀 Starting data migration from local to cloud Supabase...')
  console.log('⚠️  WARNING: This will DELETE all existing data in cloud database!')
  
  // Проверяем подключение к обеим БД
  try {
    const { data: localTest } = await localSupabase.from('departments').select('count').limit(1)
    const { data: cloudTest } = await cloudSupabase.from('departments').select('count').limit(1)
    
    console.log('✅ Both databases are accessible')
  } catch (error) {
    console.error('❌ Database connection error:', error)
    process.exit(1)
  }
  
  let successCount = 0
  let failCount = 0
  
  for (const table of TABLES) {
    const success = await migrateTable(table)
    if (success) {
      successCount++
    } else {
      failCount++
    }
  }
  
  console.log('\\n📈 Migration Summary:')
  console.log(`✅ Successfully migrated: ${successCount} tables`)
  console.log(`❌ Failed: ${failCount} tables`)
  
  if (failCount === 0) {
    console.log('\\n🎉 All data successfully migrated to cloud!')
  } else {
    console.log('\\n⚠️  Some tables failed to migrate. Please check the errors above.')
    process.exit(1)
  }
}

// Проверяем, что переменные окружения настроены
if (!process.env.VITE_SUPABASE_URL_CLOUD && !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Please set cloud Supabase credentials in .env.production')
  process.exit(1)
}

// Запускаем миграцию
migrateAllData().catch(console.error)
