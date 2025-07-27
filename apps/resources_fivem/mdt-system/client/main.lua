-- MDT System Client Script
-- RolePlayIdentity MDT System - Framework Independent

local isMDTOpen = false
local playerData = nil
local resourceStarting = true -- Начинаем с true для блокировки
local configLoaded = false
local keyBindingRegistered = false
local resourceStartTime = 0 -- Время старта ресурса
local debugMode = true -- Включаем режим отладки
local nuiCallbackCount = 0 -- Счетчик NUI callback'ов
local lastF6Press = 0 -- Время последнего нажатия F6
local autoOpenAttempts = 0 -- Счетчик попыток автоматического открытия

-- Загрузка конфигурации
local function loadConfig()
    local configContent = LoadResourceFile(GetCurrentResourceName(), 'config.lua')
    if configContent then
        local configFunc = load(configContent)
        if configFunc then
            Config = configFunc()
            configLoaded = true
            print('^2[MDT System] ^7Конфигурация загружена успешно')
        else
            print('^1[MDT System] ^7Ошибка загрузки конфигурации')
        end
    else
        print('^1[MDT System] ^7Файл конфигурации не найден')
    end
end

-- Загружаем конфигурацию
loadConfig()

-- Utility functions
-- Получение данных игрока
local function getPlayerData()
    local data = nil
    
    -- Пытаемся получить данные с сервера
    if Config and Config.Framework and Config.Framework.standalone and Config.Framework.standalone.enabled then
        -- Standalone режим - используем базовые данные
        data = {
            identifier = GetPlayerServerId(PlayerId()),
            name = GetPlayerName(PlayerId()),
            job = { name = 'unknown', label = 'Unknown' },
            group = 'user'
        }
    elseif Config and Config.Framework and Config.Framework.esx and Config.Framework.esx.enabled then
        -- ESX режим
        local ESX = exports[Config.Framework.esx.resource_name]:getSharedObject()
        if ESX and ESX.GetPlayerData then
            local playerData = ESX.GetPlayerData()
            data = {
                identifier = playerData.identifier,
                name = playerData.name,
                job = playerData.job,
                group = playerData.group or 'user'
            }
        end
    elseif Config and Config.Framework and Config.Framework.qbcore and Config.Framework.qbcore.enabled then
        -- QBCore режим
        local QBCore = exports[Config.Framework.qbcore.resource_name]:GetCoreObject()
        if QBCore and QBCore.Functions.GetPlayerData then
            local playerData = QBCore.Functions.GetPlayerData()
            data = {
                identifier = playerData.citizenid,
                name = playerData.charinfo.firstname .. ' ' .. playerData.charinfo.lastname,
                job = playerData.job,
                group = playerData.group or 'user'
            }
        end
    end
    
    -- Fallback к базовым данным если не получили с сервера
    if not data then
        data = {
            identifier = GetPlayerServerId(PlayerId()),
            name = GetPlayerName(PlayerId()),
            job = { name = 'unknown', label = 'Unknown' },
            group = 'user'
        }
    end
    
    return data
end

