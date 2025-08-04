import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../core/lib/supabase.js';
import type { Database } from '@roleplay-identity/db-types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Character = Database['common']['Tables']['characters']['Row'];

// ===== ТИПЫ ДЛЯ АУТЕНТИФИКАЦИИ =====

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  username: string | null;
  role: string;
  createdAt: string | null;
  user_metadata?: {
    cadToken?: string;
    apiToken?: string;
    [key: string]: any;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  character?: Character;
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AuthMiddleware] Error getting user profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('[AuthMiddleware] Error getting user profile:', error);
    return null;
  }
}

async function getUserCharacters(userId: string): Promise<Character[]> {
  try {
    const { data: characters, error } = await supabase
      .rpc('get_characters_with_filters', { p_owner_id: userId });

    if (error) {
      console.error('[AuthMiddleware] Error getting user characters:', error);
      return [];
    }

    return characters || [];
  } catch (error) {
    console.error('[AuthMiddleware] Error getting user characters:', error);
    return [];
  }
}

// ===== ОСНОВНОЙ MIDDLEWARE ДЛЯ АУТЕНТИФИКАЦИИ =====

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    // Верифицируем токен через Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[AuthMiddleware] Token verification failed:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    // Получаем профиль пользователя
    const profile = await getUserProfile(user.id);
    if (!profile) {
      res.status(401).json({
        success: false,
        error: 'User profile not found'
      });
      return;
    }

    // Создаем объект аутентифицированного пользователя
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      username: profile.username,
      role: profile.role,
      createdAt: profile.created_at,
      user_metadata: user.user_metadata
    };

    // Приводим req к AuthenticatedRequest и добавляем пользователя
    (req as AuthenticatedRequest).user = authenticatedUser;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

// ===== MIDDLEWARE ДЛЯ ПРОВЕРКИ РОЛИ =====

export function requireRole(requiredRole: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({
        success: false,
        error: `Role '${requiredRole}' required`
      });
      return;
    }

    next();
  };
}

export function requireAnyRole(requiredRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!requiredRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `One of roles [${requiredRoles.join(', ')}] required`
      });
      return;
    }

    next();
  };
}

// ===== MIDDLEWARE ДЛЯ ПРОВЕРКИ CAD ТОКЕНА =====

export async function authenticateCadToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cadToken = req.headers['x-cad-token'] as string;

    if (!cadToken) {
      res.status(401).json({
        success: false,
        error: 'CAD token required'
      });
      return;
    }

    // Получаем пользователя из запроса (должен быть уже аутентифицирован)
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Проверяем CAD токен пользователя
    if (req.user.user_metadata?.cadToken !== cadToken) {
      res.status(401).json({
        success: false,
        error: 'Invalid CAD token'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('[AuthMiddleware] CAD token authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'CAD token authentication failed'
    });
  }
}

// ===== MIDDLEWARE ДЛЯ ПРОВЕРКИ API ТОКЕНА =====

export async function authenticateApiToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiToken = req.headers['x-api-token'] as string;

    if (!apiToken) {
      res.status(401).json({
        success: false,
        error: 'API token required'
      });
      return;
    }

    // Получаем пользователя из запроса (должен быть уже аутентифицирован)
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Проверяем API токен пользователя
    if (req.user.user_metadata?.apiToken !== apiToken) {
      res.status(401).json({
        success: false,
        error: 'Invalid API token'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('[AuthMiddleware] API token authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'API token authentication failed'
    });
  }
}

// ===== MIDDLEWARE ДЛЯ ПРОВЕРКИ ПЕРСОНАЖА =====

