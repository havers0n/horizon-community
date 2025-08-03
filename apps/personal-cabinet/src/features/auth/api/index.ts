import { LoginCredentials, RegisterCredentials } from '../model'
import { apiRequest } from '@/shared/lib/queryClient'

export class AuthAPI {
  private static baseUrl = '/api/auth'

  static async signIn(credentials: LoginCredentials) {
    const response = await apiRequest('POST', `${AuthAPI.baseUrl}/login`, credentials)
    return response.json()
  }

  static async signUp(credentials: RegisterCredentials) {
    const response = await apiRequest('POST', `${AuthAPI.baseUrl}/register`, credentials)
    return response.json()
  }

  static async signOut() {
    const response = await apiRequest('POST', `${AuthAPI.baseUrl}/logout`)
    return response.json()
  }

  static async getCurrentUser() {
    const response = await apiRequest('GET', `${AuthAPI.baseUrl}/me`)
    return response.json()
  }
}

export const authApi = new AuthAPI() 