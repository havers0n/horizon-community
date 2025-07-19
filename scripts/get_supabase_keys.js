import { execSync } from 'child_process'

try {
    const output = execSync('npx supabase status', { encoding: 'utf8' })
    
    // Извлекаем JWT secret из вывода
    const jwtSecretMatch = output.match(/JWT secret: (.+)/)
    const jwtSecret = jwtSecretMatch ? jwtSecretMatch[1] : null
    
    if (jwtSecret) {
        console.log('JWT_SECRET=' + jwtSecret)
    }
    
    // Для получения полных ключей нужно использовать другой подход
    // Давайте попробуем получить их через docker
    console.log('\n📝 Для получения полных ключей выполните команды:')
    console.log('1. Откройте Supabase Studio: http://localhost:54323')
    console.log('2. Перейдите в Settings -> API')
    console.log('3. Скопируйте anon и service_role ключи')
    
} catch (error) {
    console.error('Ошибка получения ключей:', error.message)
}