local function openMDT()
    autoOpenAttempts = autoOpenAttempts + 1
    print('^3[MDT Debug] ^7=== ПОПЫТКА ОТКРЫТИЯ MDT ===')
    print('^3[MDT Debug] ^7Попытка #' .. autoOpenAttempts)
    print('^3[MDT Debug] ^7resourceStarting:', resourceStarting)
    print('^3[MDT Debug] ^7configLoaded:', configLoaded)
    print('^3[MDT Debug] ^7isMDTOpen:', isMDTOpen)
    print('^3[MDT Debug] ^7keyBindingRegistered:', keyBindingRegistered)
    print('^3[MDT Debug] ^7NUI Focus до открытия:', IsNuiFocused())
    print('^3[MDT Debug] ^7Время с момента старта:', GetGameTimer() - resourceStartTime)
    print('^3[MDT Debug] ^7Стек вызовов:')
    print(debug.traceback())
    print('^3[MDT Debug] ^7========================')
    
    -- Проверяем, не открыт ли уже MDT
    if isMDTOpen then
        print('^3[MDT Debug] ^7MDT уже открыт - ничего не делаем')
        return
    end
    
    -- Проверяем, не запускается ли ресурс
    if resourceStarting then
        print('^3[MDT Debug] ^7Ресурс запускается - MDT заблокирован')
        return
    end
    
    -- Проверяем, загружена ли конфигурация
    if not configLoaded then
        print('^3[MDT Debug] ^7Конфигурация не загружена - MDT заблокирован')
        return
    end
    
    -- Проверяем время с момента старта ресурса
    local currentTime = GetGameTimer()
    local timeSinceStart = currentTime - resourceStartTime
    if timeSinceStart < 10000 then -- 10 секунд после старта
        print('^3[MDT Debug] ^7MDT заблокирован в первые 10 секунд после старта')
        return
    end
    
    print('^2[MDT System] ^7Открытие MDT по запросу игрока')
    
    -- Получаем данные игрока
    local playerData = getPlayerData()
    if not playerData then
        print('^1[MDT System] ^7Ошибка: не удалось получить данные игрока')
        return
    end
    
    -- Устанавливаем флаг открытого MDT
    isMDTOpen = true
    print('^3[MDT Debug] ^7isMDTOpen установлен в true')
    
    -- Устанавливаем NUI фокус
    SetNuiFocus(true, true)
    print('^3[MDT Debug] ^7NUI фокус установлен')
    print('^3[MDT Debug] ^7NUI Focus после установки:', IsNuiFocused())
    
    -- Отправляем сообщение в NUI для открытия интерфейса
    SendNUIMessage({
        type = 'openMDT',
        playerData = playerData,
        timestamp = GetGameTimer()
    })
    
    print('^2[MDT System] ^7MDT открыт игроком: ' .. GetPlayerName(PlayerId()))
    print('^3[MDT Debug] ^7MDT успешно открыт, isMDTOpen = ' .. tostring(isMDTOpen))
    
    -- Отправляем инструкции для обработки ESC
    SendNUIMessage({
        type = 'setupControls',
        message = 'MDT открыт. Нажмите F6 или ESC для закрытия.'
    })
    
    -- Логируем открытие
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTLog then
        exports[GetCurrentResourceName()]:MDTLog('info', 'MDT открыт игроком: ' .. GetPlayerName(PlayerId()))
    end
end

local function closeMDT()
    print('^3[MDT Debug] ^7=== ПОПЫТКА ЗАКРЫТИЯ MDT ===')
    print('^3[MDT Debug] ^7isMDTOpen =', isMDTOpen)
    print('^3[MDT Debug] ^7NUI Focus до закрытия:', IsNuiFocused())
    print('^3[MDT Debug] ^7Стек вызовов:')
    print(debug.traceback())
    print('^3[MDT Debug] ^7========================')
    
    if not isMDTOpen then
        print('^3[MDT Debug] ^7MDT уже закрыт - ничего не делаем')
        return
    end
    
    print('^2[MDT System] ^7Закрытие MDT')
    
    isMDTOpen = false
    SetNuiFocus(false, false)
    
    print('^3[MDT Debug] ^7NUI Focus после снятия:', IsNuiFocused())
    
    SendNUIMessage({
        type = 'closeMDT',
        timestamp = GetGameTimer()
    })
    
    -- Останавливаем анимацию (если включена)
    if Config and Config.Animations and Config.Animations.use_animations then
        TriggerEvent('animations:client:EmoteCommandStart', {Config.Animations.close_animation})
    end
    
    print('^2[MDT System] ^7MDT закрыт')
    print('^3[MDT Debug] ^7isMDTOpen установлен в false')
    
    -- Логируем закрытие
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTLog then
        exports[GetCurrentResourceName()]:MDTLog('info', 'MDT закрыт игроком: ' .. GetPlayerName(PlayerId()))
    end
