// Отключаем проверку TLS сертификатов для тестирования
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function testAuth() {
  console.log('🔍 Testing Supabase authentication...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found');
    return;
  }
  
  console.log('📡 Supabase URL:', supabaseUrl);
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Попробуем залогиниться
    console.log('🔐 Attempting to sign in...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'danypetrov2000@gmail.com',
      password: 'danypetrov2000'
    });
    
    if (error) {
      console.error('❌ Sign in failed:', error.message);
      return;
    }
    
    console.log('✅ Sign in successful!');
    console.log('👤 User ID:', data.user.id);
    console.log('📧 Email:', data.user.email);
    
    // Теперь попробуем получить пользователя из базы данных
    console.log('🔍 Getting user from database...');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();
    
    if (userError) {
      console.error('❌ Error getting user from database:', userError.message);
      return;
    }
    
    if (userData) {
      console.log('✅ User found in database!');
      console.log('👤 Username:', userData.username);
      console.log('🎭 Role:', userData.role);
      console.log('📊 Status:', userData.status);
    } else {
      console.log('⚠️ User not found in database');
    }
    
    console.log('✅ Authentication test completed successfully!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error('🔍 Error details:', error);
  }
}

testAuth().catch(console.error); 