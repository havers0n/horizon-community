-- Real-time Communication Module for FiveM
-- HTTP Polling implementation for CAD/MDT system

local RealTimeClient = {}
local isConnected = false
local pollingInterval = 2000 -- 2 секунды
local lastEventTimestamp = 0
local subscribedChannels = {'all'}
local serverUrl = 'http://127.0.0.1:5000'
local authToken = nil
local pollingTimer = nil

-- Конфигурация
local Config = {
    serverUrl = 'http://127.0.0.1:5000',
    pollingInterval = 2000,
    maxRetries = 3,
    retryDelay = 5000
}

-- Утилиты для логирования
local function log(level, message)
    local colors = {
        error = '^1',
        warn = '^3', 
        info = '^2',
        debug = '^5'
    }
    print(string.format('%s[RealTime] %s^7', colors[level] or '^7', message))
end

-- HTTP запросы
local function makeHttpRequest(method, endpoint, data, callback)
    local url = Config.serverUrl .. endpoint
    local headers = {
        ['Content-Type'] = 'application/json'
    }
    
    if authToken then
        headers['Authorization'] = 'Bearer ' .. authToken
    end
    
    PerformHttpRequest(url, function(statusCode, responseText, responseHeaders)
        if statusCode == 200 then
            local success, response = pcall(json.decode, responseText)
            if success and response then
                callback(true, response)
            else
                callback(false, 'Invalid JSON response')
            end
        else
            callback(false, 'HTTP ' .. statusCode .. ': ' .. responseText)
        end
    end, method, data and json.encode(data) or '', headers)
end

-- Аутентификация
function RealTimeClient.authenticate(token)
    authToken = token
    log('info', 'Authentication token set')
end

-- Подписка на каналы
function RealTimeClient.subscribe(channels)
    if type(channels) == 'string' then
        channels = {channels}
    end
    
    subscribedChannels = channels
    log('info', 'Subscribed to channels: ' .. table.concat(channels, ', '))
    
    -- Отправляем подписку на сервер
    makeHttpRequest('POST', '/api/realtime/subscribe', {
        channels = channels
    }, function(success, response)
        if success then
            log('info', 'Successfully subscribed to channels')
        else
            log('error', 'Failed to subscribe: ' .. tostring(response))
        end
    end)
end

-- Отписка от каналов
function RealTimeClient.unsubscribe(channels)
    if type(channels) == 'string' then
        channels = {channels}
    end
    
    makeHttpRequest('POST', '/api/realtime/unsubscribe', {
        channels = channels
    }, function(success, response)
        if success then
            log('info', 'Successfully unsubscribed from channels')
        else
            log('error', 'Failed to unsubscribe: ' .. tostring(response))
        end
    end)
end

-- Получение событий
function RealTimeClient.pollEvents()
    if not authToken then
        log('warn', 'Not authenticated, skipping event poll')
        return
    end
    
    local endpoint = '/api/realtime/events?channels=' .. table.concat(subscribedChannels, ',')
    if lastEventTimestamp > 0 then
        endpoint = endpoint .. '&since=' .. lastEventTimestamp
    end
    
    makeHttpRequest('GET', endpoint, nil, function(success, response)
        if success and response.events then
            for _, event in ipairs(response.events) do
                -- Обновляем timestamp последнего события
                if event.timestamp > lastEventTimestamp then
                    lastEventTimestamp = event.timestamp
                end
                
                -- Обрабатываем событие
                RealTimeClient.handleEvent(event)
            end
            
            if #response.events > 0 then
                log('debug', 'Received ' .. #response.events .. ' events')
            end
        else
            log('error', 'Failed to poll events: ' .. tostring(response))
        end
    end)
end

-- Обработка событий
function RealTimeClient.handleEvent(event)
    log('debug', 'Handling event: ' .. event.type)
    
    -- Отправляем событие в NUI
    SendNUIMessage({
        type = 'realtime_event',
        event = event
    })
    
    -- Обрабатываем специфичные события
    if event.type == 'unit_status_update' then
        RealTimeClient.handleUnitStatusUpdate(event.data)
    elseif event.type == 'new_call' then
        RealTimeClient.handleNewCall(event.data)
    elseif event.type == 'panic_alert' then
        RealTimeClient.handlePanicAlert(event.data)
    elseif event.type == 'bolo_alert' then
        RealTimeClient.handleBOLOAlert(event.data)
    end
end

-- Обработчики специфичных событий
function RealTimeClient.handleUnitStatusUpdate(data)
    log('info', 'Unit ' .. data.unitId .. ' status: ' .. data.status)
    -- Здесь можно добавить специфичную логику для обновления статуса юнита
end

function RealTimeClient.handleNewCall(data)
    log('info', 'New call received: ' .. tostring(data.description))
    -- Здесь можно добавить специфичную логику для новых вызовов
end

function RealTimeClient.handlePanicAlert(data)
    log('warn', 'PANIC ALERT from unit ' .. data.unitId)
    -- Здесь можно добавить специфичную логику для паники
end

function RealTimeClient.handleBOLOAlert(data)
    log('info', 'BOLO Alert: ' .. data.vehiclePlate .. ' - ' .. data.description)
    -- Здесь можно добавить специфичную логику для BOLO
end

-- Heartbeat
function RealTimeClient.sendHeartbeat()
    if not authToken then
        return
    end
    
    makeHttpRequest('POST', '/api/realtime/heartbeat', nil, function(success, response)
        if not success then
            log('error', 'Heartbeat failed: ' .. tostring(response))
        end
    end)
end

-- Подключение к серверу
function RealTimeClient.connect()
    if isConnected then
        log('warn', 'Already connected')
        return
    end
    
    if not authToken then
        log('error', 'Authentication required before connecting')
        return
    end
    
    isConnected = true
    log('info', 'Connecting to real-time server...')
    
    -- Запускаем polling
    pollingTimer = SetTimeout(Config.pollingInterval, function()
        RealTimeClient.pollEvents()
        
        -- Планируем следующий poll
        if isConnected then
            pollingTimer = SetTimeout(Config.pollingInterval, function()
                RealTimeClient.pollEvents()
            end)
        end
    end)
    
    -- Запускаем heartbeat каждые 30 секунд
    SetTimeout(30000, function()
        if isConnected then
            RealTimeClient.sendHeartbeat()
        end
    end)
    
    log('info', 'Real-time client connected')
end

-- Отключение от сервера
function RealTimeClient.disconnect()
    if not isConnected then
        return
    end
    
    isConnected = false
    
    if pollingTimer then
        ClearTimeout(pollingTimer)
        pollingTimer = nil
    end
    
    log('info', 'Real-time client disconnected')
end

-- Получение статуса подключения
function RealTimeClient.isConnected()
    return isConnected
end

-- Получение статистики
function RealTimeClient.getStats()
    return {
        connected = isConnected,
        subscribedChannels = subscribedChannels,
        lastEventTimestamp = lastEventTimestamp,
        pollingInterval = Config.pollingInterval
    }
end

-- Экспорт функций
exports('RealTimeAuthenticate', RealTimeClient.authenticate)
exports('RealTimeSubscribe', RealTimeClient.subscribe)
exports('RealTimeUnsubscribe', RealTimeClient.unsubscribe)
exports('RealTimeConnect', RealTimeClient.connect)
exports('RealTimeDisconnect', RealTimeClient.disconnect)
exports('RealTimeIsConnected', RealTimeClient.isConnected)
exports('RealTimeGetStats', RealTimeClient.getStats)

-- Возвращаем модуль для использования в других скриптах
return RealTimeClient