end

-- Event handlers
RegisterNetEvent('mdt:open')
AddEventHandler('mdt:open', function()
    print('^3[MDT System] ^7Получено событие mdt:open от сервера')
    print('^3[MDT Debug] ^7Источник события: сервер')
    
    -- Дополнительная проверка для событий от сервера
    if resourceStarting then
        print('^1[MDT System] ^7Попытка открыть MDT через серверное событие во время старта - заблокировано')
        return
    end
    
    openMDT()
end)

RegisterNetEvent('mdt:close')
AddEventHandler('mdt:close', function()
    print('^3[MDT System] ^7Получено событие mdt:close от сервера')
    closeMDT()
end)

RegisterNetEvent('mdt:notify')
AddEventHandler('mdt:notify', function(message, type)
    -- Обработка уведомлений от сервера
    if Config and Config.Notifications and Config.Notifications.use_notify then
        -- Здесь можно добавить интеграцию с системой уведомлений
        if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTNotify then
            exports[GetCurrentResourceName()]:MDTNotify(GetPlayerServerId(PlayerId()), message, type)
        end
    end
end)

-- Обработчики результатов от сервера
RegisterNetEvent('mdt:playerDataResult')
AddEventHandler('mdt:playerDataResult', function(playerData)
    _G.mdt_player_data_result = playerData
end)

-- NUI Callbacks
-- NUI Callback обработчики
RegisterNUICallback('nuiCallback', function(data, cb)
    nuiCallbackCount = nuiCallbackCount + 1
    print('^3[MDT Debug] ^7=== NUI CALLBACK #' .. nuiCallbackCount .. ' ===')
    print('^3[MDT Debug] ^7Получен NUI callback:', json.encode(data))
    print('^3[MDT Debug] ^7Тип данных:', type(data))
    print('^3[MDT Debug] ^7Данные:', data)
    print('^3[MDT Debug] ^7isMDTOpen до обработки:', isMDTOpen)
    print('^3[MDT Debug] ^7NUI Focus до обработки:', IsNuiFocused())
    print('^3[MDT Debug] ^7Стек вызовов:')
    print(debug.traceback())
    print('^3[MDT Debug] ^7========================')
    
    if data.type == 'closeMDT' then
        print('^3[MDT Debug] ^7Закрытие MDT по запросу UI (причина: ' .. (data.reason or 'unknown') .. ')')
        closeMDT()
    elseif data.type == 'toggleMDT' then
        print('^3[MDT Debug] ^7Переключение MDT по запросу UI (причина: ' .. (data.reason or 'unknown') .. ')')
        if isMDTOpen then
            closeMDT()
        else
            openMDT()
        end
    elseif data.type == 'ready' then
        print('^3[MDT Debug] ^7NUI интерфейс готов к работе')
    else
        print('^3[MDT Debug] ^7Неизвестный тип callback:', data.type)
    end
    
    print('^3[MDT Debug] ^7isMDTOpen после обработки:', isMDTOpen)
    print('^3[MDT Debug] ^7NUI Focus после обработки:', IsNuiFocused())
    
    cb('ok')
end)

RegisterNUICallback('closeMDT', function(data, cb)
    print('^3[MDT Debug] ^7Закрытие MDT по запросу UI (legacy)')
    closeMDT()
    cb('ok')
end)

RegisterNUICallback('escapePressed', function(data, cb)
    print('^3[MDT Debug] ^7ESC нажата в NUI - закрываем MDT')
    closeMDT()
    cb('ok')
end)

RegisterNUICallback('searchCitizen', function(data, cb)
    if not data.identifier then
        cb({success = false, error = "Не указан идентификатор"})
        return
    end
    
    -- Валидация через утилиты
    if exports[GetCurrentResourceName()] and exports[GetCurrentResourceName()].MDTValidateIdentifier then
        if not exports[GetCurrentResourceName()]:MDTValidateIdentifier(data.identifier) then
            cb({success = false, error = "Неверный формат идентификатора"})
            return
        end
    end
    
    TriggerServerEvent('mdt:searchCitizen', data.identifier)
    cb('ok')
end)

