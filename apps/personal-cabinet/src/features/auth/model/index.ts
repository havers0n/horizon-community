import { User } from '@/entities/user'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
  username?: string
}

export interface AuthState {
  user: Omit<User, 'passwordHash'> | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType {
  user: Omit<User, 'passwordHash'> | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signOut: () => Promise<void>
} 