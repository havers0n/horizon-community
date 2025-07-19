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

// Тестовые пользователи
const testUsers = [
    {
        email: 'test1@example.com',
        password: 'password123',
        username: 'testuser1',
        role: 'candidate',
        rank: 'Cadet',
        division: 'Patrol'
    },
    {
        email: 'supervisor@example.com',
        password: 'password123',
        username: 'supervisor1',
        role: 'supervisor',
        rank: 'Lieutenant',
        division: 'Patrol'
    },
    {
        email: 'admin@example.com',
        password: 'password123',
        username: 'admin1',
        role: 'admin',
        rank: 'Captain',
        division: 'Administration'
    },
    {
        email: 'moderator@example.com',
        password: 'password123',
        username: 'moderator1',
        role: 'moderator',
        rank: 'Sergeant',
        division: 'Internal Affairs'
    },
    {
        email: 'support@example.com',
        password: 'password123',
        username: 'support1',
        role: 'support',
        rank: 'Officer',
        division: 'Support'
    },
    {
        email: 'admin2@example.com',
        password: 'Admin123!',
        username: 'admin_full',
        role: 'admin',
        rank: 'Chief',
        division: 'Administration'
    },
    {
        email: 'guest@example.com',
        password: 'Guest123!',
        username: 'guest_user',
        role: 'candidate',
        rank: 'None',
        division: 'None'
    },
    {
        email: 'user@example.com',
        password: 'User123!',
        username: 'standard_user',
        role: 'member',
        rank: 'Officer',
        division: 'Patrol'
    }
]

async function createTestUsers() {
    console.log('🚀 Создание тестовых пользователей...')
    
    try {
        // Создаем департаменты
        console.log('📁 Создание департаментов...')
        const { data: departments, error: deptError } = await supabase
            .from('departments')
            .upsert([
                { name: 'LSPD', full_name: 'Los Santos Police Department', description: 'Полицейский департамент Лос-Сантоса' },
                { name: 'LSFD', full_name: 'Los Santos Fire Department', description: 'Пожарный департамент Лос-Сантоса' },
                { name: 'LSMC', full_name: 'Los Santos Medical Center', description: 'Медицинский центр Лос-Сантоса' }
            ])
            .select()
        
        if (deptError) {
            console.error('❌ Ошибка создания департаментов:', deptError)
            return
        }
        
        console.log('✅ Департаменты созданы')
        
        // Создаем пользователей в auth.users и users таблице
        for (const user of testUsers) {
            console.log(`👤 Создание пользователя: ${user.username} (${user.email})`)
            
            // Создаем пользователя в auth.users
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true
            })
            
            if (authError) {
                console.error(`❌ Ошибка создания auth пользователя ${user.email}:`, authError)
                continue
            }
            
            console.log(`✅ Auth пользователь создан: ${authData.user.id}`)
            
            // Создаем пользователя в users таблице
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert({
                    username: user.username,
                    email: user.email,
                    password_hash: 'hashed_password', // В реальном приложении должен быть хеш пароля
                    role: user.role,
                    status: 'active',
                    department_id: 1, // LSPD
                    rank: user.rank,
                    division: user.division,
                    auth_id: authData.user.id
                })
                .select()
            
            if (userError) {
                console.error(`❌ Ошибка создания пользователя ${user.username}:`, userError)
                continue
            }
            
            console.log(`✅ Пользователь создан в users таблице: ${userData[0].id}`)
        }
        
        // Создаем тестовые данные
        console.log('📄 Создание тестовых данных...')
        await createTestData()
        
        console.log('🎉 Все тестовые пользователи и данные созданы успешно!')
        
        // Выводим информацию о созданных пользователях
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, username, email, role, status, department_id, rank, division, auth_id')
            .order('id')
        
        if (usersError) {
            console.error('❌ Ошибка получения пользователей:', usersError)
            return
        }
        
        console.log('\n📋 Созданные пользователи:')
        console.table(users)
        
    } catch (error) {
        console.error('❌ Общая ошибка:', error)
    }
}

