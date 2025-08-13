import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/shared/api/api-client'

export type UserSession = {
  user: { id: string; username: string | null }
  roles: string[]
  permissions: string[]
  statuses: string[]
  cadetTracks?: Array<{
    id?: string
    department_id?: string | null
    stage_code?: string | null
    is_active?: boolean
    [key: string]: any
  }>
}

type SessionResponse = {
  success: boolean
  data: UserSession
}

type SessionContextType = {
  session: UserSession | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await apiClient.get<SessionResponse>('/auth/me/session')
      if (!res.success) {
        throw new Error(res.message || 'Failed to fetch session')
      }
      setSession(res.data)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch session')
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [])

  const value = useMemo<SessionContextType>(() => ({
    session,
    isLoading,
    error,
    refetch: fetchSession,
  }), [session, isLoading, error])

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = (): SessionContextType => {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}


