$content = Get-Content .env -Raw

# Получаем пароль из переменной DB_PASSWORD
$dbPassword = "mybropass!1!"

# Кодируем пароль для URL
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($dbPassword)

# Создаем правильный DATABASE_URL
$newDatabaseUrl = "DATABASE_URL=postgresql://postgres.axgtvvcimqoyxbfvdrok:$encodedPassword@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

# Заменяем старый DATABASE_URL на новый
$content = $content -replace 'DATABASE_URL=.*', $newDatabaseUrl

Set-Content .env -Value $content
Write-Host "DATABASE_URL исправлен с правильно закодированным паролем" 