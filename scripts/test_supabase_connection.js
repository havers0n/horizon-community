import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔗 Тестируем подключение к Supabase...')
console.log('URL:', supabaseUrl)
console.log('Service Key (first 20 chars):', supabaseServiceKey?.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function testConnection() {
    try {
        // Тестируем простой запрос к таблице departments
        console.log('\n📊 Тестируем запрос к таблице departments...')
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .limit(5)
        
        if (error) {
            console.error('❌ Ошибка запроса:', error)
        } else {
            console.log('✅ Подключение успешно!')
            console.log('Данные:', data)
        }
        
    } catch (error) {
        console.error('❌ Общая ошибка:', error.message)
    }
}

testConnection()
