import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDepartmentsPublic() {
  try {
    console.log('🔍 Проверяем департаменты в схеме public...');
    
    const { data: departments, error } = await supabaseAdmin
      .from('departments')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('❌ Ошибка получения департаментов:', error);
      return;
    }
    
    console.log('📋 Департаменты в базе данных:');
    departments.forEach(dept => {
      console.log(`  ID: ${dept.id}, Name: ${dept.name}, Full Name: ${dept.full_name}`);
    });
    
    // Ищем диспетчерский департамент
    const dispatchDept = departments.find(d => 
      d.name.toLowerCase().includes('dispatch') || 
      d.full_name.toLowerCase().includes('диспетчер')
    );
    
    if (dispatchDept) {
      console.log(`✅ Найден диспетчерский департамент: ID ${dispatchDept.id}`);
    } else {
      console.log('❌ Диспетчерский департамент не найден');
      console.log('🔧 Создаем диспетчерский департамент...');
      
      const { data: newDept, error: createError } = await supabaseAdmin
        .from('departments')
        .insert({
          name: 'Dispatch',
          full_name: 'Диспетчерская служба',
          description: 'Центр управления экстренными службами',
          logo_url: 'https://example.com/dispatch_logo.png',
          gallery: []
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Ошибка создания департамента:', createError);
        return;
      }
      
      console.log('✅ Диспетчерский департамент создан:', newDept);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkDepartmentsPublic(); 