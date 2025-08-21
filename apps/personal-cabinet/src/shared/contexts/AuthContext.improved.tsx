import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { 
  login as loginApi, 
  register as registerApi, 
  logout as logoutApi, 
  getCurrentUser, 
  updateProfile as updateProfileApi, 
  LoginCredentials, 
  RegisterPayload 
} from '@/shared/api/auth-service'
import { handleError, createAppError, ErrorType } from '@/shared/lib/error-handling'
import type { Database } from '@roleplay-identity/db-types'

type Profiles = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: Profiles | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: Profiles }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Profiles }

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<Profiles>) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: 'AUTH_START' })
        const userData = await getCurrentUser()
        dispatch({ type: 'AUTH_SUCCESS', payload: userData })
      } catch (error) {
        // Для проверки аутентификации не показываем toast
        const appError = handleError(error, { showToast: false })
        dispatch({ type: 'AUTH_FAILURE', payload: appError.message })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await loginApi(credentials)
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user })
    } catch (error) {
      const appError = handleError(error, {
        fallbackMessage: 'Не удалось войти в систему. Проверьте данные'
      })
      dispatch({ type: 'AUTH_FAILURE', payload: appError.message })
      throw appError
    }
  }

  const register = async (data: RegisterPayload) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await registerApi(data)
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user })
    } catch (error) {
      const appError = handleError(error, {
        fallbackMessage: 'Не удалось создать аккаунт. Попробуйте позже'
      })
      dispatch({ type: 'AUTH_FAILURE', payload: appError.message })
      throw appError
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      // Логируем ошибку выхода, но не блокируем процесс
      handleError(error, {
        showToast: false,
        fallbackMessage: 'Ошибка при выходе из системы'
      })
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }

  const updateProfile = async (data: Partial<Profiles>) => {
    try {
      const updatedUser = await updateProfileApi(data)
      dispatch({ type: 'UPDATE_USER', payload: updatedUser })
    } catch (error) {
      const appError = handleError(error, {
        fallbackMessage: 'Не удалось обновить профиль'
      })
      dispatch({ type: 'AUTH_FAILURE', payload: appError.message })
      throw appError
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw createAppError(
      ErrorType.UNKNOWN,
      'useAuth must be used within an AuthProvider'
    )
  }
  return context
}