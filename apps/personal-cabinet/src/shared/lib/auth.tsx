import type { Database } from '@roleplay-identity/db-types'

type Profiles = Database['public']['Tables']['profiles']['Row']

export interface AuthState {
  user: Profiles | null
  accessToken: string | null
  refreshToken: string | null
}

export const getAuthState = (): AuthState => {
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token')
  const userStr = localStorage.getItem('authUser')
  
  return {
    user: userStr ? JSON.parse(userStr) : null,
    accessToken,
    refreshToken,
  }
}

export const setAuthState = (user: Profiles, accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('authUser', JSON.stringify(user))
}

export const clearAuthState = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('authToken')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('authUser')
}

export const isAuthenticated = (): boolean => {
  return !!(localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('access_token'))
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
} 