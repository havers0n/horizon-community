#!/usr/bin/env pwsh

# Цвета для вывода
$colors = @{
    Reset = "`e[0m"
    Bright = "`e[1m"
    Red = "`e[31m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Blue = "`e[34m"
    Magenta = "`e[35m"
    Cyan = "`e[36m"
}

function Write-ColorLog {
    param(
        [string]$Message,
        [string]$Color = "Reset"
    )
    Write-Host "$($colors[$Color])$Message$($colors.Reset)"
}

function Write-Step {
    param([string]$Step)
    Write-ColorLog "`n$($colors.Bright)$($colors.Blue)=== $Step ===$($colors.Reset)"
}

function Write-Success {
    param([string]$Message)
    Write-ColorLog "✅ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorLog "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorLog "❌ $Message" "Red"
}

function Write-Info {
    param([string]$Message)
    Write-ColorLog "ℹ️  $Message" "Cyan"
}

# Проверка существования пути
function Test-PathExists {
    param([string]$PathToCheck)
    try {
        return Test-Path $PathToCheck
    }
    catch {
        return $false
    }
}

# Получение размера файла/папки
function Get-DirectorySize {
    param([string]$PathToCheck)
    try {
        $item = Get-Item $PathToCheck -ErrorAction Stop
        if ($item.PSIsContainer) {
            $size = 0
            Get-ChildItem $PathToCheck -Recurse -File | ForEach-Object {
                $size += $_.Length
            }
            return $size
        }
        else {
            return $item.Length
        }
    }
    catch {
        return 0
    }
}

# Форматирование размера
function Format-Size {
    param([long]$Bytes)
    if ($Bytes -eq 0) { return "0 B" }
    $sizes = @("B", "KB", "MB", "GB")
    $i = [math]::Floor([math]::Log($Bytes, 1024))
    $size = [math]::Round($Bytes / [math]::Pow(1024, $i), 2)
    return "$size $($sizes[$i])"
}

# Вывод списка файлов в папке
function Show-DirectoryStructure {
    param(
        [string]$DirPath,
        [string]$Prefix = ""
    )
    try {
        $items = Get-ChildItem $DirPath | Sort-Object Name
        for ($i = 0; $i -lt $items.Count; $i++) {
            $item = $items[$i]
            $isLast = $i -eq ($items.Count - 1)
            $currentPrefix = if ($isLast) { "└── " } else { "├── " }
            $nextPrefix = if ($isLast) { "    " } else { "│   " }
            
            if ($item.PSIsContainer) {
                Write-ColorLog "$Prefix$currentPrefix$($item.Name)/" "Magenta"
                Show-DirectoryStructure -DirPath $item.FullName -Prefix ($Prefix + $nextPrefix)
            }
            else {
                $size = Format-Size -Bytes $item.Length
                Write-ColorLog "$Prefix$currentPrefix$($item.Name) ($size)"
            }
        }
    }
    catch {
        Write-Error "Ошибка при чтении папки $DirPath`: $($_.Exception.Message)"
    }
}

# Основная функция
function Main {
    try {
        Write-Step "НАЧАЛО СБОРКИ И АРХИВИРОВАНИЯ"
        
        # Шаг 1: Сборка проекта
        Write-Step "СБОРКА ПРОЕКТА"
        Write-Info "Выполняется сборка всех приложений..."
        
        try {
            npm run build
            if ($LASTEXITCODE -ne 0) {
                throw "Сборка завершилась с ошибкой"
            }
            Write-Success "Сборка проекта завершена успешно"
        }
        catch {
            Write-Error "Ошибка при сборке проекта: $($_.Exception.Message)"
            exit 1
        }
        
        # Шаг 2: Проверка существования билд-артефактов
        Write-Step "ПРОВЕРКА БИЛД-АРТЕФАКТОВ"
        
        $buildPaths = @(
            @{ Name = "Client Build"; Path = "apps/client/dist"; Required = $true },
            @{ Name = "MDT Client Build"; Path = "apps/mdtclient/dist"; Required = $true },
            @{ Name = "Server Build (apps/server/dist)"; Path = "apps/server/dist"; Required = $false },
            @{ Name = "Server Build (dist/apps/server)"; Path = "dist/apps/server"; Required = $false },
            @{ Name = "Server Build (dist)"; Path = "dist"; Required = $false }
        )
        
        $existingPaths = @()
        
        foreach ($buildPath in $buildPaths) {
            if (Test-PathExists -PathToCheck $buildPath.Path) {
                $size = Get-DirectorySize -PathToCheck $buildPath.Path
                Write-Success "$($buildPath.Name): $($buildPath.Path) ($(Format-Size -Bytes $size))"
                $existingPaths += $buildPath
            }
            else {
                if ($buildPath.Required) {
                    Write-Error "$($buildPath.Name): $($buildPath.Path) - НЕ НАЙДЕН (обязательный)"
                }
                else {
                    Write-Warning "$($buildPath.Name): $($buildPath.Path) - не найден (опциональный)"
                }
            }
        }
        
        if ($existingPaths.Count -eq 0) {
            Write-Error "Не найдено ни одного билд-артефакта для архивирования"
            exit 1
        }
        
        # Шаг 3: Вывод структуры найденных билд-артефактов
        Write-Step "СТРУКТУРА БИЛД-АРТЕФАКТОВ"
        foreach ($buildPath in $existingPaths) {
            Write-Info "$($buildPath.Name):"
            Show-DirectoryStructure -DirPath $buildPath.Path
        }
        
        # Шаг 4: Создание архива
        Write-Step "СОЗДАНИЕ АРХИВА"
        
        $archiveName = "deployment.tar.gz"
        
        # Удаление старого архива если существует
        if (Test-Path $archiveName) {
            Remove-Item $archiveName -Force
            Write-Info "Удален старый архив deployment.tar.gz"
        }
        
        # Создание команды для архивирования
        $tarPaths = $existingPaths | ForEach-Object { $_.Path }
        $tarCommand = "tar -czf $archiveName $($tarPaths -join ' ')"
        
        try {
            Write-Info "Выполняется команда: $tarCommand"
            Invoke-Expression $tarCommand
            if ($LASTEXITCODE -ne 0) {
                throw "Команда tar завершилась с ошибкой"
            }
            Write-Success "Архив $archiveName создан успешно"
        }
        catch {
            Write-Error "Ошибка при создании архива: $($_.Exception.Message)"
            exit 1
        }
        
        # Шаг 5: Проверка созданного архива
        Write-Step "ПРОВЕРКА АРХИВА"
        
        if (Test-Path $archiveName) {
            $archiveSize = Get-DirectorySize -PathToCheck $archiveName
            Write-Success "Архив $archiveName создан ($(Format-Size -Bytes $archiveSize))"
            
            # Вывод содержимого архива
            Write-Info "Содержимое архива:"
            try {
                tar -tzf $archiveName
            }
            catch {
                Write-Warning "Не удалось вывести содержимое архива"
            }
        }
        else {
            Write-Error "Архив $archiveName не был создан"
            exit 1
        }
        
        # Шаг 6: Финальный отчет
        Write-Step "ФИНАЛЬНЫЙ ОТЧЕТ"
        Write-Success "Архивирование завершено успешно!"
        Write-Info "Архив: $archiveName"
        Write-Info "Размер: $(Format-Size -Bytes (Get-DirectorySize -PathToCheck $archiveName))"
        Write-Info "Включенные билды:"
        foreach ($buildPath in $existingPaths) {
            $size = Get-DirectorySize -PathToCheck $buildPath.Path
            Write-Info "  - $($buildPath.Name): $($buildPath.Path) ($(Format-Size -Bytes $size))"
        }
    }
    catch {
        Write-Error "Критическая ошибка: $($_.Exception.Message)"
        exit 1
    }
}

# Запуск скрипта
Main 