export async function requireCharacter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Получаем персонажей пользователя
    const characters = await getUserCharacters(req.user.id);
    
    if (characters.length === 0) {
      res.status(403).json({
        success: false,
        error: 'No characters found for user'
      });
      return;
    }

    // Если есть только один персонаж, используем его
    if (characters.length === 1) {
      req.character = characters[0];
      next();
      return;
    }

    // Если несколько персонажей, проверяем заголовок для выбора
    const characterId = req.headers['x-character-id'] as string;
    
    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required (multiple characters found)',
        data: {
          characters: characters.map(char => ({
            id: char.id,
            firstName: char.first_name,
            lastName: char.last_name
          }))
        }
      });
      return;
    }

    const selectedCharacter = characters.find(char => char.id === characterId);
    
    if (!selectedCharacter) {
      res.status(403).json({
        success: false,
        error: 'Invalid character ID'
      });
      return;
    }

    req.character = selectedCharacter;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Character requirement error:', error);
    res.status(500).json({
      success: false,
      error: 'Character requirement check failed'
    });
  }
}

// ===== КОМБИНИРОВАННЫЕ MIDDLEWARE =====

export function requireCadAccess() {
  return [authenticateToken, authenticateCadToken];
}

export function requireApiAccess() {
  return [authenticateToken, authenticateApiToken];
}

export function requireCharacterAccess() {
  return [authenticateToken, requireCharacter];
}

export function requireCadWithCharacter() {
  return [authenticateToken, authenticateCadToken, requireCharacter];
}

export function requireApiWithCharacter() {
  return [authenticateToken, authenticateApiToken, requireCharacter];
}

// ===== MIDDLEWARE ДЛЯ ЛОГИРОВАНИЯ =====

export function logRequest(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = (req as AuthenticatedRequest).user;
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) - User: ${user?.id || 'anonymous'}`);
  });
  
  next();
}

// ===== ОБРАТНАЯ СОВМЕСТИМОСТЬ СО СТАРЫМИ ЭКСПОРТАМИ =====

// Алиас для старого имени
export const verifyJWT = authenticateToken;

// Старые комбинированные middleware для обратной совместимости
export const requireAdmin = requireRole('admin');
export const requireSupervisor = requireRole('supervisor');
export const requireMember = requireRole('member');
export const requireCandidate = requireRole('candidate');

// Middleware для проверки нескольких ролей
export const requireAdminOrSupervisor = requireAnyRole(['admin', 'supervisor']);

// Универсальный middleware аутентификации (для обратной совместимости)
export async function authenticateAny(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Пробуем JWT токен
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader && authHeader.split(' ')[1];

    if (jwtToken) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(jwtToken);
        if (!error && user) {
          const profile = await getUserProfile(user.id);
          if (profile) {
            req.user = {
              id: user.id,
              email: user.email,
              username: profile.username,
              role: profile.role,
              createdAt: profile.created_at,
              user_metadata: user.user_metadata
            };
            return next();
          }
        }
      } catch (error) {
        // Продолжаем к следующему типу токена
      }
    }

    // Пробуем CAD токен
    const cadToken = req.headers['x-cad-token'] as string;
    if (cadToken && req.user?.user_metadata?.cadToken === cadToken) {
      return next();
    }

    // Пробуем API токен
    const apiToken = req.headers['x-api-token'] as string;
    if (apiToken && req.user?.user_metadata?.apiToken === apiToken) {
      return next();
    }

    // Если ни один токен не подошел
    res.status(401).json({
      success: false,
      error: 'Valid authentication token required'
    });
  } catch (error) {
    console.error('[AuthMiddleware] Universal authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

// Дополнительные middleware для обратной совместимости
export function requireExactRole(role: string) {
  return requireRole(role);
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Проверяем разрешения из user_metadata
    const userPermissions = req.user.user_metadata?.permissions || [];
    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: `Permission '${permission}' required`
      });
      return;
    }

    next();
  };
}

export function requireActiveStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  const userStatus = req.user.user_metadata?.status || 'active';
  if (userStatus !== 'active') {
    res.status(403).json({
      success: false,
      error: 'Account is not active'
    });
    return;
  }

  next();
}

// Старые комбинированные массивы middleware (для обратной совместимости)
export const requireAdminWithAuth = [authenticateToken, requireRole('admin')];
export const requireSupervisorWithAuth = [authenticateToken, requireRole('supervisor')];
export const requireMemberWithAuth = [authenticateToken, requireRole('member')];
export const requireCandidateWithAuth = [authenticateToken, requireRole('candidate')]; 