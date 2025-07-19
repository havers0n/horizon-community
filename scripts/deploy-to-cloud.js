#!/usr/bin/env node

/**
 * Script to deploy data to Supabase cloud database
 * 
 * Usage: 
 * node scripts/deploy-to-cloud.js
 * 
 * Prerequisites:
 * - Supabase CLI installed
 * - Project linked to cloud instance
 * - Database password configured
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_REF = 'axgtvvcimqoyxbfvdrok';
const REGION = 'eu-north-1';

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function executeCommand(command, options = {}) {
  try {
    log(`Executing: ${command}`);
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return result;
  } catch (error) {
    log(`Error executing command: ${error.message}`);
    throw error;
  }
}

async function deployToCloud() {
  try {
    log('Starting deployment to Supabase cloud...');

    // Check if user is logged in
    log('Checking authentication...');
    try {
      executeCommand('npx supabase projects list', { silent: true });
    } catch (error) {
      log('Not authenticated. Please run: npx supabase login');
      process.exit(1);
    }

    // Link to project if not already linked
    log('Linking to cloud project...');
    try {
      executeCommand(`npx supabase link --project-ref ${PROJECT_REF}`, { 
        input: '\\n', // Skip password prompt if already configured
        timeout: 30000 
      });
    } catch (error) {
      log('Project already linked or failed to link. Continuing...');
    }

    // Apply migrations to cloud database
    log('Pushing migrations to cloud database...');
    executeCommand('npx supabase db push');

    // Check if seed data exists
    const seedPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      log('Applying seed data to cloud database...');
      
      // Read seed data
      const seedData = fs.readFileSync(seedPath, 'utf8');
      
      // Create temporary file for cloud seeding
      const tempSeedPath = path.join(__dirname, '..', 'temp_cloud_seed.sql');
      fs.writeFileSync(tempSeedPath, seedData);
      
      try {
        // Apply seed data using psql (requires connection string)
        log('Note: To apply seed data, you need to run the following command manually:');
        log('psql \"postgresql://postgres.axgtvvcimqoyxbfvdrok:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres\" < supabase/seed.sql');
        
        // Alternative: Use supabase CLI if it supports seeding
        // executeCommand(`npx supabase db seed --project-ref ${PROJECT_REF}`);
      } finally {
        // Clean up temporary file
        if (fs.existsSync(tempSeedPath)) {
          fs.unlinkSync(tempSeedPath);
        }
      }
    }

    // Get project info
    log('Getting project information...');
    const projectInfo = executeCommand('npx supabase projects api-keys', { silent: true });
    
    log('\\n=== Deployment Complete ===');
    log(`Project URL: https://${PROJECT_REF}.supabase.co`);
    log(`Dashboard: https://supabase.com/dashboard/project/${PROJECT_REF}`);
    log('\\nNext steps:');
    log('1. Update your .env.production file with the correct DATABASE_URL');
    log('2. Configure authentication settings in Supabase Dashboard');
    log('3. Test your application with the cloud database');
    log('4. Set up monitoring and backups');

  } catch (error) {
    log(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run deployment
deployToCloud();
