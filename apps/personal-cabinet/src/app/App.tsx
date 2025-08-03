import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/shared/ui/toaster'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { AuthProvider } from '@/features/auth'
import { ThemeProvider } from '@/features/theme'
import { queryClient } from '@/shared/lib/queryClient'

// Lazy loaded pages
const Homepage = React.lazy(() => import('@/pages/homepage'))
const Login = React.lazy(() => import('@/pages/auth/login'))
const Register = React.lazy(() => import('@/pages/auth/register'))
const Dashboard = React.lazy(() => import('@/pages/dashboard'))
const Departments = React.lazy(() => import('@/pages/departments'))
const Applications = React.lazy(() => import('@/pages/applications'))
const Reports = React.lazy(() => import('@/pages/reports'))
const Tests = React.lazy(() => import('@/pages/tests'))
const Support = React.lazy(() => import('@/pages/support'))
const AdminPanel = React.lazy(() => import('@/pages/admin'))
const FAQ = React.lazy(() => import('@/pages/faq'))
const MDT = React.lazy(() => import('@/pages/mdt'))
const NotFound = React.lazy(() => import('@/pages/not-found'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router>
              <React.Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Homepage />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Interface routes */}
                  <Route path="/mdt" element={<MDT />} />

                  {/* Protected routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/departments" element={<Departments />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/tests" element={<Tests />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/admin" element={<AdminPanel />} />

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </React.Suspense>
              <Toaster />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App 