RegisterNUICallback('saveReport', function(data, cb)
    print('^2[MDT System] ^7Сохранение отчета')
    print('^3[MDT Debug] ^7Данные отчета:', json.encode(data))
    
    if not data or not data.title or not data.content then
        print('^1[MDT System] ^7Ошибка: неполные данные отчета')
        cb('error')
        return
    end
    
    TriggerServerEvent('mdt:saveReport', data)
    cb('ok')
end)

RegisterNUICallback('getReports', function(data, cb)
    print('^2[MDT System] ^7Запрос отчетов')
    TriggerServerEvent('mdt:getReports')
    cb('ok')
end)

-- УБИРАЕМ РЕГИСТРАЦИЮ КОМАНДЫ /mdt - оставляем только клавишу F6
-- Command registration (с проверкой на nil)
local function registerCommands()
    if not configLoaded or not Config or not Config.Command then
        print('^1[MDT System] ^7Ошибка: Config.Command не определен')
        return
    end
    
    -- НЕ регистрируем команду /mdt - только для отладки
    -- RegisterCommand(Config.Command, function()
    --     print('^2[MDT System] ^7Выполнена команда /' .. Config.Command)
    --     print('^3[MDT Debug] ^7Источник: команда игрока')
    --     openMDT()
    -- end, false)
    
    -- Команда для принудительного открытия MDT (для тестирования)
    RegisterCommand('mdt_force_open_debug', function()
        print('^2[MDT System] ^7Принудительное открытие MDT (обход всех проверок)')
        isMDTOpen = true
        SetNuiFocus(true, true)
        
        -- Получаем актуальные данные игрока
        playerData = getPlayerData()
        
        -- Отправляем данные в NUI
        SendNUIMessage({
            type = 'openMDT',
            playerData = playerData
        })
        
        print('^2[MDT System] ^7MDT принудительно открыт')
    end, false)
    
    -- Команда для принудительного закрытия MDT (для тестирования)
    RegisterCommand('mdt_force_close_debug', function()
        print('^2[MDT System] ^7Принудительное закрытие MDT (обход всех проверок)')
        isMDTOpen = false
        SetNuiFocus(false, false)
        
        SendNUIMessage({
            type = 'closeMDT'
        })
        
        print('^2[MDT System] ^7MDT принудительно закрыт')
    end, false)
    
    -- Команда для проверки состояния MDT
    RegisterCommand('mdt_status', function()
        local currentTime = GetGameTimer()
        print('^2[MDT System] ^7=== СТАТУС MDT ===')
        print('^3[MDT Debug] ^7isMDTOpen =', isMDTOpen)
        print('^3[MDT Debug] ^7resourceStarting =', resourceStarting)
        print('^3[MDT Debug] ^7configLoaded =', configLoaded)
        print('^3[MDT Debug] ^7keyBindingRegistered =', keyBindingRegistered)
        print('^3[MDT Debug] ^7NUI Focus =', IsNuiFocused())
        print('^3[MDT Debug] ^7resourceStartTime =', resourceStartTime)
        print('^3[MDT Debug] ^7currentTime =', currentTime)
        print('^3[MDT Debug] ^7timeSinceStart =', currentTime - resourceStartTime)
        print('^3[MDT Debug] ^7lastF6Press =', lastF6Press)
        print('^3[MDT Debug] ^7nuiCallbackCount =', nuiCallbackCount)
        print('^3[MDT Debug] ^7autoOpenAttempts =', autoOpenAttempts)
        print('^2[MDT System] ^7================')
    end, false)
    
    -- Специальная диагностическая команда для тестирования F6
    RegisterCommand('mdt_test_f6', function()
        print('^2[MDT System] ^7=== ТЕСТ F6 ===')
        print('^3[MDT Debug] ^7Симулируем нажатие F6...')
        
        -- Проверяем все условия как в основном обработчике
        if resourceStarting then
            print('^1[MDT Test] ^7Ресурс еще запускается - F6 заблокирована')
            return
        end
        
        if not configLoaded then
            print('^1[MDT Test] ^7Конфигурация не загружена - F6 заблокирована')
            return
        end
        
        if not keyBindingRegistered then
            print('^1[MDT Test] ^7Привязка клавиш не зарегистрирована - F6 заблокирована')
            return
        end
        
        local currentTime = GetGameTimer()
        local timeSinceStart = currentTime - resourceStartTime
        if timeSinceStart < 10000 then
            print('^1[MDT Test] ^7F6 заблокирована в первые 10 секунд после старта')
            return
        end
        
        print('^2[MDT Test] ^7Все проверки пройдены - выполняем действие')
        
        if isMDTOpen then
            print('^2[MDT Test] ^7MDT открыт - закрываем')
            closeMDT()
        else
            print('^2[MDT Test] ^7MDT закрыт - открываем')
            openMDT()
        end
        
        print('^2[MDT System] ^7=== ТЕСТ F6 ЗАВЕРШЕН ===')
    end, false)
    
    -- Команда для мониторинга в реальном времени
    local monitorActive = false
    RegisterCommand('mdt_monitor', function()
        if monitorActive then
            monitorActive = false
            print('^2[MDT System] ^7Мониторинг остановлен')
        else
            monitorActive = true
            print('^2[MDT System] ^7Мониторинг запущен - каждые 2 секунды')
            
            CreateThread(function()
                while monitorActive do
                    Wait(2000)
                    print('^3[MDT Monitor] ^7isMDTOpen =', isMDTOpen, '| NUI Focus =', IsNuiFocused(), '| resourceStarting =', resourceStarting)
                end
            end)
        end
    end, false)
    
    print('^2[MDT System] ^7Команда /mdt ОТКЛЮЧЕНА - используйте клавишу F6')
    print('^2[MDT System] ^7Команда отладки: /mdt_force_open_debug')
    print('^2[MDT System] ^7Команда отладки: /mdt_force_close_debug')
    print('^2[MDT System] ^7Команда отладки: /mdt_status')
    print('^2[MDT System] ^7Команда отладки: /mdt_test_f6')
    print('^2[MDT System] ^7Команда отладки: /mdt_monitor')
    
    -- Команда для полной диагностики системы
    RegisterCommand('mdt_full_diagnostic', function()
        local currentTime = GetGameTimer()
        print('^2[MDT System] ^7=== ПОЛНАЯ ДИАГНОСТИКА MDT ===')
        print('^3[MDT Debug] ^7=== ОСНОВНЫЕ ПЕРЕМЕННЫЕ ===')
        print('^3[MDT Debug] ^7isMDTOpen =', isMDTOpen)
        print('^3[MDT Debug] ^7resourceStarting =', resourceStarting)
        print('^3[MDT Debug] ^7configLoaded =', configLoaded)
        print('^3[MDT Debug] ^7keyBindingRegistered =', keyBindingRegistered)
        print('^3[MDT Debug] ^7debugMode =', debugMode)
        print('^3[MDT Debug] ^7=== ВРЕМЕННЫЕ МЕТКИ ===')
        print('^3[MDT Debug] ^7resourceStartTime =', resourceStartTime)
        print('^3[MDT Debug] ^7currentTime =', currentTime)
        print('^3[MDT Debug] ^7timeSinceStart =', currentTime - resourceStartTime)
        print('^3[MDT Debug] ^7lastF6Press =', lastF6Press)
        print('^3[MDT Debug] ^7=== СЧЕТЧИКИ ===')
        print('^3[MDT Debug] ^7nuiCallbackCount =', nuiCallbackCount)
        print('^3[MDT Debug] ^7autoOpenAttempts =', autoOpenAttempts)
        print('^3[MDT Debug] ^7=== NUI СОСТОЯНИЕ ===')
        print('^3[MDT Debug] ^7NUI Focus =', IsNuiFocused())
        print('^3[MDT Debug] ^7=== КОНФИГУРАЦИЯ ===')
        if Config then
            print('^3[MDT Debug] ^7Config загружен = true')
            if Config.Key then
                print('^3[MDT Debug] ^7Config.Key =', Config.Key)
            end
            if Config.Command then
                print('^3[MDT Debug] ^7Config.Command =', Config.Command)
            end
        else
            print('^3[MDT Debug] ^7Config загружен = false')
        end
        print('^3[MDT Debug] ^7=== ИГРОК ===')
        print('^3[MDT Debug] ^7Player ID =', PlayerId())
        print('^3[MDT Debug] ^7Player Name =', GetPlayerName(PlayerId()))
        print('^3[MDT Debug] ^7Server ID =', GetPlayerServerId(PlayerId()))
        print('^2[MDT System] ^7=== ДИАГНОСТИКА ЗАВЕРШЕНА ===')
    end, false)
    
    print('^2[MDT System] ^7Команда отладки: /mdt_full_diagnostic')
    
    -- Команда для очистки кэша и принудительного обновления
    RegisterCommand('mdt_clear_cache', function()
        print('^2[MDT System] ^7=== ОЧИСТКА КЭША MDT ===')
        
        -- Закрываем MDT если открыт
        if isMDTOpen then
            print('^3[MDT Debug] ^7Закрываем MDT перед очисткой кэша')
            closeMDT()
        end
        
        -- Сбрасываем все счетчики
        nuiCallbackCount = 0
        autoOpenAttempts = 0
        lastF6Press = 0
        
        -- Принудительно обновляем NUI интерфейс
        SendNUIMessage({
            type = 'clearCache',
            timestamp = GetGameTimer()
        })
        
        print('^3[MDT Debug] ^7Счетчики сброшены')
        print('^3[MDT Debug] ^7NUI интерфейс принудительно обновлен')
        print('^2[MDT System] ^7Кэш очищен. Перезапустите ресурс для полной очистки.')
    end, false)
    
    print('^2[MDT System] ^7Команда отладки: /mdt_clear_cache')
