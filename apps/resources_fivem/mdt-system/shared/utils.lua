-- MDT System Shared Utilities
-- RolePlayIdentity MDT System - Framework Independent

MDT = MDT or {}
MDT.Utils = {}

-- Логирование
function MDT.Utils.Log(level, message)
    if not Config.Logging.enabled then
        return
    end
    
    local colors = {
        debug = '^7',
        info = '^2',
        warn = '^3', 
        error = '^1'
    }
    
    local color = colors[level] or '^7'
    print(string.format('%s[MDT System] %s^7', color, message))
    
    -- Файловое логирование (если включено)
    if Config.Logging.file_logging then
        -- Здесь можно добавить запись в файл
    end
end

-- Уведомления
function MDT.Utils.Notify(source, message, type)
    if not source or source == 0 then
        return
    end
    
    if Config.Notifications.use_chat then
        local colors = Config.Notifications.colors[type] or Config.Notifications.colors.info
        TriggerClientEvent('chat:addMessage', source, {
            color = colors,
            multiline = true,
            args = {"MDT", message}
        })
    end
    
    if Config.Notifications.use_notify then
        -- Интеграция с системой уведомлений
        TriggerClientEvent('mdt:notify', source, message, type)
    end
end

-- Rate Limiting
MDT.Utils.RateLimit = {}
local rateLimitData = {}

function MDT.Utils.RateLimit.Check(source)
    if not Config.Security.rate_limit.enabled then
        return true
    end
    
    local currentTime = os.time()
    local identifier = tostring(source)
    
    if not rateLimitData[identifier] then
        rateLimitData[identifier] = {
            count = 0,
            resetTime = currentTime + Config.Security.rate_limit.time_window
        }
    end
    
    local data = rateLimitData[identifier]
    
    -- Сброс счетчика если время истекло
    if currentTime > data.resetTime then
        data.count = 0
        data.resetTime = currentTime + Config.Security.rate_limit.time_window
    end
    
    -- Проверка лимита
    if data.count >= Config.Security.rate_limit.max_requests then
        return false
    end
    
    data.count = data.count + 1
    return true
end

-- Кэширование
MDT.Utils.Cache = {}
local cacheData = {}

function MDT.Utils.Cache.Set(key, value, duration)
    if not Config.Performance.cache_enabled then
        return
    end
    
    local expireTime = os.time() + (duration or Config.Performance.cache_duration)
    cacheData[key] = {
        value = value,
        expire = expireTime
    }
end

function MDT.Utils.Cache.Get(key)
    if not Config.Performance.cache_enabled then
        return nil
    end
    
    local data = cacheData[key]
    if not data then
        return nil
    end
    
    if os.time() > data.expire then
        cacheData[key] = nil
        return nil
    end
    
    return data.value
end

function MDT.Utils.Cache.Clear()
    cacheData = {}
end

-- Валидация данных
function MDT.Utils.ValidateIdentifier(identifier)
    if not identifier or type(identifier) ~= 'string' then
        return false
    end
    
    -- Базовая валидация идентификатора
    return string.len(identifier) > 0 and string.len(identifier) <= 50
end

function MDT.Utils.ValidateReport(reportData)
    if not reportData then
        return false, "Отсутствуют данные отчета"
    end
    
    if not reportData.title or string.len(reportData.title) < 3 then
        return false, "Заголовок отчета должен содержать минимум 3 символа"
    end
    
    if not reportData.content or string.len(reportData.content) < 10 then
        return false, "Содержание отчета должно содержать минимум 10 символов"
    end
    
    return true
end

-- Генерация ID
function MDT.Utils.GenerateId()
    return os.time() .. math.random(1000, 9999)
end

-- Форматирование даты
function MDT.Utils.FormatDate(timestamp)
    return os.date('%Y-%m-%d %H:%M:%S', timestamp or os.time())
end

-- Безопасное получение данных игрока
function MDT.Utils.GetPlayerData(source)
    if not source or source == 0 then
        return nil
    end
    
    -- Попытка получить данные через различные фреймворки
    if Config.Framework.esx.enabled then
        local ESX = exports[Config.Framework.esx.resource_name]:getSharedObject()
        local xPlayer = ESX.GetPlayerFromId(source)
        if xPlayer then
            return {
                identifier = xPlayer.getIdentifier(),
                name = xPlayer.getName(),
                job = xPlayer.getJob(),
                group = xPlayer.getGroup()
            }
        end
    end
    
    if Config.Framework.qbcore.enabled then
        local QBCore = exports[Config.Framework.qbcore.resource_name]:GetCoreObject()
        local Player = QBCore.Functions.GetPlayer(source)
        if Player then
            return {
                identifier = Player.PlayerData.citizenid,
                name = Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname,
                job = Player.PlayerData.job,
                group = Player.PlayerData.permission
            }
        end
    end
    
    -- Standalone режим - используем встроенные функции
    if Config.Framework.standalone.enabled then
        local jobName = 'unknown'
        local groupName = 'user'
        
        -- Проверяем, есть ли тестовая профессия
        if _G['test_job_' .. source] then
            jobName = _G['test_job_' .. source]
        end
        
        -- Проверяем, есть ли тестовая группа
        if _G['test_group_' .. source] then
            groupName = _G['test_group_' .. source]
        end
        
        return {
            identifier = GetPlayerIdentifier(source, 0),
            name = GetPlayerName(source),
            job = { name = jobName, label = jobName:upper() },
            group = groupName
        }
    end
    
    return nil
end

-- Очистка старых данных
function MDT.Utils.Cleanup()
    local currentTime = os.time()
    
    -- Очистка rate limit данных
    for identifier, data in pairs(rateLimitData) do
        if currentTime > data.resetTime + 300 then -- 5 минут после истечения
            rateLimitData[identifier] = nil
        end
    end
    
    -- Очистка кэша
    for key, data in pairs(cacheData) do
        if currentTime > data.expire then
            cacheData[key] = nil
        end
    end
end

-- Экспорт функций
if IsDuplicityVersion() then -- Server side
    exports('MDTLog', MDT.Utils.Log)
    exports('MDTNotify', MDT.Utils.Notify)
    exports('MDTGetPlayerData', MDT.Utils.GetPlayerData)
    exports('MDTValidateIdentifier', MDT.Utils.ValidateIdentifier)
    exports('MDTValidateReport', MDT.Utils.ValidateReport)
    exports('MDTGenerateId', MDT.Utils.GenerateId)
    exports('MDTCacheSet', MDT.Utils.Cache.Set)
    exports('MDTCacheGet', MDT.Utils.Cache.Get)
    exports('MDTRateLimitCheck', MDT.Utils.RateLimit.Check)
else -- Client side
    exports('MDTLog', MDT.Utils.Log)
    exports('MDTNotify', MDT.Utils.Notify)
end 