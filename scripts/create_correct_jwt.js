import jwt from 'jsonwebtoken'

// Точные параметры из Supabase контейнера
const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long'
const JWT_ISSUER = 'http://localhost:54321/auth/v1'
const JWT_AUD = 'authenticated'

// Генерируем anon ключ
const anonPayload = {
    iss: JWT_ISSUER,
    sub: 'anon',
    aud: JWT_AUD,
    role: 'anon',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 лет
}

// Генерируем service_role ключ
const servicePayload = {
    iss: JWT_ISSUER,
    sub: 'service_role',
    aud: JWT_AUD,
    role: 'service_role',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 лет
}

try {
    const anonToken = jwt.sign(anonPayload, JWT_SECRET)
    const serviceToken = jwt.sign(servicePayload, JWT_SECRET)
    
    console.log('🔑 Правильные JWT токены для локального Supabase:')
    console.log('\n# Обновите ваш .env файл:')
    console.log('SUPABASE_URL=http://localhost:54321')
    console.log('SUPABASE_ANON_KEY=' + anonToken)
    console.log('SUPABASE_SERVICE_ROLE_KEY=' + serviceToken)
    console.log('JWT_SECRET=' + JWT_SECRET)
    console.log('\nVITE_SUPABASE_URL=http://localhost:54321')
    console.log('VITE_SUPABASE_ANON_KEY=' + anonToken)
    
    // Проверяем валидность токенов
    const decodedAnon = jwt.verify(anonToken, JWT_SECRET)
    const decodedService = jwt.verify(serviceToken, JWT_SECRET)
    
    console.log('\n✅ Токены валидны!')
    console.log('Anon token payload:', JSON.stringify(decodedAnon, null, 2))
    console.log('Service token payload:', JSON.stringify(decodedService, null, 2))
    
} catch (error) {
    console.error('❌ Ошибка создания токенов:', error.message)
}
