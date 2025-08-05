import type { Database } from '@roleplay-identity/db-types'

type Profiles = Database['public']['Tables']['profiles']['Row']

export interface AuthState {
  user: Profiles | null
  token: string | null
}

export const getAuthState = (): AuthState => {
  const token = localStorage.getItem('authToken')
  const userStr = localStorage.getItem('authUser')
  
  return {
    user: userStr ? JSON.parse(userStr) : null,
    token
  }
}

export const setAuthState = (user: Profiles, token: string) => {
  localStorage.setItem('authToken', token)
  localStorage.setItem('authUser', JSON.stringify(user))
}

export const clearAuthState = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('authUser')
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken')
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
} 