end

-- Функция для регистрации привязки клавиш (отдельно от команд)
local function registerKeyBinding()
    if not configLoaded or not Config or not Config.Key then
        print('^1[MDT System] ^7Ошибка: Config.Key не определен')
        return
    end
    
    -- Регистрируем привязку клавиши только после полной загрузки
    if not keyBindingRegistered then
        -- НЕ регистрируем команду через RegisterKeyMapping
        -- RegisterKeyMapping(Config.Command, 'Открыть MDT', 'keyboard', Config.Key)
        keyBindingRegistered = true
        print('^2[MDT System] ^7Горячая клавиша зарегистрирована: ' .. Config.Key)
        print('^2[MDT System] ^7MDT открывается ТОЛЬКО по клавише ' .. Config.Key)
    end
end

-- Обработчик нажатия клавиш для переключения MDT
CreateThread(function()
    while true do
        Wait(0)
        
        -- Проверяем нажатие F6 для переключения MDT
        if IsControlJustPressed(0, 167) then -- F6
            local currentTime = GetGameTimer()
            lastF6Press = currentTime
            
            print('^3[MDT Debug] ^7=== F6 НАЖАТА ===')
            print('^3[MDT Debug] ^7Время нажатия F6:', currentTime)
            print('^3[MDT Debug] ^7Время с последнего нажатия F6:', currentTime - lastF6Press)
            print('^3[MDT Debug] ^7isMDTOpen =', isMDTOpen)
            print('^3[MDT Debug] ^7NUI Focus =', IsNuiFocused())
            print('^3[MDT Debug] ^7resourceStarting =', resourceStarting)
            print('^3[MDT Debug] ^7configLoaded =', configLoaded)
            print('^3[MDT Debug] ^7keyBindingRegistered =', keyBindingRegistered)
            print('^3[MDT Debug] ^7Время с момента старта:', currentTime - resourceStartTime)
            print('^3[MDT Debug] ^7Стек вызовов F6:')
            print(debug.traceback())
            print('^3[MDT Debug] ^7==================')
            
            -- Проверяем все условия перед открытием/закрытием
            if resourceStarting then
                print('^3[MDT Debug] ^7Ресурс еще запускается - F6 заблокирована')
                goto continue
            end
            
            if not configLoaded then
                print('^3[MDT Debug] ^7Конфигурация не загружена - F6 заблокирована')
                goto continue
            end
            
            if not keyBindingRegistered then
                print('^3[MDT Debug] ^7Привязка клавиш не зарегистрирована - F6 заблокирована')
                goto continue
            end
            
            -- Проверяем время с момента старта ресурса
            local currentTime = GetGameTimer()
            local timeSinceStart = currentTime - resourceStartTime
            if timeSinceStart < 10000 then -- 10 секунд после старта
                print('^3[MDT Debug] ^7F6 заблокирована в первые 10 секунд после старта')
                goto continue
            end
            
            if isMDTOpen then
                print('^3[MDT Debug] ^7F6 нажата при открытом MDT - закрываем')
                closeMDT()
            else
                print('^3[MDT Debug] ^7F6 нажата при закрытом MDT - открываем')
                openMDT()
            end
            
            ::continue::
        end
        
        -- Альтернативный способ закрытия MDT - ESC клавиша
        if isMDTOpen and IsControlJustPressed(0, 322) then -- ESC
            print('^3[MDT Debug] ^7ESC нажата при открытом MDT - закрываем')
            closeMDT()
        end
    end
end)

