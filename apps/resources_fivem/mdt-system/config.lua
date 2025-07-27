-- MDT System Configuration
-- RolePlayIdentity MDT System - Framework Independent

Config = {}

-- Основные настройки
Config.Command = 'mdt'
Config.Key = 'F6'
Config.LogLevel = 'info' -- debug, info, warn, error

-- Настройки базы данных
Config.Database = {
    table = 'mdt_reports',
    citizens_table = 'mdt_citizens',
    use_external_db = false -- true если используете внешнюю БД
}

-- Настройки анимаций
Config.Animations = {
    open_animation = 'tablet2',
    close_animation = 'c',
    use_animations = true
}

-- Настройки уведомлений
Config.Notifications = {
    use_chat = true,
    use_notify = false, -- если используете систему уведомлений
    colors = {
        success = {0, 255, 0},
        error = {255, 0, 0},
        info = {0, 255, 255},
        warning = {255, 255, 0}
    }
}

-- Настройки безопасности
Config.Security = {
    log_unauthorized_access = false, -- отключено, так как разрешения убраны
    rate_limit = {
        enabled = true,
        max_requests = 10,
        time_window = 60 -- секунды
    }
}

-- Настройки UI
Config.UI = {
    default_theme = 'dark',
    language = 'ru',
    auto_save = true,
    auto_save_interval = 30 -- секунды
}

-- Интеграция с фреймворками (опционально)
Config.Framework = {
    -- ESX Integration (опционально)
    esx = {
        enabled = false,
        resource_name = 'es_extended'
    },
    
    -- QBCore Integration (опционально)
    qbcore = {
        enabled = false,
        resource_name = 'qb-core'
    },
    
    -- Standalone Mode (рекомендуется)
    standalone = {
        enabled = true,
        player_data_function = 'GetPlayerData', -- функция для получения данных игрока
        job_function = 'GetPlayerJob', -- функция для получения профессии
        identifier_function = 'GetPlayerIdentifier' -- функция для получения идентификатора
    }
}

-- Настройки логирования
Config.Logging = {
    enabled = true,
    file_logging = false,
    log_file = 'mdt_system.log',
    log_rotation = {
        enabled = true,
        max_size = 10, -- MB
        max_files = 5
    }
}

-- Настройки производительности
Config.Performance = {
    cache_enabled = true,
    cache_duration = 300, -- секунды
    max_search_results = 50,
    pagination_size = 10
}

return Config 