/**
 * Утилиты для работы с шаблонами рапортов
 * Основано на логике из единая-система-учета-рапортов
 */

/**
 * Извлекает переменные из текста шаблона
 * @param text - текст шаблона
 * @returns массив найденных переменных
 */
export const extractVariables = (text: string): string[] => {
  const regex = /{{\s*([^}]+?)\s*}}/g;
  const matches = text.match(regex);
  if (!matches) {
    return [];
  }
  const variables = matches.map(match => match.replace(/{{\s*|\s*}}/g, ''));
  return Array.from(new Set(variables));
};

/**
 * Рендерит предварительный просмотр шаблона с заполненными значениями
 * @param templateBody - тело шаблона
 * @param values - значения для подстановки
 * @returns заполненный текст
 */
export const renderPreview = (templateBody: string, values: Record<string, string>): string => {
  if (!templateBody) return '';
  return templateBody.replace(/{{\s*([^}]+?)\s*}}/g, (match, variableName) => {
    return values[variableName] || '';
  });
};

/**
 * Определяет тип поля ввода на основе названия переменной
 * @param variableName - название переменной
 * @returns тип поля ввода
 */
export const getInputType = (variableName: string): 'text' | 'date' | 'time' | 'textarea' => {
  const lowerVar = variableName.toLowerCase();
  
  if (lowerVar.includes('дата')) return 'date';
  if (lowerVar.includes('время')) return 'time';
  if (lowerVar.includes('описание') || 
      lowerVar.includes('обстоятельства') || 
      lowerVar.includes('жалобы') ||
      lowerVar.includes('осмотр') ||
      lowerVar.includes('помощь') ||
      lowerVar.includes('диагноз')) return 'textarea';
  
  return 'text';
};

/**
 * Проверяет, является ли переменная обязательной
 * @param variableName - название переменной
 * @returns true если обязательная
 */
export const isRequiredField = (variableName: string): boolean => {
  const lowerVar = variableName.toLowerCase();
  
  // Основные обязательные поля
  const requiredFields = [
    'имя_офицера', 'должность', 'дата', 'время', 'место_происшествия',
    'фио_пациента', 'возраст_пациента', 'марка_модель', 'гос_номер',
    'водитель', 'адрес_пожара', 'руководитель_тушения'
  ];
  
  return requiredFields.some(field => lowerVar.includes(field));
};

/**
 * Генерирует уникальный ID для шаблона
 * @returns уникальный ID
 */
export const generateTemplateId = (): string => {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Валидирует шаблон рапорта
 * @param template - шаблон для валидации
 * @returns объект с результатом валидации
 */
export const validateTemplate = (template: { title: string; body: string }) => {
  const errors: string[] = [];
  
  if (!template.title?.trim()) {
    errors.push('Название шаблона обязательно');
  }
  
  if (!template.body?.trim()) {
    errors.push('Тело шаблона обязательно');
  }
  
  if (template.title && template.title.length > 100) {
    errors.push('Название шаблона не должно превышать 100 символов');
  }
  
  if (template.body && template.body.length > 10000) {
    errors.push('Тело шаблона не должно превышать 10000 символов');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Форматирует дату для отображения
 * @param date - дата
 * @returns отформатированная строка
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Форматирует время для отображения
 * @param time - время
 * @returns отформатированная строка
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  return time;
};

/**
 * Создает заголовок для заполненного рапорта
 * @param templateTitle - название шаблона
 * @param fieldValues - заполненные значения
 * @returns заголовок рапорта
 */
export const generateReportTitle = (templateTitle: string, fieldValues: Record<string, string>): string => {
  const date = fieldValues['ДАТА'] || fieldValues['ДАТА_ДТП'] || fieldValues['ДАТА_ВЫЗОВА'] || fieldValues['ДАТА_И_ВРЕМЯ'];
  const location = fieldValues['МЕСТО_ПРОИСШЕСТВИЯ'] || fieldValues['МЕСТО_ДТП'] || fieldValues['АДРЕС_ПОЖАРА'];
  
  let title = templateTitle;
  
  if (date) {
    title += ` - ${date}`;
  }
  
  if (location) {
    title += ` - ${location}`;
  }
  
  return title;
}; 