-- Дополнительный поток для мониторинга состояния MDT
CreateThread(function()
    while true do
        Wait(5000) -- Проверяем каждые 5 секунд
        
        if isMDTOpen then
            -- Проверяем, что NUI фокус установлен правильно
            local hasFocus = IsNuiFocused()
            if not hasFocus then
                print('^3[MDT Debug] ^7NUI фокус потерян - восстанавливаем')
                SetNuiFocus(true, true)
            end
        end
    end
end)

-- Export functions
exports('openMDT', openMDT)
exports('closeMDT', closeMDT)
exports('isMDTOpen', function() return isMDTOpen end)

-- Resource start
AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        print('^2[MDT System] ^7Клиентский скрипт MDT загружен')
        print('^3[MDT Debug] ^7Ресурс запускается, resourceStarting = true')
        print('^1[MDT System] ^7ВНИМАНИЕ: MDT НЕ будет открываться автоматически!')
        print('^1[MDT System] ^7ВНИМАНИЕ: Команда /mdt ОТКЛЮЧЕНА!')
        print('^1[MDT System] ^7MDT открывается ТОЛЬКО по клавише F6!')
        
        -- Записываем время старта ресурса
        resourceStartTime = GetGameTimer()
        
        -- Регистрируем команды только после полной загрузки
        CreateThread(function()
            Wait(1000) -- Ждем 1 секунду для полной загрузки
            registerCommands()
            
            -- Снимаем флаг через дополнительную задержку
            Wait(3000) -- Увеличиваем до 3 секунд задержки
            resourceStarting = false
            print('^2[MDT System] ^7Ресурс MDT полностью загружен и готов к использованию')
            print('^3[MDT Debug] ^7resourceStarting установлен в false')
            
            -- Регистрируем привязку клавиш только после снятия блокировки
            Wait(1000) -- Еще 1 секунда задержки
            registerKeyBinding()
            
            print('^2[MDT System] ^7MDT готов к использованию по клавише F6')
            print('^2[MDT System] ^7Автоматическое открытие заблокировано на 10 секунд после старта')
        end)
    end
end)

-- Resource stop
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName and isMDTOpen then
        print('^3[MDT System] ^7Остановка ресурса MDT - закрываем интерфейс')
        closeMDT()
    end
end) 