import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSimpleDepartments() {
  try {
    console.log('🔧 Создаем простую таблицу departments...');
    
    // Попробуем создать таблицу через insert (если она не существует, получим ошибку)
    console.log('📋 Пытаемся создать департаменты...');
    const { data: departments, error: deptError } = await supabaseAdmin
      .from('departments')
      .insert([
        {
          id: 1,
          name: 'LSPD',
          full_name: 'Los Santos Police Department',
          description: 'Департамент полиции Лос-Сантоса'
        },
        {
          id: 2,
          name: 'BCSO',
          full_name: 'Blaine County Sheriff\'s Office',
          description: 'Офис шерифа округа Блейн'
        },
        {
          id: 3,
          name: 'SAHP',
          full_name: 'San Andreas Highway Patrol',
          description: 'Дорожная полиция Сан-Андреас'
        },
        {
          id: 4,
          name: 'LSFD',
          full_name: 'Los Santos Fire Department',
          description: 'Пожарная служба Лос-Сантоса'
        },
        {
          id: 5,
          name: 'EMS',
          full_name: 'Emergency Medical Services',
          description: 'Служба скорой медицинской помощи'
        },
        {
          id: 6,
          name: 'Dispatch',
          full_name: 'Emergency Dispatch Center',
          description: 'Центр экстренной диспетчеризации'
        }
      ])
      .select();

    if (deptError) {
      console.log('❌ Ошибка создания департаментов:', deptError.message);
      console.log('ℹ️ Возможно, таблица departments не существует');
      
      // Попробуем создать таблицу через SQL
      console.log('🔧 Пытаемся создать таблицу departments...');
      const { data: sqlResult, error: sqlError } = await supabaseAdmin
        .rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.departments (
              id SERIAL PRIMARY KEY,
              name TEXT NOT NULL,
              full_name TEXT NOT NULL,
              logo_url TEXT,
              description TEXT,
              gallery TEXT[] DEFAULT '{}'
            );
          `
        });

      if (sqlError) {
        console.log('❌ Ошибка создания таблицы через SQL:', sqlError.message);
        console.log('ℹ️ Функция exec_sql недоступна');
      } else {
        console.log('✅ Таблица departments создана через SQL');
        
        // Теперь попробуем вставить данные
        const { data: insertResult, error: insertError } = await supabaseAdmin
          .from('departments')
          .insert([
            {
              id: 1,
              name: 'LSPD',
              full_name: 'Los Santos Police Department',
              description: 'Департамент полиции Лос-Сантоса'
            },
            {
              id: 2,
              name: 'BCSO',
              full_name: 'Blaine County Sheriff\'s Office',
              description: 'Офис шерифа округа Блейн'
            },
            {
              id: 3,
              name: 'SAHP',
              full_name: 'San Andreas Highway Patrol',
              description: 'Дорожная полиция Сан-Андреас'
            },
            {
              id: 4,
              name: 'LSFD',
              full_name: 'Los Santos Fire Department',
              description: 'Пожарная служба Лос-Сантоса'
            },
            {
              id: 5,
              name: 'EMS',
              full_name: 'Emergency Medical Services',
              description: 'Служба скорой медицинской помощи'
            },
            {
              id: 6,
              name: 'Dispatch',
              full_name: 'Emergency Dispatch Center',
              description: 'Центр экстренной диспетчеризации'
            }
          ])
          .select();

        if (insertError) {
          console.log('❌ Ошибка вставки данных:', insertError.message);
        } else {
          console.log('✅ Департаменты созданы:', insertResult);
        }
      }
    } else {
      console.log('✅ Департаменты созданы:', departments);
    }

    console.log('🎉 Создание департаментов завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

createSimpleDepartments(); 