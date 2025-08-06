import type { LoginCredentials, RegisterPayload, AuthResponse } from '@/shared/api/auth-service'
import type { User } from '@/entities/user'

export type { LoginCredentials, RegisterPayload, AuthResponse }

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: RegisterPayload) => Promise<void>
  signOut: () => Promise<void>
} 