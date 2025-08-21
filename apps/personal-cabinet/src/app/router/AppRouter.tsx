import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/ui/protected-route'
import { StageGuard } from '@/shared/ui/StageGuard'
import { PermissionGuard } from '@/shared/ui/permission-guard'
import { PageLoader } from '@/shared/ui/page-loader'

// Lazy loaded pages - централизованно
const pages = {
  Homepage: React.lazy(() => import('@/pages/homepage')),
  Login: React.lazy(() => import('@/pages/auth/login')),
  Register: React.lazy(() => import('@/pages/auth/register')),
  Dashboard: React.lazy(() => import('@/pages/dashboard')),
  Profile: React.lazy(() => import('@/pages/profile')),
  Settings: React.lazy(() => import('@/pages/settings')),
  Departments: React.lazy(() => import('@/pages/departments')),
  Applications: React.lazy(() => import('@/pages/applications')),
  Reports: React.lazy(() => import('@/pages/reports')),
  Tests: React.lazy(() => import('@/pages/tests')),
  Support: React.lazy(() => import('@/pages/support')),
  AdminPanel: React.lazy(() => import('@/pages/admin')),
  FAQ: React.lazy(() => import('@/pages/faq')),
  Gallery: React.lazy(() => import('@/pages/gallery')),
  NotFound: React.lazy(() => import('@/pages/not-found')),
  
  // Специализированные страницы
  AdminTests: React.lazy(() => import('@/pages/admin/tests')),
  ApplicationTest: React.lazy(() => import('@/pages/applications/test')),
  TestSession: React.lazy(() => import('@/pages/tests/session')),
  TestResult: React.lazy(() => import('@/pages/tests/result')),
  AdminApplications: React.lazy(() => import('@/pages/admin/applications')),
  AdminGalleryModeration: React.lazy(() => import('@/pages/admin/gallery-moderation')),
}

/**
 * Конфигурация роутинга приложения
 * Выделена в отдельный компонент для лучшей организации
 */
export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<pages.Homepage />} />
        <Route path="/login" element={<pages.Login />} />
        <Route path="/register" element={<pages.Register />} />
        <Route path="/faq" element={<pages.FAQ />} />
        
        {/* Защищенные маршруты */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<pages.Dashboard />} />
          <Route path="/profile" element={<pages.Profile />} />
          <Route path="/settings" element={<pages.Settings />} />
          <Route path="/departments" element={<pages.Departments />} />
          <Route path="/applications" element={<pages.Applications />} />
          <Route path="/applications/test/:testId" element={<pages.ApplicationTest />} />
          <Route path="/reports" element={<pages.Reports />} />
          <Route path="/tests" element={<pages.Tests />} />
          <Route path="/tests/session/:sessionId" element={<pages.TestSession />} />
          <Route path="/tests/result/:resultId" element={<pages.TestResult />} />
          <Route path="/support" element={<pages.Support />} />
          <Route path="/gallery" element={<pages.Gallery />} />
          
          {/* Административные маршруты */}
          <Route 
            path="/admin/*" 
            element={
              <PermissionGuard requiredPermission="admin">
                <Routes>
                  <Route index element={<pages.AdminPanel />} />
                  <Route path="tests" element={<pages.AdminTests />} />
                  <Route path="applications" element={<pages.AdminApplications />} />
                  <Route path="gallery" element={<pages.AdminGalleryModeration />} />
                </Routes>
              </PermissionGuard>
            }
          />
        </Route>
        
        {/* Перенаправления и 404 */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<pages.NotFound />} />
      </Routes>
    </Suspense>
  )
}