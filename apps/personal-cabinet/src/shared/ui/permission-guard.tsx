import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/shared/contexts/SessionContext'

type PermissionGuardProps = {
  permission: string
  children: React.ReactNode
}

const Loading: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children }) => {
  const { session, isLoading } = useSession()

  if (isLoading) return <Loading />

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const hasPermission = Array.isArray(session.permissions) && session.permissions.includes(permission)

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default PermissionGuard
