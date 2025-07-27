// NUI Bridge для MDT System
// Мост между FiveM NUI и React приложением

let isMDTOpen = false;
let playerData = null;

// Основная функция для отправки данных в клиент
function sendToClient(data) {
    console.log('[MDT NUI Bridge] Отправляем в клиент:', data);
    
    try {
        // Метод 1: fetch (самый надежный способ)
        fetch('https://mdt-system/nuiCallback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            console.log('[MDT NUI Bridge] Ответ от клиента:', response.status);
        }).catch(error => {
            console.error('[MDT NUI Bridge] Ошибка fetch:', error);
        });
        
        // Метод 2: $.post (jQuery, если доступен)
        if (typeof $ !== 'undefined') {
            $.post('https://mdt-system/nuiCallback', JSON.stringify(data))
                .done(function() {
                    console.log('[MDT NUI Bridge] $.post успешно отправлен');
                })
                .fail(function(xhr, status, error) {
                    console.error('[MDT NUI Bridge] $.post ошибка:', error);
                });
        }
        
    } catch (error) {
        console.error('[MDT NUI Bridge] Ошибка отправки:', error);
    }
}

// Обработчик клавиатуры
document.addEventListener('keydown', function(event) {
    const keyCode = event.keyCode;
    const keyName = event.key;
    
    console.log('[MDT NUI Bridge] Клавиша нажата:', keyName, '(код:', keyCode, ')');
    
    // Предотвращаем стандартное поведение браузера
    event.preventDefault();
    event.stopPropagation();
    
    // F6 (код 117) - переключение MDT
    if (keyCode === 117) {
        console.log('[MDT NUI Bridge] F6 нажата - переключаем MDT');
        sendToClient({
            type: 'toggleMDT',
            reason: 'F6_pressed',
            timestamp: Date.now()
        });
        return false;
    }
    
    // ESC (код 27) - закрытие MDT
    if (keyCode === 27 && isMDTOpen) {
        console.log('[MDT NUI Bridge] ESC нажата - закрываем MDT');
        sendToClient({
            type: 'closeMDT',
            reason: 'ESC_pressed',
            timestamp: Date.now()
        });
        return false;
    }
});

// Обработчик сообщений от клиента
window.addEventListener('message', function(event) {
    const data = event.data;
    console.log('[MDT NUI Bridge] Получено сообщение от клиента:', data);
    
    if (data.type === 'openMDT') {
        console.log('[MDT NUI Bridge] Открытие MDT');
        isMDTOpen = true;
        playerData = data.playerData;
        
        // Показываем интерфейс
        document.body.style.display = 'block';
        document.body.style.visibility = 'visible';
        
        // Устанавливаем фокус на body для получения событий клавиатуры
        document.body.focus();
        document.body.tabIndex = -1;
        
        // Отправляем данные в React приложение
        window.postMessage({
            type: 'MDT_OPEN',
            playerData: playerData
        }, '*');
        
    } else if (data.type === 'closeMDT') {
        console.log('[MDT NUI Bridge] Закрытие MDT');
        isMDTOpen = false;
        
        // Скрываем интерфейс
        document.body.style.display = 'none';
        document.body.style.visibility = 'hidden';
        
        // Отправляем данные в React приложение
        window.postMessage({
            type: 'MDT_CLOSE'
        }, '*');
        
    } else if (data.type === 'updateData') {
        console.log('[MDT NUI Bridge] Обновление данных:', data.payload);
        // Отправляем данные в React приложение
        window.postMessage({
            type: 'MDT_UPDATE_DATA',
            payload: data.payload
        }, '*');
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('[MDT NUI Bridge] DOM загружен');
    
    // Скрываем интерфейс по умолчанию
    document.body.style.display = 'none';
    document.body.style.visibility = 'hidden';
    
    // Устанавливаем фокус на body для получения событий клавиатуры
    document.body.focus();
    document.body.tabIndex = -1;
    
    console.log('[MDT NUI Bridge] Система инициализирована');
    
    // Отправляем сообщение о готовности
    sendToClient({
        type: 'ready',
        timestamp: Date.now()
    });
});

// Обработчик потери фокуса
window.addEventListener('blur', function() {
    console.log('[MDT NUI Bridge] Окно потеряло фокус');
});

// Обработчик получения фокуса
window.addEventListener('focus', function() {
    console.log('[MDT NUI Bridge] Окно получило фокус');
    document.body.focus();
});

// Экспортируем функции для использования в React
window.MDTBridge = {
    sendToClient: sendToClient,
    isMDTOpen: () => isMDTOpen,
    getPlayerData: () => playerData
}; 