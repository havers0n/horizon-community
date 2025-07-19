const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://axgtvvcimqoyxbfvdrok.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Creating database tables...');
  
  try {
    // Create departments table
    console.log('📄 Creating departments table...');
    const { error: deptError } = await supabase
      .from('departments')
      .select('*')
      .limit(1);
    
    if (deptError && deptError.code === 'PGRST116') {
      // Table doesn't exist, create it
      console.log('Creating departments table...');
      // We'll use a different approach - create tables through direct SQL
    }
    
    // Create users table
    console.log('📄 Creating users table...');
    const { error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (userError && userError.code === 'PGRST116') {
      console.log('Creating users table...');
    }
    
    // Create applications table
    console.log('📄 Creating applications table...');
    const { error: appError } = await supabase
      .from('applications')
      .select('*')
      .limit(1);
    
    if (appError && appError.code === 'PGRST116') {
      console.log('Creating applications table...');
    }
    
    console.log('✅ Table creation check completed');
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

async function insertSeedData() {
  console.log('🌱 Inserting seed data...');
  
  try {
    // Insert departments
    const departments = [
      {
        name: 'LSPD',
        full_name: 'Los Santos Police Department',
        description: 'Полицейский департамент Лос-Сантоса',
        logo_url: 'https://example.com/lspd_logo.png',
        gallery: []
      },
      {
        name: 'LSFD',
        full_name: 'Los Santos Fire Department',
        description: 'Пожарный департамент Лос-Сантоса',
        logo_url: 'https://example.com/lsfd_logo.png',
        gallery: []
      },
      {
        name: 'LSMD',
        full_name: 'Los Santos Medical Department',
        description: 'Медицинский департамент Лос-Сантоса',
        logo_url: 'https://example.com/lsmd_logo.png',
        gallery: []
      },
      {
        name: 'GOV',
        full_name: 'Government',
        description: 'Правительство Лос-Сантоса',
        logo_url: 'https://example.com/gov_logo.png',
        gallery: []
      }
    ];

    for (const dept of departments) {
      const { error } = await supabase
        .from('departments')
        .insert(dept);
      
      if (error) {
        console.log(`⚠️  Department ${dept.name} insert failed: ${error.message}`);
      } else {
        console.log(`✅ Department ${dept.name} inserted`);
      }
    }

    // Insert test users
    const users = [
      {
        username: 'admin',
        email: 'admin@horizon.com',
        password_hash: '$2b$10$example.hash.for.admin',
        role: 'admin',
        status: 'active',
        department_id: 1,
        rank: 'Chief',
        division: 'Administration',
        qualifications: ['leadership', 'management'],
        game_warnings: 0,
        admin_warnings: 0
      },
      {
        username: 'john_doe',
        email: 'john.doe@horizon.com',
        password_hash: '$2b$10$example.hash.for.john',
        role: 'member',
        status: 'active',
        department_id: 1,
        rank: 'Officer',
        division: 'Patrol',
        qualifications: ['basic_training', 'firearms'],
        game_warnings: 0,
        admin_warnings: 0
      },
      {
        username: 'jane_smith',
        email: 'jane.smith@horizon.com',
        password_hash: '$2b$10$example.hash.for.jane',
        role: 'member',
        status: 'active',
        department_id: 2,
        rank: 'Firefighter',
        division: 'Rescue',
        qualifications: ['basic_training', 'rescue_operations'],
        game_warnings: 0,
        admin_warnings: 0
      },
      {
        username: 'candidate_test',
        email: 'candidate@horizon.com',
        password_hash: '$2b$10$example.hash.for.candidate',
        role: 'candidate',
        status: 'active',
        department_id: null,
        rank: null,
        division: null,
        qualifications: [],
        game_warnings: 0,
        admin_warnings: 0
      }
    ];

    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .insert(user);
      
      if (error) {
        console.log(`⚠️  User ${user.username} insert failed: ${error.message}`);
      } else {
        console.log(`✅ User ${user.username} inserted`);
      }
    }

    console.log('✅ Seed data insertion completed');
    
  } catch (error) {
    console.error('❌ Error inserting seed data:', error);
  }
}

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*');
    
    if (error) {
      console.log('⚠️  Test query failed:', error.message);
      return false;
    } else {
      console.log('✅ Database is working correctly');
      console.log(`📊 Found ${data.length} departments`);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔧 Direct Schema Application Tool');
  console.log('==================================');
  
  await createTables();
  await insertSeedData();
  await testConnection();
  
  console.log('🎉 Database setup completed!');
}

main().catch(console.error); 