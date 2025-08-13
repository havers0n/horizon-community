import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/shared/contexts/SessionContext'

type StageGuardProps = {
  requiredStage: string
  children: React.ReactNode
}

export const StageGuard: React.FC<StageGuardProps> = ({ requiredStage, children }) => {
  const { session, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const tracks = session?.cadetTracks || []
  const hasStage = tracks.some(t => (t?.stage_code || '').toLowerCase() === requiredStage.toLowerCase())

  if (!hasStage) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}


