import { LoginCredentials, RegisterPayload } from '../model'
import { login, register, logout, getCurrentUser } from '@/shared/api/auth-service'

export class AuthAPI {
  static async signIn(credentials: LoginCredentials) {
    return login(credentials)
  }

  static async signUp(credentials: RegisterPayload) {
    return register(credentials)
  }

  static async signOut() {
    return logout()
  }

  static async getCurrentUser() {
    return getCurrentUser()
  }
}

export const authApi = new AuthAPI() 