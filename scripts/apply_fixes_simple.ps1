# Simple PowerShell script for applying architecture fixes
# RolePlayIdentity - Architecture audit and fixes

Write-Host "Applying Architecture Fixes..." -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:SUPABASE_URL = "https://axgtvvcimqoyxbfvdrok.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3R2dmNpbXFveXhiZnZkcm9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjAxMzcxNywiZXhwIjoyMDY3NTg5NzE3fQ.IkafB_52F99inBJiW7-g9rgmFdh-bTwpz2nBLcVCu7U"

Write-Host "Environment variables set" -ForegroundColor Green
Write-Host ""

# Function to apply migration
function Apply-Migration {
    param(
        [string]$MigrationFile,
        [string]$Description
    )
    
    Write-Host "Applying: $Description" -ForegroundColor Yellow
    Write-Host "File: $MigrationFile" -ForegroundColor Gray
    
    if (-not (Test-Path $MigrationFile)) {
        Write-Host "ERROR: Migration file not found: $MigrationFile" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "Applying via Supabase CLI..." -ForegroundColor Cyan
        
        # Apply migration
        $result = supabase db push --file $MigrationFile 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Migration applied successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Host "ERROR: Failed to apply migration:" -ForegroundColor Red
            Write-Host "$result" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "ERROR: Exception during migration: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
}

# Function to test connection
function Test-Connection {
    Write-Host "Testing database connection..." -ForegroundColor Yellow
    
    try {
        $status = supabase status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Database connection successful" -ForegroundColor Green
            return $true
        } else {
            Write-Host "ERROR: Database connection failed" -ForegroundColor Red
            Write-Host "$status" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "ERROR: Exception during connection test: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
}

# Main process
Write-Host "Starting architecture fix process..." -ForegroundColor Green
Write-Host ""

# Test connection
if (-not (Test-Connection)) {
    Write-Host "ERROR: Could not connect to database. Check environment variables." -ForegroundColor Red
    exit 1
}

# Create backup (if possible)
Write-Host "Creating backup..." -ForegroundColor Yellow
try {
    $backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    supabase db dump --data-only > $backupFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Backup created: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Backup not created (supabase CLI not found)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "WARNING: Backup not created: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Apply migrations in correct order
Write-Host "Applying migrations..." -ForegroundColor Yellow
Write-Host ""

$success = $true

# 1. Fix owner_id in common.characters
if (-not (Apply-Migration -MigrationFile "supabase/migrations/015_fix_common_characters_owner_id.sql" -Description "Fix owner_id type in common.characters")) {
    $success = $false
}

# 2. Add missing fields to users
if (-not (Apply-Migration -MigrationFile "supabase/migrations/016_add_missing_user_fields.sql" -Description "Add missing fields to users table")) {
    $success = $false
}

# 3. Verify integrity
if (-not (Apply-Migration -MigrationFile "supabase/migrations/017_verify_integrity.sql" -Description "Verify schema integrity")) {
    $success = $false
}

if ($success) {
    Write-Host "SUCCESS: All migrations applied successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Final check
    Write-Host "Final verification..." -ForegroundColor Yellow
    Test-Connection
    
    Write-Host ""
    Write-Host "ARCHITECTURE FIXES COMPLETED!" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    Write-Host ""
    Write-Host "What was fixed:" -ForegroundColor White
    Write-Host "  - owner_id type in common.characters changed from UUID to INTEGER" -ForegroundColor Green
    Write-Host "  - Added missing fields to users table" -ForegroundColor Green
    Write-Host "  - Created unique indexes for tokens" -ForegroundColor Green
    Write-Host "  - Verified schema integrity" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. Update TypeScript types in code" -ForegroundColor Cyan
    Write-Host "  2. Fix adapters in SupabaseStorage" -ForegroundColor Cyan
    Write-Host "  3. Implement real WebSocket authentication" -ForegroundColor Cyan
    Write-Host "  4. Run tests to verify functionality" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Details in report: ARCHITECTURE_AUDIT_REPORT.md" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: Errors occurred during migration application. Check logs above." -ForegroundColor Red
    exit 1
} 