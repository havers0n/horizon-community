import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
    process.exit(1)
}

// Создаем клиент Supabase с service role ключом
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function checkExistingUsers() {
    console.log('🔍 Проверка существующих пользователей в системе...\n')
    
    try {
        // Получаем всех пользователей из таблицы users
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, email, role, status, department_id, rank, division, created_at')
            .order('id')
        
        if (error) {
            console.error('❌ Ошибка получения пользователей:', error)
            return
        }
        
        if (!users || users.length === 0) {
            console.log('📭 В системе нет пользователей')
            return
        }
        
        console.log(`📊 Найдено пользователей: ${users.length}\n`)
        
        // Группируем пользователей по ролям
        const usersByRole = users.reduce((acc, user) => {
            if (!acc[user.role]) {
                acc[user.role] = []
            }
            acc[user.role].push(user)
            return acc
        }, {})
        
        // Выводим пользователей по ролям
        for (const [role, roleUsers] of Object.entries(usersByRole)) {
            console.log(`\n👥 Роль: ${role.toUpperCase()} (${roleUsers.length} пользователей)`)
            console.log('━'.repeat(50))
            
            roleUsers.forEach(user => {
                console.log(`  📧 ${user.email}`)
                console.log(`     • Username: ${user.username}`)
                console.log(`     • ID: ${user.id}`)
                console.log(`     • Status: ${user.status}`)
                console.log(`     • Department: ${user.department_id || 'N/A'}`)
                console.log(`     • Rank: ${user.rank || 'N/A'}`)
                console.log(`     • Division: ${user.division || 'N/A'}`)
                console.log(`     • Created: ${new Date(user.created_at).toLocaleDateString()}`)
                console.log()
            })
        }
        
        // Выводим сводку
        console.log('\n📋 СВОДКА:')
        console.log('━'.repeat(50))
        console.log('Пользователи по ролям:')
        for (const [role, roleUsers] of Object.entries(usersByRole)) {
            console.log(`  • ${role}: ${roleUsers.length}`)
        }
        
        // Проверяем дублирующиеся email
        const emailCount = {}
        users.forEach(user => {
            emailCount[user.email] = (emailCount[user.email] || 0) + 1
        })
        
        const duplicates = Object.entries(emailCount).filter(([email, count]) => count > 1)
        if (duplicates.length > 0) {
            console.log('\n⚠️  ВНИМАНИЕ: Найдены дублирующиеся email адреса:')
            duplicates.forEach(([email, count]) => {
                console.log(`  • ${email}: ${count} раз`)
            })
        } else {
            console.log('\n✅ Дублирующихся email адресов не найдено')
        }
        
        // Проверяем наличие обязательных пользователей из задания
        console.log('\n🎯 Проверка пользователей из списка:')
        console.log('━'.repeat(50))
        const requiredUsers = [
            { email: 'admin@example.com', role: 'admin' },
            { email: 'test1@example.com', role: 'candidate' },
            { email: 'supervisor@example.com', role: 'supervisor' },
            { email: 'moderator@example.com', role: 'moderator' },
            { email: 'support@example.com', role: 'support' }
        ]
        
        requiredUsers.forEach(({ email, role }) => {
            const user = users.find(u => u.email === email)
            if (user) {
                if (user.role === role) {
                    console.log(`✅ ${email} (${role}) - существует`)
                } else {
                    console.log(`⚠️  ${email} - существует, но с ролью '${user.role}' вместо '${role}'`)
                }
            } else {
                console.log(`❌ ${email} (${role}) - НЕ существует`)
            }
        })
        
    } catch (error) {
        console.error('❌ Общая ошибка:', error)
    }
}

// Запускаем проверку
checkExistingUsers()
