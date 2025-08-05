// Session management API
export const sessionApi = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken')
  },
  
  setAccessToken: (token: string): void => {
    localStorage.setItem('accessToken', token)
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken')
  },
  
  setRefreshToken: (token: string): void => {
    localStorage.setItem('refreshToken', token)
  },
  
  clearSession: (): void => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
  
  refreshToken: async (): Promise<string | null> => {
    const refreshToken = sessionApi.getRefreshToken()
    if (!refreshToken) {
      return null
    }
    
    try {
      // Здесь должна быть логика обновления токена через API
      // Пока возвращаем null
      return null
    } catch (error) {
      sessionApi.clearSession()
      return null
    }
  }
} 