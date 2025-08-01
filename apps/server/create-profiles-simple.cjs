require('dotenv').config();
const { Pool } = require('pg');

// Конфигурация подключения к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/roleplay_identity',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createProfilesTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Создание таблицы public.profiles...');

    // Удаляем старую таблицу если она существует
    await client.query('DROP TABLE IF EXISTS public.profiles CASCADE');
    console.log('✅ Старая таблица profiles удалена');

    // Создаем новую таблицу
    await client.query(`
      CREATE TABLE public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auth_id UUID UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        department_id INTEGER,
        badge_number VARCHAR(50),
        phone VARCHAR(20),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Таблица public.profiles создана');

    // Создаем индексы
    await client.query('CREATE INDEX idx_profiles_auth_id ON public.profiles(auth_id)');
    await client.query('CREATE INDEX idx_profiles_email ON public.profiles(email)');
    await client.query('CREATE INDEX idx_profiles_role ON public.profiles(role)');
    console.log('✅ Индексы созданы');

    // Создаем триггер для updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await client.query(`
      CREATE TRIGGER update_profiles_updated_at 
          BEFORE UPDATE ON public.profiles 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Триггер updated_at создан');

    // Включаем RLS
    await client.query('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY');
    console.log('✅ RLS включен');

    // Создаем политики
    await client.query(`
      CREATE POLICY "Users can view own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = auth_id)
    `);

    await client.query(`
      CREATE POLICY "Users can update own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = auth_id)
    `);

    await client.query(`
      CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
          FOR INSERT WITH CHECK (auth.role() = 'authenticated')
    `);
    console.log('✅ Политики RLS созданы');

    // Создаем функцию для автоматического создания профиля
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO public.profiles (auth_id, email, first_name, last_name, role)
          VALUES (
              NEW.id,
              NEW.email,
              COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
              COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
              COALESCE(NEW.raw_user_meta_data->>'role', 'user')
          );
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER
    `);

    // Создаем триггер для автоматического создания профиля
    await client.query(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users
    `);
    
    await client.query(`
      CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
    `);
    console.log('✅ Триггер для автоматического создания профиля создан');

    // Проверяем результат
    const checkResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profiles'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Таблица public.profiles успешно создана и настроена');
      
      const countResult = await client.query('SELECT COUNT(*) FROM public.profiles');
      console.log(`📊 Количество записей в profiles: ${countResult.rows[0].count}`);
    }

  } catch (error) {
    console.error('❌ Ошибка при создании таблицы:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запускаем создание
if (require.main === module) {
  createProfilesTable()
    .then(() => {
      console.log('✅ Создание таблицы завершено успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка создания:', error);
      process.exit(1);
    });
}

module.exports = { createProfilesTable }; 