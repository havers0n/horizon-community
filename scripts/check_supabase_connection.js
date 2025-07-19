import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Проверка подключения к Supabase...')
console.log('URL:', supabaseUrl)
console.log('Service Key:', supabaseServiceKey ? '✅ Найден' : '❌ Не найден')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют необходимые переменные окружения')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    // Тестируем подключение
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Ошибка подключения:', error.message)
      return false
    }
    
    console.log('✅ Подключение к Supabase успешно!')
    return true
  } catch (err) {
    console.error('❌ Ошибка:', err.message)
    return false
  }
}

async function main() {
  const connected = await testConnection()
  
  if (connected) {
    console.log('\n📝 Настройки для .env файла:')
    console.log(`VITE_SUPABASE_URL=${supabaseUrl}`)
    console.log(`SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}`)
    console.log('\n💡 Для прямого подключения к PostgreSQL получите DATABASE_URL из:')
    console.log('Supabase Dashboard → Settings → Database → Connection string')
  }
  
  process.exit(connected ? 0 : 1)
}

main()
