// FiveM NUI Communication Script
console.log('[MDT NUI] Скрипт NUI загружен');

// Функция для отправки сообщений обратно в клиентский скрипт
function sendToClient(data) {
    console.log('[MDT NUI] Отправляем в клиент:', data);
    
    // Используем правильный метод для FiveM NUI
    try {
        // Метод 1: fetch (самый надежный способ)
        fetch('https://mdt-system/nuiCallback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            console.log('[MDT NUI] Ответ от клиента:', response);
        }).catch(error => {
            console.error('[MDT NUI] Ошибка fetch:', error);
        });
        
        console.log('[MDT NUI] Использован fetch');
        
        // Метод 2: $.post (jQuery, если доступен)
        if (typeof $ !== 'undefined') {
            $.post('https://mdt-system/nuiCallback', JSON.stringify(data));
            console.log('[MDT NUI] Также отправлен через $.post');
        }
        
        // Метод 3: invokeNative (для новых версий FiveM) - отключен
        // if (window.invokeNative) {
        //     window.invokeNative('0x04918A41BC9B8157', -1, 'nuiCallback', JSON.stringify(data));
        //     console.log('[MDT NUI] Использован invokeNative');
        //     return;
        // }
        
    } catch (error) {
        console.error('[MDT NUI] Ошибка отправки:', error);
    }
}

// Обработчик нажатия клавиш
document.addEventListener('keydown', function(event) {
    console.log('[MDT NUI] Клавиша нажата:', event.key, 'Код:', event.keyCode, 'which:', event.which);
    
    // F6 - закрытие MDT
    if (event.key === 'F6' || event.keyCode === 117 || event.which === 117) {
        console.log('[MDT NUI] F6 нажата - закрываем MDT');
        event.preventDefault();
        event.stopPropagation();
        sendToClient({
            type: 'closeMDT',
            reason: 'F6_pressed'
        });
        return false;
    }
    
    // ESC - закрытие MDT
    if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
        console.log('[MDT NUI] ESC нажата - закрываем MDT');
        event.preventDefault();
        event.stopPropagation();
        sendToClient({
            type: 'closeMDT',
            reason: 'ESC_pressed'
        });
        return false;
    }
    
    // Enter - подтверждение действия
    if (event.key === 'Enter' || event.keyCode === 13 || event.which === 13) {
        console.log('[MDT NUI] Enter нажата');
        // Здесь можно добавить логику для подтверждения действий
    }
});

// Обработчик кликов вне интерфейса
document.addEventListener('click', function(event) {
    // Если клик был вне основного контейнера, закрываем MDT
    const root = document.getElementById('root');
    if (root && !root.contains(event.target)) {
        console.log('[MDT NUI] Клик вне интерфейса - закрываем MDT');
        sendToClient({
            type: 'closeMDT',
            reason: 'click_outside'
        });
    }
});

// Обработчик сообщений от клиентского скрипта
window.addEventListener('message', function(event) {
    console.log('[MDT NUI] Получено сообщение:', event.data);
    
    const data = event.data;
    
    if (data.type === 'openMDT') {
        console.log('[MDT NUI] Открытие MDT');
        // Здесь можно добавить логику для открытия интерфейса
        document.body.style.display = 'block';
        
        // Устанавливаем фокус на body для получения событий клавиатуры
        document.body.focus();
        document.body.tabIndex = -1;
    }
    
    if (data.type === 'closeMDT') {
        console.log('[MDT NUI] Закрытие MDT');
        // Здесь можно добавить логику для закрытия интерфейса
        document.body.style.display = 'none';
    }
    
    if (data.type === 'updateData') {
        console.log('[MDT NUI] Обновление данных:', data.payload);
        // Здесь можно добавить логику для обновления данных в интерфейсе
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('[MDT NUI] DOM загружен, интерфейс готов');
    
    // Устанавливаем фокус на интерфейс
    document.body.focus();
    document.body.tabIndex = -1;
    
    // Отправляем сообщение о готовности
    sendToClient({
        type: 'nuiReady',
        timestamp: Date.now()
    });
});

// Обработчик потери фокуса
window.addEventListener('blur', function() {
    console.log('[MDT NUI] Окно потеряло фокус');
    // Можно добавить логику для обработки потери фокуса
});

// Обработчик получения фокуса
window.addEventListener('focus', function() {
    console.log('[MDT NUI] Окно получило фокус');
    // Можно добавить логику для обработки получения фокуса
});

console.log('[MDT NUI] Скрипт NUI полностью загружен и готов к работе'); 