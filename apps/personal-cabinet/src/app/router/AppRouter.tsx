import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/ui/protected-route'
import { StageGuard } from '@/shared/ui/StageGuard'
import { PermissionGuard } from '@/shared/ui/permission-guard'
import { PageLoader } from '../../shared/ui/page-loader'

// Lazy loaded pages - centralized for better organization
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
  Documents: React.lazy(() => import('@/pages/documents')),
  
  // Specialized pages
  AdminTests: React.lazy(() => import('@/pages/admin/tests')),
  ApplicationTest: React.lazy(() => import('@/pages/applications/test')),
  TestSession: React.lazy(() => import('@/pages/tests/session')),
  TestResult: React.lazy(() => import('@/pages/tests/result')),
  AdminApplications: React.lazy(() => import('@/pages/admin/applications')),
  AdminGalleryModeration: React.lazy(() => import('@/pages/admin/gallery-moderation')),
  AdminDocuments: React.lazy(() => import('@/pages/admin/documents')),
  DocumentEditor: React.lazy(() => import('@/pages/admin/documents/editor')),
}

/**
 * Application routing configuration
 * Separated into dedicated component for better organization
 * Follows FSD architecture principles
 */
export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<pages.Homepage />} />
        <Route path="/login" element={<pages.Login />} />
        <Route path="/register" element={<pages.Register />} />
        <Route path="/faq" element={<pages.FAQ />} />
        <Route path="/docs" element={<pages.Documents />} />
        <Route path="/documents" element={<pages.Documents />} />
        
        {/* Protected routes */}
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
          
          {/* Administrative routes */}
          <Route 
            path="/admin/*" 
            element={
              <>
                {console.log('%c[AppRouter] Admin route accessed!', 'color: orange; font-weight: bold;')}
                <PermissionGuard permission="admin.panel.access">
                  <Routes>
                    <Route index element={<pages.AdminPanel />} />
                    <Route path="tests" element={<pages.AdminTests />} />
                    <Route path="applications" element={<pages.AdminApplications />} />
                    <Route path="gallery" element={<pages.AdminGalleryModeration />} />
                    <Route path="documents" element={<pages.AdminDocuments />} />
                    <Route path="documents/editor/:id?" element={<pages.DocumentEditor />} />
                  </Routes>
                </PermissionGuard>
              </>
            }
          />
        </Route>
        
        {/* Redirects and 404 */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<pages.NotFound />} />
      </Routes>
    </Suspense>
  )
}