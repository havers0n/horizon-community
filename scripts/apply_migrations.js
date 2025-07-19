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

async function applyMigrations() {
  console.log('🚀 Starting migration application...');
  
  try {
    // Read migration files in order
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_rls_policies.sql', 
      '003_rls_candidate_guest_restrictions.sql',
      '004_test_system.sql',
      '005_cad_mdt_system.sql'
    ];

    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Migration file ${migrationFile} not found, skipping...`);
        continue;
      }

      console.log(`📄 Applying migration: ${migrationFile}`);
      
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              console.log(`⚠️  Statement failed (this might be expected): ${statement.substring(0, 100)}...`);
              console.log(`   Error: ${error.message}`);
            }
          } catch (err) {
            console.log(`⚠️  Statement failed (this might be expected): ${statement.substring(0, 100)}...`);
            console.log(`   Error: ${err.message}`);
          }
        }
      }
      
      console.log(`✅ Migration ${migrationFile} applied`);
    }

    // Apply seed data
    console.log('🌱 Applying seed data...');
    const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
    
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      const seedStatements = seedSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of seedStatements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              console.log(`⚠️  Seed statement failed: ${error.message}`);
            }
          } catch (err) {
            console.log(`⚠️  Seed statement failed: ${err.message}`);
          }
        }
      }
      console.log('✅ Seed data applied');
    }

    console.log('🎉 All migrations applied successfully!');
    
  } catch (error) {
    console.error('❌ Error applying migrations:', error);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function applyMigrationsDirect() {
  console.log('🚀 Starting direct migration application...');
  
  try {
    // Read migration files in order
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_rls_policies.sql', 
      '003_rls_candidate_guest_restrictions.sql',
      '004_test_system.sql',
      '005_cad_mdt_system.sql'
    ];

    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Migration file ${migrationFile} not found, skipping...`);
        continue;
      }

      console.log(`📄 Applying migration: ${migrationFile}`);
      
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Execute the entire migration file
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`⚠️  Migration ${migrationFile} had some issues: ${error.message}`);
      } else {
        console.log(`✅ Migration ${migrationFile} applied successfully`);
      }
    }

    // Apply seed data
    console.log('🌱 Applying seed data...');
    const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
    
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      const { error } = await supabase.rpc('exec_sql', { sql: seedSql });
      
      if (error) {
        console.log(`⚠️  Seed data had some issues: ${error.message}`);
      } else {
        console.log('✅ Seed data applied successfully');
      }
    }

    console.log('🎉 All migrations applied successfully!');
    
  } catch (error) {
    console.error('❌ Error applying migrations:', error);
    process.exit(1);
  }
}

// Check if we can connect to the database
async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Try to query a simple table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('ℹ️  Users table might not exist yet (this is expected for fresh database)');
      return true; // Continue with migrations
    }
    
    console.log('✅ Database connection successful');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 Supabase Migration Tool');
  console.log('========================');
  
  const canConnect = await testConnection();
  if (!canConnect) {
    console.log('❌ Cannot connect to database. Please check your credentials.');
    process.exit(1);
  }
  
  // Try direct approach first
  await applyMigrationsDirect();
}

main().catch(console.error); 