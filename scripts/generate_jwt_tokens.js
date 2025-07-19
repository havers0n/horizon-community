import jwt from 'jsonwebtoken'

const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long'

// Генерируем anon ключ
const anonPayload = {
    iss: 'supabase',
    ref: 'RolePlayIdentity',
    role: 'anon',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 лет
}

// Генерируем service_role ключ
const servicePayload = {
    iss: 'supabase',
    ref: 'RolePlayIdentity',
    role: 'service_role',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 лет
}

try {
    const anonToken = jwt.sign(anonPayload, JWT_SECRET)
    const serviceToken = jwt.sign(servicePayload, JWT_SECRET)
    
    console.log('🔑 Сгенерированные JWT токены для локального Supabase:')
    console.log('\n📄 Добавьте эти значения в ваш .env файл:')
    console.log('\n# Supabase Configuration')
    console.log('SUPABASE_URL=http://localhost:54321')
    console.log('SUPABASE_ANON_KEY=' + anonToken)
    console.log('SUPABASE_SERVICE_ROLE_KEY=' + serviceToken)
    console.log('JWT_SECRET=' + JWT_SECRET)
    
    console.log('\n# Vite Configuration (для клиента)')
    console.log('VITE_SUPABASE_URL=http://localhost:54321')
    console.log('VITE_SUPABASE_ANON_KEY=' + anonToken)
    
} catch (error) {
    console.error('❌ Ошибка генерации токенов:', error.message)
}
