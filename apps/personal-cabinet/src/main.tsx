import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'
import { checkEnvironmentVariables } from './shared/lib/env-checker'

// Логирование при запуске приложения
console.log('🚀 [Personal Cabinet] Запуск приложения...')
console.log('🔧 [Personal Cabinet] NODE_ENV:', import.meta.env.MODE)
console.log('🔧 [Personal Cabinet] Все переменные окружения:', import.meta.env)

// Проверка переменных окружения
const envCheck = checkEnvironmentVariables()
console.log('🔧 [Personal Cabinet] Результат проверки переменных:', envCheck)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 