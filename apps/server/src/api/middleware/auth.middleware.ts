import { Request, Response, NextFunction } from 'express';
import { supabase, commonSupabase } from '../../core/lib/supabase'; // <-- Импортируем нужные клиенты
import type { Database } from '@roleplay-identity/db-types';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Создает пер-запросные клиенты Supabase под токен пользователя (RLS-first)
function createUserSupabaseClients(accessToken: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY for user-scoped clients');
  }

  const commonOptions = {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  } as const;

  const publicClient = createClient<Database>(supabaseUrl, supabaseAnonKey, commonOptions);
  const commonClient = createClient<Database, 'common'>(supabaseUrl, supabaseAnonKey, {
    ...commonOptions,
    db: { schema: 'common' },
  });
  const mdtClient = createClient<Database, 'mdt'>(supabaseUrl, supabaseAnonKey, {
    ...commonOptions,
    db: { schema: 'mdt' },
  });
  const systemClient = createClient<Database, 'system'>(supabaseUrl, supabaseAnonKey, {
    ...commonOptions,
    db: { schema: 'system' },
  });

  return {
    public: publicClient,
    common: commonClient,
    mdt: mdtClient,
    system: systemClient,
  } as const;
}

type Profile = Database['public']['Tables']['profiles']['Row'];
type Character = Database['common']['Tables']['characters']['Row'];

// ===== ТИПЫ ДЛЯ АУТЕНТИФИКАЦИИ =====

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  username: string | null;
  role: string; // В актуальной схеме нет enum user_role в public
  created_at: string | null;
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

async function getUserProfile(
  userId: string,
  publicDb: SupabaseClient<Database>
): Promise<Profile | null> {
  try {
    const { data: profile, error } = await publicDb
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

async function getUserCharacters(
  userId: string,
  commonDb: SupabaseClient<Database, 'common'>
): Promise<Character[]> {
  try {
    const { data: characters, error } = await commonDb
      .from('characters')
      .select('*')
      .eq('user_id', userId);

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
  console.log('--- AUTH MIDDLEWARE START ---'); // ШПИОН №1

  try {
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader); // ШПИОН №2: Что пришло в заголовке?

    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log('Extracted Token:', token); // ШПИОН №3: Смогли ли мы извлечь токен?

    if (!token) {
      console.log('No token found, sending 401.'); // ШПИОН №4
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    // Верифицируем токен через Supabase
    console.log('Created Supabase client, calling getUser...'); // ШПИОН №4.5
    const { data: { user }, error } = await supabase.auth.getUser(token);

    console.log('Supabase getUser Error:', error); // ШПИОН №5: Была ли ошибка от Supabase?
    console.log('Supabase getUser Data:', user);  // ШПИОН №6: Что Supabase вернул в качестве юзера?

    if (error || !user) {
      console.log('Token verification failed, sending 401.'); // ШПИОН №7
      console.error('[AuthMiddleware] Token verification failed:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    // Создаем пер-запросные клиенты под токен пользователя (RLS)
    let userClients: ReturnType<typeof createUserSupabaseClients>;
    try {
      userClients = createUserSupabaseClients(token);
      // Прикрепляем к запросу
      (req as any).supabase = userClients;
    } catch (e) {
      console.error('[AuthMiddleware] Failed to create user-scoped Supabase clients:', e);
      res.status(500).json({ success: false, error: 'Server configuration error' });
      return;
    }

    // Получаем профиль пользователя
    console.log('Getting user profile for ID:', user.id); // ШПИОН №8
    const profile = await getUserProfile(user.id, (req as any).supabase.public);
    console.log('User Profile:', profile); // ШПИОН №9: Что получили из профиля?

    if (!profile) {
      console.log('User profile not found, sending 401.'); // ШПИОН №10
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
      role: (profile as any).role ?? 'citizen',
      created_at: profile.created_at,
      user_metadata: user.user_metadata
    };
    console.log('Created AuthenticatedUser:', authenticatedUser); // ШПИОН №11: Что создали?

    // Приводим req к AuthenticatedRequest и добавляем пользователя
    (req as AuthenticatedRequest).user = authenticatedUser;
    console.log('Authentication SUCCESS, calling next()'); // ШПИОН №12
    next();
  } catch (error) {
    console.error('[AuthMiddleware] CRITICAL ERROR:', error); // ШПИОН №13
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

    // Получаем персонажей пользователя через пер-запросный клиент (fallback на глобальный, если отсутствует)
    const commonDb = (req as any).supabase?.common ?? commonSupabase;
    const characters = await getUserCharacters(req.user.id, commonDb as SupabaseClient<Database, 'common'>);
    
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
            first_name: char.first_name,
            last_name: char.last_name
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
export const requireSupervisor = requireRole('staff');
export const requireMember = requireRole('citizen');
export const requireCandidate = requireRole('candidate');

// Middleware для проверки нескольких ролей
export const requireAdminOrSupervisor = requireAnyRole(['admin', 'staff']);

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
          const userClients = createUserSupabaseClients(jwtToken);
          const profile = await getUserProfile(user.id, userClients.public);
          if (profile) {
            req.user = {
              id: user.id,
              email: user.email,
              username: profile.username,
              role: (profile as any).role ?? 'citizen',
              created_at: profile.created_at,
              user_metadata: user.user_metadata
            };
            (req as any).supabase = userClients;
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
export const requireSupervisorWithAuth = [authenticateToken, requireRole('staff')];
export const requireMemberWithAuth = [authenticateToken, requireRole('citizen')];
export const requireCandidateWithAuth = [authenticateToken, requireRole('candidate')]; 