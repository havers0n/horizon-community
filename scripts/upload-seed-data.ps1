# PowerShell script to upload seed data to Supabase cloud database
# Usage: .\scripts\upload-seed-data.ps1

param(
    [string]$Password = $null,
    [string]$ProjectRef = "axgtvvcimqoyxbfvdrok"
)

# Configuration
$Region = "eu-north-1"
$Host = "aws-0-$Region.pooler.supabase.com"
$Port = 5432
$Database = "postgres"
$Username = "postgres.$ProjectRef"

Write-Host "🚀 Uploading seed data to Supabase cloud database..." -ForegroundColor Green

# Check if seed file exists
$SeedFile = "supabase/seed.sql"
if (-not (Test-Path $SeedFile)) {
    Write-Host "❌ Seed file not found: $SeedFile" -ForegroundColor Red
    exit 1
}

# Get password if not provided
if (-not $Password) {
    $Password = Read-Host "Enter database password" -AsSecureString
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))
}

# Build connection string
$ConnectionString = "postgresql://$Username`:$Password@$Host`:$Port/$Database"

Write-Host "📁 Found seed file: $SeedFile"
Write-Host "🔗 Connecting to: $Host"

# Check if psql is available
try {
    psql --version | Out-Null
    Write-Host "✅ psql is available"
} catch {
    Write-Host "❌ psql is not available. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "You can download it from: https://www.postgresql.org/download/"
    exit 1
}

# Upload seed data
try {
    Write-Host "📤 Uploading seed data..."
    
    # Use psql to execute the seed file
    $env:PGPASSWORD = $Password
    psql -h $Host -p $Port -U $Username -d $Database -f $SeedFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Seed data uploaded successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Next steps:"
        Write-Host "1. Visit your Supabase dashboard: https://supabase.com/dashboard/project/$ProjectRef"
        Write-Host "2. Check the data in the Table Editor"
        Write-Host "3. Configure authentication settings"
        Write-Host "4. Test your application with the cloud database"
    } else {
        Write-Host "❌ Failed to upload seed data. Exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error uploading seed data: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clean up environment variable
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "🔧 Troubleshooting tips:"
Write-Host "- Make sure your database password is correct"
Write-Host "- Check that your IP is allowed in Supabase dashboard (Settings > Database > Connection string)"
Write-Host "- Ensure PostgreSQL client tools are installed"
