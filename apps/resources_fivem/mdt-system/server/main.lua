-- MDT System Server Script
-- RolePlayIdentity MDT System - Framework Independent

-- Загрузка конфигурации
local Config = nil
local configContent = LoadResourceFile(GetCurrentResourceName(), 'config.lua')
if configContent then
    local configFunc = load(configContent)
    if configFunc then
        Config = configFunc()
        print('^2[MDT System] ^7Конфигурация загружена успешно (сервер)')
    else
        print('^1[MDT System] ^7Ошибка загрузки конфигурации (сервер)')
        Config = {
            Framework = {
                esx = { enabled = false },
                qbcore = { enabled = false },
                standalone = { enabled = true }
            }
        }
    end
else
    print('^1[MDT System] ^7Файл конфигурации не найден (сервер)')
    Config = {
        Framework = {
            esx = { enabled = false },
            qbcore = { enabled = false },
            standalone = { enabled = true }
        }
    }
end

-- Инициализация фреймворков (опционально)
local ESX = nil
local QBCore = nil

if Config and Config.Framework and Config.Framework.esx and Config.Framework.esx.enabled then
    TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
end

if Config and Config.Framework and Config.Framework.qbcore and Config.Framework.qbcore.enabled then
    QBCore = exports[Config.Framework.qbcore.resource_name]:GetCoreObject()
end

-- Utility functions
local function log(level, message)
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTLog then
        exports[GetCurrentResourceName()]:MDTLog(level, message)
    else
        print(string.format('^%s[MDT System] %s^7', 
            level == 'error' and '1' or level == 'warn' and '3' or '2', 
            message))
    end
end

local function notify(source, message, type)
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTNotify then
        exports[GetCurrentResourceName()]:MDTNotify(source, message, type)
    end
end

local function getPlayerInfo(source)
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTGetPlayerData then
        return exports[GetCurrentResourceName()]:MDTGetPlayerData(source)
    end
    return nil
end

-- Database functions
local function searchCitizen(identifier)
    -- Проверяем кэш
    local cacheKey = 'citizen_' .. identifier
    local cached = nil
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTCacheGet then
        cached = exports[GetCurrentResourceName()]:MDTCacheGet(cacheKey)
    end
    
    if cached then
        return cached
    end
    
    -- Здесь будет интеграция с вашей базой данных
    -- Пока возвращаем заглушку
    local citizenData = {
        identifier = identifier,
        name = "Тестовый гражданин",
        dateOfBirth = "1990-01-01",
        phone = "+1234567890",
        address = "Тестовый адрес",
        licenses = {
            driver = true,
            weapon = false
        },
        criminalRecord = {
            -- История преступлений
        }
    }
    
    -- Сохраняем в кэш
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTCacheSet then
        exports[GetCurrentResourceName()]:MDTCacheSet(cacheKey, citizenData, 300)
    end
    
    return citizenData
end

local function saveReport(reportData)
    local report = {
        id = exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTGenerateId and exports[GetCurrentResourceName()]:MDTGenerateId() or os.time(),
        title = reportData.title,
        content = reportData.content,
        author = reportData.author,
        authorIdentifier = reportData.authorIdentifier,
        date = exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTFormatDate and exports[GetCurrentResourceName()]:MDTFormatDate() or os.date('%Y-%m-%d %H:%M:%S'),
        status = 'active'
    }
    
    -- Здесь будет сохранение в базу данных
    log('info', string.format('Отчет сохранен: %s от %s', report.title, report.author))
    
    return report
end

local function getReports()
    -- Здесь будет получение отчетов из базы данных
    local reports = {
        -- Список отчетов
    }
    
    return reports
end

-- Event handlers
RegisterNetEvent('mdt:getPlayerData')
AddEventHandler('mdt:getPlayerData', function()
    local source = source
    
    log('info', string.format('Запрос данных игрока от %s', source))
    
    -- Получаем данные игрока
    local playerData = getPlayerInfo(source)
    
    -- Отправляем данные обратно клиенту
    TriggerClientEvent('mdt:playerDataResult', source, playerData)
    
    log('info', string.format('Данные игрока отправлены: %s', source))
end)

RegisterNetEvent('mdt:searchCitizen')
AddEventHandler('mdt:searchCitizen', function(identifier)
    local source = source
    
    log('info', string.format('Поиск гражданина %s от игрока %s', identifier, source))
    
    -- Проверка rate limit
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTRateLimitCheck then
        if not exports[GetCurrentResourceName()]:MDTRateLimitCheck(source) then
            notify(source, "Слишком много запросов. Попробуйте позже.", "warning")
            return
        end
    end
    
    -- Валидация идентификатора
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTValidateIdentifier then
        if not exports[GetCurrentResourceName()]:MDTValidateIdentifier(identifier) then
            notify(source, "Неверный формат идентификатора", "error")
            return
        end
    end
    
    local citizenData = searchCitizen(identifier)
    TriggerClientEvent('mdt:citizenData', source, citizenData)
    
    log('info', string.format('Поиск гражданина %s выполнен игроком %s', identifier, source))
end)

