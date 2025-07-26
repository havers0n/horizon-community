import { User } from "@shared/schema";

export interface AuthState {
  user: Omit<User, 'passwordHash'> | null;
  token: string | null;
}

export const getAuthState = (): AuthState => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null
  };
};

export const setAuthState = (user: Omit<User, 'passwordHash'>, token: string) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const clearAuthState = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

export const isAuthenticated = (): boolean => {
  const { token, user } = getAuthState();
  return !!(token && user);
};

export const getAuthHeaders = () => {
  const { token } = getAuthState();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
