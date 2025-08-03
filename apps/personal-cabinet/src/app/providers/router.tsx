import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardPage } from '@pages/dashboard'
import { ProfilePage } from '@pages/profile'
import { SettingsPage } from '@pages/settings'
import { LoginPage } from '@pages/auth/login'
import { RegisterPage } from '@pages/auth/register'

export function AppRouter() {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Защищенные маршруты */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      
      {/* Редирект по умолчанию */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
} 