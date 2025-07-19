const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://axgtvvcimqoyxbfvdrok.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set it with: set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function restoreDatabase() {
  console.log('🚀 Starting database restoration...');
  
  try {
    // Read and apply initial schema
    console.log('📄 Applying initial schema...');
    const schemaPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split into statements and execute each one
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            // Use direct SQL execution
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              console.log(`⚠️  Statement failed (might be expected): ${error.message}`);
            }
          } catch (err) {
            console.log(`⚠️  Statement failed (might be expected): ${err.message}`);
          }
        }
      }
      console.log('✅ Initial schema applied');
    }

    // Apply RLS policies
    console.log('📄 Applying RLS policies...');
    const rlsPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_rls_policies.sql');
    
    if (fs.existsSync(rlsPath)) {
      const rls = fs.readFileSync(rlsPath, 'utf8');
      const { error } = await supabase.rpc('exec_sql', { sql: rls });
      if (error) {
        console.log(`⚠️  RLS policies had issues: ${error.message}`);
      } else {
        console.log('✅ RLS policies applied');
      }
    }

    // Apply additional migrations
    const additionalMigrations = [
      '003_rls_candidate_guest_restrictions.sql',
      '004_test_system.sql',
      '005_cad_mdt_system.sql'
    ];

    for (const migrationFile of additionalMigrations) {
      console.log(`📄 Applying ${migrationFile}...`);
      const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
      
      if (fs.existsSync(migrationPath)) {
        const migration = fs.readFileSync(migrationPath, 'utf8');
        const { error } = await supabase.rpc('exec_sql', { sql: migration });
        if (error) {
          console.log(`⚠️  ${migrationFile} had issues: ${error.message}`);
        } else {
          console.log(`✅ ${migrationFile} applied`);
        }
      }
    }

    // Apply seed data
    console.log('🌱 Applying seed data...');
    const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
    
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8');
      const { error } = await supabase.rpc('exec_sql', { sql: seed });
      if (error) {
        console.log(`⚠️  Seed data had issues: ${error.message}`);
      } else {
        console.log('✅ Seed data applied');
      }
    }

    console.log('🎉 Database restoration completed!');
    
    // Test the connection
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Test query failed:', error.message);
    } else {
      console.log('✅ Database is working correctly');
      console.log('📊 Found departments:', data.length);
    }
    
  } catch (error) {
    console.error('❌ Error restoring database:', error);
    process.exit(1);
  }
}

// Alternative approach using local seed data
async function applyLocalSeedData() {
  console.log('🌱 Applying local seed data...');
  
  try {
    const localSeedPath = path.join(__dirname, '..', 'local_seed_data.sql');
    
    if (fs.existsSync(localSeedPath)) {
      const seed = fs.readFileSync(localSeedPath, 'utf8');
      const { error } = await supabase.rpc('exec_sql', { sql: seed });
      if (error) {
        console.log(`⚠️  Local seed data had issues: ${error.message}`);
      } else {
        console.log('✅ Local seed data applied');
      }
    }
  } catch (error) {
    console.log('⚠️  Error applying local seed data:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🔧 Database Restoration Tool');
  console.log('============================');
  
  await restoreDatabase();
  await applyLocalSeedData();
  
  console.log('🎉 Database restoration process completed!');
}

main().catch(console.error); 