import 'dotenv/config';

console.log('🔍 Testing environment variables...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Found' : '❌ Not found');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Found' : '❌ Not found');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Not found');

if (process.env.SUPABASE_URL) {
  console.log('📡 Supabase URL:', process.env.SUPABASE_URL);
} 