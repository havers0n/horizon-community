export const extractVariables = (text: string): string[] => {
  const variableRegex = /\{\{([^}]+)\}\}/g
  const variables: string[] = []
  let match

  while ((match = variableRegex.exec(text)) !== null) {
    const variable = match[1].trim()
    if (!variables.includes(variable)) {
      variables.push(variable)
    }
  }

  return variables
}

export const renderPreview = (templateBody: string, values: Record<string, string>): string => {
  return templateBody.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const key = variable.trim()
    return values[key] || match
  })
}

export const getInputType = (variableName: string): 'text' | 'date' | 'time' | 'textarea' => {
  const lowerName = variableName.toLowerCase()
  
  if (lowerName.includes('date') || lowerName.includes('дата')) {
    return 'date'
  }
  
  if (lowerName.includes('time') || lowerName.includes('время')) {
    return 'time'
  }
  
  if (lowerName.includes('description') || lowerName.includes('описание') || 
      lowerName.includes('reason') || lowerName.includes('причина') ||
      lowerName.includes('comment') || lowerName.includes('комментарий')) {
    return 'textarea'
  }
  
  return 'text'
}

export const isRequiredField = (variableName: string): boolean => {
  const requiredKeywords = [
    'name', 'имя', 'фамилия', 'lastname', 'firstname',
    'date', 'дата', 'time', 'время',
    'location', 'место', 'address', 'адрес',
    'description', 'описание', 'reason', 'причина'
  ]
  
  const lowerName = variableName.toLowerCase()
  return requiredKeywords.some(keyword => lowerName.includes(keyword))
}

export const generateTemplateId = (): string => {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const validateTemplate = (template: { title: string; body: string }) => {
  const errors: string[] = []

  if (!template.title.trim()) {
    errors.push('Название шаблона обязательно')
  }

  if (!template.body.trim()) {
    errors.push('Содержимое шаблона обязательно')
  }

  if (template.title.length > 100) {
    errors.push('Название не должно превышать 100 символов')
  }

  if (template.body.length > 10000) {
    errors.push('Содержимое не должно превышать 10000 символов')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const formatTime = (time: string): string => {
  if (!time) return ''
  
  const [hours, minutes] = time.split(':')
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}

export const generateReportTitle = (templateTitle: string, fieldValues: Record<string, string>): string => {
  let title = templateTitle
  
  // Заменяем переменные в заголовке на реальные значения
  Object.entries(fieldValues).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    title = title.replace(regex, value)
  })
  
  return title
} 