RegisterNetEvent('mdt:saveReport')
AddEventHandler('mdt:saveReport', function(reportData)
    local source = source
    
    log('info', string.format('Сохранение отчета от игрока %s', source))
    
    -- Проверка rate limit
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTRateLimitCheck then
        if not exports[GetCurrentResourceName()]:MDTRateLimitCheck(source) then
            notify(source, "Слишком много запросов. Попробуйте позже.", "warning")
            return
        end
    end
    
    -- Валидация отчета
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTValidateReport then
        local isValid, error = exports[GetCurrentResourceName()]:MDTValidateReport(reportData)
        if not isValid then
            notify(source, error, "error")
            return
        end
    end
    
    local playerInfo = getPlayerInfo(source)
    if not playerInfo then
        notify(source, "Не удалось получить данные игрока", "error")
        return
    end
    
    reportData.author = playerInfo.name
    reportData.authorIdentifier = playerInfo.identifier
    
    local savedReport = saveReport(reportData)
    TriggerClientEvent('mdt:reportSaved', source, savedReport)
    
    notify(source, "Отчет успешно сохранен", "success")
    log('info', string.format('Отчет сохранен пользователем %s', playerInfo.name))
end)

RegisterNetEvent('mdt:getReports')
AddEventHandler('mdt:getReports', function()
    local source = source
    
    log('info', string.format('Запрос отчетов от игрока %s', source))
    
    -- Проверка rate limit
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTRateLimitCheck then
        if not exports[GetCurrentResourceName()]:MDTRateLimitCheck(source) then
            notify(source, "Слишком много запросов. Попробуйте позже.", "warning")
            return
        end
    end
    
    local reports = getReports()
    TriggerClientEvent('mdt:reportsList', source, reports)
    
    log('info', string.format('Список отчетов отправлен игроку %s', source))
end)

-- Периодическая очистка
CreateThread(function()
    while true do
        Wait(300000) -- 5 минут
        if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTUtilsCleanup then
            exports[GetCurrentResourceName()]:MDTUtilsCleanup()
        end
    end
end)

-- Resource start
AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        log('info', 'Серверный скрипт MDT загружен')
        log('info', 'MDT доступен для всех игроков')
        log('info', string.format('Режим фреймворка: %s', 
            Config.Framework.standalone.enabled and 'Standalone' or 
            Config.Framework.esx.enabled and 'ESX' or 
            Config.Framework.qbcore.enabled and 'QBCore' or 'Unknown'))
        log('info', 'ВНИМАНИЕ: MDT НЕ открывается автоматически при старте ресурса')
        log('info', 'ВНИМАНИЕ: Сервер НЕ отправляет автоматические события при старте')
        
        -- Проверяем, есть ли игроки онлайн
        local players = GetPlayers()
        log('info', string.format('Игроков онлайн при старте: %d', #players))
        
        -- НЕ отправляем никаких событий игрокам при старте
        log('info', 'Сервер НЕ отправляет события mdt:open игрокам при старте')
        
        -- Принудительно закрываем MDT у всех игроков при старте
        TriggerClientEvent('mdt:close', -1)
        log('info', 'MDT принудительно закрыт у всех игроков при старте ресурса')
    end
end)

-- Админ команда для принудительного закрытия MDT у всех игроков
RegisterCommand('mdt_close_all', function(source, args, rawCommand)
    if source == 0 then -- Console
        log('info', 'Команда mdt_close_all выполнена из консоли')
    else
        log('info', string.format('Команда mdt_close_all выполнена игроком %s', source))
    end
    
    -- Закрываем MDT у всех игроков
    TriggerClientEvent('mdt:close', -1)
    log('info', 'MDT принудительно закрыт у всех игроков')
    
    if source ~= 0 then
        notify(source, "MDT закрыт у всех игроков", "success")
    end
end, false)

-- Команда для проверки, кто отправляет события mdt:open
RegisterCommand('mdt_debug_events', function(source, args, rawCommand)
    if source == 0 then -- Console
        log('info', 'Команда mdt_debug_events выполнена из консоли')
    else
        log('info', string.format('Команда mdt_debug_events выполнена игроком %s', source))
    end
    
    log('info', '=== ОТЛАДКА СОБЫТИЙ MDT ===')
    log('info', 'Проверяем, какие события отправляются...')
    
    -- Проверяем активные события
    local players = GetPlayers()
    log('info', string.format('Активных игроков: %d', #players))
    
    for i, playerId in ipairs(players) do
        log('info', string.format('Игрок %s: %s', playerId, GetPlayerName(playerId)))
    end
    
    log('info', '=== КОНЕЦ ОТЛАДКИ ===')
    
    if source ~= 0 then
        notify(source, "Отладка событий выполнена, проверьте логи сервера", "info")
    end
end, false)

-- Export functions
exports('searchCitizen', searchCitizen)
exports('saveReport', saveReport)
exports('getReports', getReports) 