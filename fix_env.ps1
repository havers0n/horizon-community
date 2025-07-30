$content = Get-Content .env -Raw
$content = $content -replace 'DATABASE_URL=postgresql://postgres\.axgtvvcimqoyxbfvdrok:\[mybropass!1!\]@aws-0-eu-north-1\.pooler\.supabase\.com:5432/postgres', 'DATABASE_URL=postgresql://postgres.axgtvvcimqoyxbfvdrok:mybropass!1!@aws-0-eu-north-1.pooler.supabase.com:5432/postgres'
Set-Content .env -Value $content
Write-Host "DATABASE_URL fixed in .env file" 