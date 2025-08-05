import type { Database } from '@roleplay-identity/db-types'
import type { LoginCredentials, RegisterPayload, AuthResponse } from '@/shared/api/auth-service'

type Profiles = Database['public']['Tables']['profiles']['Row']

export type { LoginCredentials, RegisterPayload, AuthResponse }

export interface AuthState {
  user: Profiles | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType {
  user: Profiles | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: RegisterPayload) => Promise<void>
  signOut: () => Promise<void>
} 