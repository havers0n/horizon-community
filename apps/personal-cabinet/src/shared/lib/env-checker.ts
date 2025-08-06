// Утилита для проверки переменных окружения
export const checkEnvironmentVariables = () => {
  console.log('🔍 [Personal Cabinet] Проверка переменных окружения...')
  
  const envVars = {
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'VITE_ENABLE_ANALYTICS': import.meta.env.VITE_ENABLE_ANALYTICS,
    'VITE_ENABLE_DEBUG_MODE': import.meta.env.VITE_ENABLE_DEBUG_MODE,
  }
  
  let allSet = true
  
  Object.entries(envVars).forEach(([key, value]) => {
    const status = value ? '✅ Установлен' : '❌ Отсутствует'
    console.log(`🔧 [Personal Cabinet] ${key}: ${status}`)
    
    if (!value && key.startsWith('VITE_SUPABASE_') || key === 'VITE_API_URL') {
      allSet = false
    }
  })
  
  if (allSet) {
    console.log('✅ [Personal Cabinet] Все критичные переменные окружения установлены')
  } else {
    console.warn('⚠️ [Personal Cabinet] Некоторые переменные окружения отсутствуют')
    console.warn('⚠️ [Personal Cabinet] Создайте файл .env на основе env.example')
  }
  
  return allSet
}

// Проверка подключения к Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { supabase } = await import('./supabase')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('🔴 [Personal Cabinet] Ошибка подключения к Supabase:', error.message)
      return false
    }
    
    console.log('✅ [Personal Cabinet] Подключение к Supabase успешно')
    return true
  } catch (error) {
    console.error('🔴 [Personal Cabinet] Ошибка при проверке Supabase:', error)
    return false
  }
}

// Проверка подключения к API
export const checkApiConnection = async () => {
  try {
    const { apiClient } = await import('../api/api-client')
    const response = await apiClient.get('/health')
    
    console.log('✅ [Personal Cabinet] Подключение к API успешно')
    return true
  } catch (error) {
    console.error('🔴 [Personal Cabinet] Ошибка подключения к API:', error)
    return false
  }
} 