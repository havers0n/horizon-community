import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addAdminUser() {
  const userData = {
    username: 'admin',
    email: 'admin@horizon.com',
    password_hash: '', // Not needed with Supabase Auth
    role: 'admin',
    status: 'active',
    game_warnings: 0,
    admin_warnings: 0,
    auth_id: '0452cdb0-60c6-4dc6-8a83-9d89e8955eaf'
  };
  
  console.log('Adding admin user to database...\n');
  
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding user:', error);
  } else {
    console.log('User added successfully:', data);
  }
}

addAdminUser().catch(console.error);
