import jwt from 'jsonwebtoken'
import { execSync } from 'child_process'

// Получаем JWT secret из Supabase
try {
    const output = execSync('npx supabase status', { encoding: 'utf8' })
    const jwtSecretMatch = output.match(/JWT secret: (.+)/)
    const JWT_SECRET = jwtSecretMatch ? jwtSecretMatch[1].trim() : null
    
    if (!JWT_SECRET) {
        throw new Error('Не удалось извлечь JWT secret из Supabase')
    }
    
    console.log('✅ JWT Secret найден:', JWT_SECRET)
    
    // Генерируем anon ключ с правильными параметрами
    const anonPayload = {
        iss: 'supabase',
        ref: 'localhost',
        role: 'anon',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 лет
    }
    
    // Генерируем service_role ключ с правильными параметрами
    const servicePayload = {
        iss: 'supabase',
        ref: 'localhost',
        role: 'service_role',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 лет
    }
    
    const anonToken = jwt.sign(anonPayload, JWT_SECRET)
    const serviceToken = jwt.sign(servicePayload, JWT_SECRET)
    
    console.log('\n🔑 Новые JWT токены:')
    console.log('\n# Обновите ваш .env файл:')
    console.log('SUPABASE_URL=http://localhost:54321')
    console.log('SUPABASE_ANON_KEY=' + anonToken)
    console.log('SUPABASE_SERVICE_ROLE_KEY=' + serviceToken)
    console.log('JWT_SECRET=' + JWT_SECRET)
    console.log('\nVITE_SUPABASE_URL=http://localhost:54321')
    console.log('VITE_SUPABASE_ANON_KEY=' + anonToken)
    
    // Проверяем валидность токенов
    try {
        const decodedAnon = jwt.verify(anonToken, JWT_SECRET)
        const decodedService = jwt.verify(serviceToken, JWT_SECRET)
        console.log('\n✅ Токены валидны')
        console.log('Anon role:', decodedAnon.role)
        console.log('Service role:', decodedService.role)
    } catch (verifyError) {
        console.error('❌ Ошибка проверки токенов:', verifyError.message)
    }
    
} catch (error) {
    console.error('❌ Ошибка:', error.message)
}
