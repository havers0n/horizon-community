import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthContextType, RegisterPayload } from '../model'
import { AuthAPI } from '../api'
import { setAuthState, clearAuthState, getAuthState } from '@/shared/lib/auth'
import { User, normalizeUser } from '@/entities/user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authState = getAuthState()
        if (authState.token && authState.user) {
          // Проверяем токен через API
          try {
            const userData = await AuthAPI.getCurrentUser()
            setUser(normalizeUser(userData))
          } catch (error) {
            console.error('Token validation failed:', error)
            clearAuthState()
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        clearAuthState()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await AuthAPI.signIn({ email, password })
      
      // Новый API возвращает данные напрямую
      const { user: userData, access_token } = response
      
      if (userData && access_token) {
        setAuthState(userData, access_token)
        setUser(normalizeUser(userData))
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  const signUp = async (data: RegisterPayload) => {
    try {
      const response = await AuthAPI.signUp(data)
      
      // Новый API возвращает данные напрямую
      const { user: userData, access_token } = response
      
      if (userData && access_token) {
        setAuthState(userData, access_token)
        setUser(normalizeUser(userData))
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await AuthAPI.signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      clearAuthState()
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 