import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Applying database migrations safely...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Check if we're connecting to Supabase
const isSupabaseConnection = process.env.DATABASE_URL?.includes('supabase.com') || 
                            process.env.DATABASE_URL?.includes('aws-0-eu-north-1.pooler.supabase.com');

console.log('Supabase connection:', isSupabaseConnection ? 'Yes' : 'No');

console.trace("Creating PG Pool here");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isSupabaseConnection ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ...(isSupabaseConnection && {
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  })
});

async function executeStatement(client, statement) {
  try {
    await client.query(statement);
    return true;
  } catch (error) {
    // Ignore errors for already existing objects
    if (error.code === '42710' || // duplicate_object
        error.code === '42P07' || // duplicate_table
        error.code === '42701' || // duplicate_column
        error.code === '42723' || // duplicate_function
        error.message.includes('already exists') ||
        error.message.includes('duplicate key')) {
      console.log(`  ⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`);
      return true;
    } else {
      console.error(`  ❌ Error: ${error.message}`);
      console.error(`  Statement: ${statement.substring(0, 100)}...`);
      throw error;
    }
  }
}

async function applyMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to database');
    
    // Create migrations table if it doesn't exist
    await executeStatement(client, `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Get list of migration files
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_rls_policies.sql',
      '003_rls_candidate_guest_restrictions.sql',
      '004_test_system.sql',
      '005_cad_mdt_system.sql',
      '006_joint_positions_history.sql',
      '007_update_departments.sql',
      '008_complete_character_system.sql',
      '009_setup_rls_policies.sql',
      '010_report_templates_system.sql',
      '011_enhanced_report_templates.sql',
      '012_add_template_status.sql'
    ];
    
    // Get applied migrations
    const { rows: appliedMigrations } = await client.query(
      'SELECT name FROM migrations ORDER BY id'
    );
    const appliedMigrationNames = appliedMigrations.map(row => row.name);
    
    console.log('Applied migrations:', appliedMigrationNames);
    
    // Apply pending migrations
    for (const migrationFile of migrationFiles) {
      if (!appliedMigrationNames.includes(migrationFile)) {
        console.log(`🔄 Applying migration: ${migrationFile}`);
        
        try {
          const migrationPath = join(process.cwd(), 'supabase', 'migrations', migrationFile);
          const migrationSQL = readFileSync(migrationPath, 'utf8');
          
          // Split SQL by semicolons and execute each statement
          const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
          
          for (const statement of statements) {
            if (statement.trim()) {
              await executeStatement(client, statement);
            }
          }
          
          // Mark migration as applied
          await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [migrationFile]
          );
          
          console.log(`✅ Applied migration: ${migrationFile}`);
        } catch (error) {
          console.error(`❌ Failed to apply migration ${migrationFile}:`, error.message);
          throw error;
        }
      } else {
        console.log(`⏭️  Skipping already applied migration: ${migrationFile}`);
      }
    }
    
    console.log('✅ All migrations applied successfully');
    
    // Verify cad_token column exists
    const { rows: columns } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'cad_token'
    `);
    
    if (columns.length === 0) {
      console.log('⚠️  cad_token column not found, adding it manually...');
      await executeStatement(client, 'ALTER TABLE users ADD COLUMN IF NOT EXISTS cad_token TEXT UNIQUE');
      console.log('✅ Added cad_token column');
    } else {
      console.log('✅ cad_token column exists');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigrations()
  .then(() => {
    console.log('🎉 Database migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database migrations failed:', error);
    process.exit(1);
  }); 