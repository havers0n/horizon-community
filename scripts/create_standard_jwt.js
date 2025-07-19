import jwt from 'jsonwebtoken'

// Стандартные значения для локального Supabase
const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long'

// Создаем токены в стандартном формате Supabase
const createSupabaseJWT = (role, secret) => {
    const payload = {
        iss: 'supabase-demo',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60), // 10 лет
        role: role
    }
    
    return jwt.sign(payload, secret)
}

// Создаем токены
const anonKey = createSupabaseJWT('anon', JWT_SECRET)
const serviceRoleKey = createSupabaseJWT('service_role', JWT_SECRET)

console.log('🔑 Стандартные JWT токены для локального Supabase:')
console.log('\n# Скопируйте эти значения в ваш .env файл:')
console.log('SUPABASE_URL=http://localhost:54321')
console.log('SUPABASE_ANON_KEY=' + anonKey)
console.log('SUPABASE_SERVICE_ROLE_KEY=' + serviceRoleKey)
console.log('JWT_SECRET=' + JWT_SECRET)
console.log('\nVITE_SUPABASE_URL=http://localhost:54321')
console.log('VITE_SUPABASE_ANON_KEY=' + anonKey)

// Проверим токены
console.log('\n🔍 Проверка токенов:')
try {
    const decodedAnon = jwt.verify(anonKey, JWT_SECRET)
    const decodedService = jwt.verify(serviceRoleKey, JWT_SECRET)
    console.log('✅ Anon token:', decodedAnon)
    console.log('✅ Service token:', decodedService)
} catch (error) {
    console.error('❌ Ошибка проверки:', error.message)
}
