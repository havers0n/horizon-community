import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTablesInPublic() {
  try {
    console.log('🔧 Создаем таблицы в схеме public...');
    
    // Создаем департаменты в public
    console.log('📋 Создаем департаменты...');
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
      console.error('❌ Ошибка создания департаментов:', deptError);
    } else {
      console.log('✅ Департаменты созданы:', departments);
    }

    // Создаем тестовые BOLO в public
    console.log('🚨 Создаем тестовые BOLO...');
    const { data: bolos, error: boloError } = await supabaseAdmin
      .from('bolos')
      .insert([
        {
          type: 'vehicle',
          description: 'Красный спортивный автомобиль Ferrari',
          vehicle: 'Ferrari F40',
          plate: 'ABC123',
          reason: 'Подозрение в ограблении банка',
          priority: 'high',
          location: 'Downtown Los Santos',
          issued_by: 'Dispatch-1',
          additional_info: 'Водитель вооружен, опасен'
        },
        {
          type: 'person',
          description: 'Подозрительный мужчина в черной одежде',
          reason: 'Подозрение в краже',
          priority: 'medium',
          location: 'Vinewood Hills',
          issued_by: 'Dispatch-2',
          additional_info: 'Рост 180см, темные волосы'
        },
        {
          type: 'vehicle',
          description: 'Белый фургон без номеров',
          vehicle: 'White Van',
          reason: 'Подозрение в похищении',
          priority: 'critical',
          location: 'Grove Street',
          issued_by: 'Dispatch-1',
          additional_info: 'Срочно! Похищен ребенок'
        }
      ])
      .select();

    if (boloError) {
      console.error('❌ Ошибка создания BOLO:', boloError);
    } else {
      console.log('✅ BOLO созданы:', bolos);
    }

    // Создаем тестовые юниты в public
    console.log('🚔 Создаем тестовые юниты...');
    const { data: units, error: unitError } = await supabaseAdmin
      .from('units')
      .insert([
        {
          unit_number: 'DISPATCH-1',
          department_id: 6,
          status: 'available',
          location: { x: 100, y: 200, z: 30 }
        },
        {
          unit_number: 'DISPATCH-2',
          department_id: 6,
          status: 'available',
          location: { x: 150, y: 250, z: 30 }
        },
        {
          unit_number: 'LSPD-1',
          department_id: 1,
          status: 'on_call',
          location: { x: 200, y: 300, z: 30 }
        },
        {
          unit_number: 'BCSO-1',
          department_id: 2,
          status: 'available',
          location: { x: 250, y: 350, z: 30 }
        }
      ])
      .select();

    if (unitError) {
      console.error('❌ Ошибка создания юнитов:', unitError);
    } else {
      console.log('✅ Юниты созданы:', units);
    }

    console.log('🎉 Таблицы в public созданы успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

createTablesInPublic(); 