import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthContextType } from '../model'
import { AuthAPI } from '../api'
import { setAuthState, clearAuthState, getAuthState } from '@/shared/lib/auth'
import { User } from '@/entities/user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authState = getAuthState()
        if (authState.token && authState.user) {
          setUser(authState.user)
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
      const { user: userData, token } = response
      
      setAuthState(userData, token)
      setUser(userData)
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await AuthAPI.signUp({ email, password, firstName, lastName })
      const { user: userData, token } = response
      
      setAuthState(userData, token)
      setUser(userData)
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