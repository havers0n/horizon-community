import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/shared/ui/toaster'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { AuthProvider } from '@/features/auth'
import { SessionProvider } from '@/shared/contexts/SessionContext'
import { StageGuard } from '@/shared/ui/StageGuard'
import { ThemeProvider } from '@/features/theme'
import { ProtectedRoute } from '@/shared/ui/protected-route'
// import { ConnectionStatus } from '@/shared/ui/connection-status'
import { queryClient } from '@/shared/lib'
import { useAuth } from '@/features/auth'

// Lazy loaded pages
const Homepage = React.lazy(() => import('@/pages/homepage'))
const Login = React.lazy(() => import('@/pages/auth/login'))
const Register = React.lazy(() => import('@/pages/auth/register'))
const Dashboard = React.lazy(() => import('@/pages/dashboard'))
const Profile = React.lazy(() => import('@/pages/profile'))
const Settings = React.lazy(() => import('@/pages/settings'))
const Departments = React.lazy(() => import('@/pages/departments'))
const Applications = React.lazy(() => import('@/pages/applications'))
const Reports = React.lazy(() => import('@/pages/reports'))
const Tests = React.lazy(() => import('@/pages/tests'))
const Support = React.lazy(() => import('@/pages/support'))
const AdminPanel = React.lazy(() => import('@/pages/admin'))
const FAQ = React.lazy(() => import('@/pages/faq'))
const Gallery = React.lazy(() => import('@/pages/gallery'))
const NotFound = React.lazy(() => import('@/pages/not-found'))
const AdminTestsPage = React.lazy(() => import('@/pages/admin/tests'))
const AdminTestNewPage = React.lazy(() => import('@/pages/admin/tests/new'))
const AdminTestEditPage = React.lazy(() => import('@/pages/admin/tests/edit'))
const ApplicationTestPage = React.lazy(() => import('@/pages/applications/test'))
const AdminApplicationsPage = React.lazy(() => import('@/pages/admin/applications'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
)

function App() {
  // Логирование инициализации приложения
  console.log('✅ [Personal Cabinet] Приложение инициализировано')
  console.log('✅ [Personal Cabinet] Все провайдеры подключены')

  const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth()
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }
    if (!user) return <Navigate to="/login" replace />
    const allowedRoles = ['admin', 'supervisor']
    if (!allowedRoles.includes((user.role as any) || '')) {
      return <Navigate to="/dashboard" replace />
    }
    return <>{children}</>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider>
          <AuthProvider>
            <TooltipProvider>
            <Router>
              <React.Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Homepage />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/cadet/test"
                      element={
                        <StageGuard requiredStage="cadet_test">
                          <React.Suspense fallback={<LoadingSpinner />}>
                            {React.createElement(React.lazy(() => import('@/pages/cadet/test')))}
                          </React.Suspense>
                        </StageGuard>
                      }
                    />
                    <Route
                      path="/cadet/training"
                      element={
                        <StageGuard requiredStage="cadet_training">
                          <React.Suspense fallback={<LoadingSpinner />}>
                            {React.createElement(React.lazy(() => import('@/pages/cadet/training')))}
                          </React.Suspense>
                        </StageGuard>
                      }
                    />
                    <Route
                      path="/cadet/test"
                      element={
                        <StageGuard requiredStage="cadet_test">
                          <React.Suspense fallback={<LoadingSpinner />}>
                            {React.createElement(React.lazy(() => import('@/pages/cadet/test')))}
                          </React.Suspense>
                        </StageGuard>
                      }
                    />
                    <Route
                      path="/cadet/training"
                      element={
                        <StageGuard requiredStage="cadet_training">
                          <React.Suspense fallback={<LoadingSpinner />}>
                            {React.createElement(React.lazy(() => import('@/pages/cadet/training')))}
                          </React.Suspense>
                        </StageGuard>
                      }
                    />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/applications/:applicationId/test" element={<ApplicationTestPage />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route
                      path="/admin/tests"
                      element={
                        <AdminRoute>
                          <AdminTestsPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/tests/new"
                      element={
                        <AdminRoute>
                          <AdminTestNewPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/tests/:id/edit"
                      element={
                        <AdminRoute>
                          <AdminTestEditPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/applications"
                      element={
                        <AdminRoute>
                          <AdminApplicationsPage />
                        </AdminRoute>
                      }
                    />
                  </Route>

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
              <Toaster />
              {/* <ConnectionStatus /> */}
            </Router>
            </TooltipProvider>
          </AuthProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App 