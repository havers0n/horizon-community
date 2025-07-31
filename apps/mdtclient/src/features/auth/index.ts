// @ts-nocheck - TODO: Remove after major refactoring is complete
// Auth feature - явные экспорты

// Model layer
export type {
  AuthState,
  LoginRequest,
  RegisterRequest,
  AuthResponse
} from './model';

// API layer
export { AuthApi } from './api';

// UI layer
export { AuthGuard, LoginForm } from './ui'; 