async function createTestData() {
    try {
        // Создаем тестовые заявки
        const { error: appsError } = await supabase
            .from('applications')
            .insert([
                {
                    author_id: 1,
                    type: 'recruitment',
                    status: 'pending',
                    data: { department: 'LSPD', position: 'Officer', experience: '2 years' }
                },
                {
                    author_id: 1,
                    type: 'promotion',
                    status: 'pending',
                    data: { current_rank: 'Cadet', desired_rank: 'Officer', reason: 'Excellent performance' }
                },
                {
                    author_id: 2,
                    type: 'transfer',
                    status: 'approved',
                    data: { from_department: 'LSPD', to_department: 'LSFD', reason: 'Personal request' }
                }
            ])
        
        if (appsError) {
            console.error('❌ Ошибка создания заявок:', appsError)
        } else {
            console.log('✅ Тестовые заявки созданы')
        }
        
        // Создаем тестовые тикеты поддержки
        const { error: ticketsError } = await supabase
            .from('support_tickets')
            .insert([
                {
                    author_id: 1,
                    status: 'open',
                    handler_id: 5,
                    messages: [{ author: 'testuser1', message: 'Не могу войти в систему', timestamp: new Date().toISOString() }]
                },
                {
                    author_id: 2,
                    status: 'closed',
                    handler_id: 5,
                    messages: [
                        { author: 'supervisor1', message: 'Проблема с отчетами', timestamp: new Date().toISOString() },
                        { author: 'support1', message: 'Проблема решена', timestamp: new Date().toISOString() }
                    ]
                }
            ])
        
        if (ticketsError) {
            console.error('❌ Ошибка создания тикетов:', ticketsError)
        } else {
            console.log('✅ Тестовые тикеты созданы')
        }
        
        // Создаем тестовые уведомления
        const { error: notificationsError } = await supabase
            .from('notifications')
            .insert([
                {
                    recipient_id: 1,
                    content: 'Ваша заявка на трудоустройство находится на рассмотрении',
                    link: '/applications/1',
                    is_read: false
                },
                {
                    recipient_id: 2,
                    content: 'Новая заявка требует вашего внимания',
                    link: '/applications/2',
                    is_read: true
                },
                {
                    recipient_id: 3,
                    content: 'Системное обновление завершено',
                    link: '/dashboard',
                    is_read: false
                }
            ])
        
        if (notificationsError) {
            console.error('❌ Ошибка создания уведомлений:', notificationsError)
        } else {
            console.log('✅ Тестовые уведомления созданы')
        }
        
        // Создаем тестовый тест
        const { error: testsError } = await supabase
            .from('tests')
            .insert([
                {
                    title: 'Базовый тест для кандидатов LSPD',
                    related_to: { department: 'LSPD', position: 'Officer' },
                    duration_minutes: 30,
                    questions: [
                        {
                            question: 'Что такое Miranda Rights?',
                            options: ['Права подозреваемого', 'Права офицера', 'Права свидетеля'],
                            correct: 0
                        },
                        {
                            question: 'Максимальная скорость в городе?',
                            options: ['50 mph', '60 mph', '70 mph'],
                            correct: 0
                        }
                    ]
                }
            ])
        
        if (testsError) {
            console.error('❌ Ошибка создания тестов:', testsError)
        } else {
            console.log('✅ Тестовые тесты созданы')
        }
        
    } catch (error) {
        console.error('❌ Ошибка создания тестовых данных:', error)
    }
}

// Функция для удаления всех тестовых данных
async function cleanupTestData() {
    console.log('🧹 Очистка тестовых данных...')
    
    try {
        // Удаляем всех пользователей из auth.users
        const { data: users } = await supabase.from('users').select('auth_id')
        
        for (const user of users || []) {
            await supabase.auth.admin.deleteUser(user.auth_id)
        }
        
        console.log('✅ Тестовые данные очищены')
    } catch (error) {
        console.error('❌ Ошибка очистки:', error)
    }
}

// Проверяем аргументы командной строки
const command = process.argv[2]

if (command === 'create') {
    createTestUsers()
} else if (command === 'cleanup') {
    cleanupTestData()
} else {
    console.log('Использование:')
    console.log('  node scripts/create_test_users.js create   - создать тестовых пользователей')
    console.log('  node scripts/create_test_users.js cleanup  - удалить всех тестовых пользователей')
}
