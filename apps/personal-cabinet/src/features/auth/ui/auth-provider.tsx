import { createContext, useContext, ReactNode } from 'react'
import { AuthContextType, RegisterPayload } from '../model'
import { AuthAPI } from '../api'
import { setAuthState, clearAuthState } from '@/shared/lib/auth'
import { useSession } from '@/shared/contexts/SessionContext'
import { User } from '@/entities/user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Лёгкий провайдер аутентификации: состояние берём из SessionProvider
  const { session, isLoading, refetch } = useSession()

  const user: User | null = session
    ? {
        id: session.user.id,
        email: null,
        username: session.user.username,
        role: (() => {
          const roles = Array.isArray(session.roles) ? session.roles : [];
          const by = (code: string) => roles.find(r => r.code === code);
          const primary = by('system_admin') || by('admin') || by('staff') || by('candidate') || by('citizen') || roles[0];
          // маппим system_admin к admin для обратной совместимости строковых ролей в UI
          return (primary?.code === 'system_admin' ? 'admin' : primary?.code || 'citizen') as string;
        })(),
        avatarUrl: null,
        firstName: null,
        lastName: null,
        department: undefined,
        division: undefined,
        isActive: true,
        gameWarnings: 0,
        adminWarnings: 0,
        attemptsLeft: 0,
        profileImageUrl: undefined,
      }
    : null

  const signIn = async (email: string, password: string) => {
    try {
      const response = await AuthAPI.signIn({ email, password })
      
      // Новый API возвращает данные напрямую
      const { user: userData, access_token, refresh_token } = response
      
      if (userData && access_token && refresh_token) {
        setAuthState(userData, access_token, refresh_token)
        await refetch()
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
      const { user: userData, access_token, refresh_token } = response
      
      if (userData && access_token && refresh_token) {
        setAuthState(userData, access_token, refresh_token)
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