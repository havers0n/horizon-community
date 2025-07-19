import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
  const email = 'admin@horizon.com';
  const authId = '0452cdb0-60c6-4dc6-8a83-9d89e8955eaf';
  
  console.log('Checking user in database...\n');
  
  // Check by email
  const { data: userByEmail, error: emailError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (emailError && emailError.code !== 'PGRST116') {
    console.error('Error finding user by email:', emailError);
  } else if (userByEmail) {
    console.log('User found by email:', userByEmail);
  } else {
    console.log('User NOT found by email');
  }
  
  console.log('\n---\n');
  
  // Check by auth_id
  const { data: userByAuthId, error: authIdError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single();
  
  if (authIdError && authIdError.code !== 'PGRST116') {
    console.error('Error finding user by auth_id:', authIdError);
  } else if (userByAuthId) {
    console.log('User found by auth_id:', userByAuthId);
  } else {
    console.log('User NOT found by auth_id');
  }
  
  console.log('\n---\n');
  
  // Get all users to see what's in the table
  const { data: allUsers, error: allError } = await supabase
    .from('users')
    .select('id, username, email, auth_id, role')
    .limit(10);
  
  if (allError) {
    console.error('Error getting all users:', allError);
  } else {
    console.log('All users in database:');
    console.table(allUsers);
  }
}

checkUser().catch(console.error);
