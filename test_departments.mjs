// Тестовый скрипт для проверки API департаментов (ES модуль)
import { createClient } from '@supabase/supabase-js';

// Конфигурация Supabase
const supabaseUrl = 'https://axgtvvcimqoyxbfvdrok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAzMTE3MTcsImV4cCI6MjAzNTg4NzcxN30.RNqE8LJgLDqjhOjlJuWkQRcXPZP8VNxJ4YYJrfJNwwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseDepartments() {
  console.log('🔍 Тестирование RPC функции напрямую в Supabase...');
  
  try {
    // Тест 1: Проверяем RPC функцию
    console.log('\n1️⃣ Тестируем RPC функцию get_all_departments...');
    const { data, error } = await supabase.rpc('get_all_departments');
    
    if (error) {
      console.error('❌ Ошибка RPC функции:', error);
      return;
    }
    
    console.log('✅ RPC функция выполнена успешно');
    console.log('Количество департаментов:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('Первый департамент:', data[0]);
      console.log('Все департаменты:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ RPC функция возвращает пустой массив');
    }
    
  } catch (error) {
    console.error('❌ Исключение при вызове RPC:', error);
  }
  
  try {
    // Тест 2: Проверяем прямую таблицу
    console.log('\n2️⃣ Тестируем прямую таблицу common.departments...');
    const { data: directData, error: directError } = await supabase
      .from('common.departments')
      .select('*');
    
    if (directError) {
      console.error('❌ Ошибка прямого запроса:', directError);
      return;
    }
    
    console.log('✅ Прямой запрос выполнен успешно');
    console.log('Количество департаментов в таблице:', directData?.length || 0);
    
    if (directData && directData.length > 0) {
      console.log('Первый департамент из таблицы:', directData[0]);
    } else {
      console.log('❌ Таблица пустая');
    }
    
  } catch (error) {
    console.error('❌ Исключение при прямом запросе:', error);
  }
}

testSupabaseDepartments(); 