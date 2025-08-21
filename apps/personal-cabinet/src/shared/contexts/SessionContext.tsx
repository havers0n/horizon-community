import React, { createContext, useContext, useMemo } from 'react'
import { apiClient } from '@/shared/api/api-client'
import { useQuery } from '@tanstack/react-query'

export type UserSession = {
  user: { id: string; username: string | null }
  roles: Array<{ code: string; name: string }>
  permissions: string[]
  statuses: string[]
  attemptsLeft?: number
  cadetTracks?: Array<{
    id?: string
    department_id?: string | null
    stage_code?: string | null
    is_active?: boolean
    [key: string]: any
  }>
  // Новое поле: заявки пользователя (обогащение сессии)
  applications?: Array<{
    id: string | null
    type?: string | null
    status_code?: string | null
    status_name?: string | null
    created_at?: string | null
    department_name?: string | null
    [key: string]: any
  }>
  // Новые поля для полноценного профиля (этап 5)
  memberships?: Array<{
    status: {
      id: string
      code: string
      name: string
    }
    rank: {
      id: string
      name: string
      order_index?: number
    }
    department: {
      id: string
      name: string // Short name/abbreviation (LSPD, BCSO)
      full_name?: string // Full department name (Los Santos Police Department)
    }
    position?: string
    is_primary: boolean
  }>
  qualifications?: Array<{
    id: string
    name: string
    department: {
      id: string
      name: string // Short name/abbreviation (LSPD, BCSO)
      full_name?: string // Full department name (Los Santos Police Department)
    }
  }>
  // Вычисляемые поля для совмещений (отображение через '/')
  combinedRank?: string
  combinedPosition?: string
  combinedDepartment?: string
}

type SessionResponse = {
  success: boolean
  data: UserSession
  message?: string
}

type SessionContextType = {
  session: UserSession | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UserSession, Error>({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await apiClient.get<SessionResponse>('/auth/me/session')
      if (!(res as any)?.success) {
        throw new Error((res as any)?.message || 'Failed to fetch session')
      }
      return (res as any).data as UserSession
    },
    // Обновлять данные при возвращении во вкладку
    refetchOnWindowFocus: true,
    // Периодический опрос каждые 30 секунд
    refetchInterval: 30000,
  })

  const value = useMemo<SessionContextType>(() => ({
    session: data ?? null,
    isLoading,
    error: isError ? (error?.message || 'Failed to fetch session') : null,
    refetch: async () => { await refetch() },
  }), [data, isLoading, isError, error, refetch])

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


