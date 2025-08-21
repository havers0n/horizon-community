import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../core/lib/supabase';
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
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1];

		if (!token) {
			res.status(401).json({ success: false, error: 'Access token required' });
			return;
		}

		// Верифицируем JWT через Supabase
		const { data: { user }, error } = await supabase.auth.getUser(token);
		if (error || !user) {
			console.error('[AuthMiddleware] Token verification failed:', error);
			res.status(401).json({ success: false, error: 'Invalid or expired token' });
			return;
		}

		// Создаем пер-запросные клиенты под токен пользователя (RLS-first)
		let userClients: ReturnType<typeof createUserSupabaseClients>;
		try {
			userClients = createUserSupabaseClients(token);
			req.supabase = userClients;
		} catch (e) {
			console.error('[AuthMiddleware] Failed to create user-scoped Supabase clients:', e);
			res.status(500).json({ success: false, error: 'Server configuration error' });
			return;
		}

		// Получаем базовый профиль из public.profiles
		const profile = await getUserProfile(user.id, req.supabase!.public);
		if (!profile) {
			res.status(401).json({ success: false, error: 'User profile not found' });
			return;
		}

		// Формируем легкий объект пользователя и прикрепляем к запросу
		const authenticatedUser: AuthenticatedUser = {
			id: user.id,
			email: user.email,
			username: profile.username,
			role: (profile as any).role ?? 'citizen',
			created_at: profile.created_at,
			user_metadata: user.user_metadata
		};
		(req as AuthenticatedRequest).user = authenticatedUser;

		// ===== СБОРКА ПОЛНОЙ СЕССИИ ПОЛЬЗОВАТЕЛЯ (единый источник истины) =====
		try {
			const supa = (req as any).supabase;
			if (!supa) {
				res.status(500).json({ success: false, error: 'Server configuration error: missing per-request Supabase client' });
				return;
			}

			const userId = authenticatedUser.id;

			const rolesQuery = supa.common
				.from('v_effective_roles' as any)
				.select('role_name, display_name')
				.eq('user_id', userId);

			const permissionsRpcQuery = (supa.public.rpc as any)?.('get_user_permissions', { p_user_id: userId });
			const permissionsViewQuery = supa.common
				.from('v_effective_permissions' as any)
				.select('permission_code')
				.eq('user_id', userId);

			const membershipsQuery = supa.common
				.from('memberships' as any)
				.select(`
					status_id,
					rank_id,
					department_id,
					is_primary,
					statuses!inner(code, name),
					ranks!inner(name, order_index),
					departments!inner(name, full_name)
				`)
				.eq('user_id', userId);

			const cadetTracksQuery = supa.common
				.from('v_cadet_tracks_enriched' as any)
				.select('*')
				.eq('user_id', userId);

			// 1) Получаем персонажей пользователя
			const charactersRes = await supa.common
				.from('characters' as any)
				.select('id')
				.eq('user_id', userId);

			if (charactersRes.error) {
				res.status(500).json({ success: false, error: charactersRes.error.message });
				return;
			}

			const characterIds = (charactersRes.data || []).map((c: any) => c.id);

			// 2) Получаем квалификации через character_qualifications (после того как знаем characterIds)
			const qualificationsRes = characterIds.length > 0
				? await supa.common
					.from('character_qualifications' as any)
					.select(`
						qualification_id,
						character_id,
						qualifications!inner (
							name,
							department_id,
							departments!inner ( name, full_name )
						)
					`)
					.in('character_id', characterIds)
				: { data: [], error: null } as any;

			const [rolesRes, permsRpcRes, permsViewRes, membershipsRes, cadetTracksRes] = await Promise.all([
				rolesQuery,
				permissionsRpcQuery,
				permissionsViewQuery,
				membershipsQuery,
				cadetTracksQuery,
			]);

			if (rolesRes.error) {
				res.status(500).json({ success: false, error: rolesRes.error.message });
				return;
			}
			if (membershipsRes.error) {
				res.status(500).json({ success: false, error: membershipsRes.error.message });
				return;
			}
			if (permsRpcRes && (permsRpcRes as any).error) {
				res.status(500).json({ success: false, error: (permsRpcRes as any).error.message });
				return;
			}
			if (permsViewRes.error) {
				res.status(500).json({ success: false, error: permsViewRes.error.message });
				return;
			}
			if (cadetTracksRes.error) {
				res.status(500).json({ success: false, error: cadetTracksRes.error.message });
				return;
			}
			if (qualificationsRes.error) {
				res.status(500).json({ success: false, error: qualificationsRes.error.message });
				return;
			}

			const roles = (rolesRes.data || [])
				.map((r: any) => ({ code: r.role_name, name: r.display_name }))
				.filter((r: any) => r.code && r.name);

			const permissions = Array.isArray(permsRpcRes?.data)
				? (permsRpcRes!.data as string[])
				: ((permsViewRes.data || []).map((p: any) => p.permission_code).filter(Boolean));

			// Обработка мембершипов (обогащенные данные)
			const memberships = (membershipsRes.data || []).map((m: any) => ({
				status: {
					id: m.status_id,
					code: m.statuses?.code,
					name: m.statuses?.name,
				},
				rank: {
					id: m.rank_id,
					name: m.ranks?.name,
					order_index: m.ranks?.order_index,
				},
				department: {
					id: m.department_id,
					name: m.departments?.name, // Короткое название (аббревиатура)
					full_name: m.departments?.full_name, // Полное название
				},
				is_primary: m.is_primary,
			}));

			// Обработка квалификаций
			const qualifications = (qualificationsRes.data || []).map((q: any) => ({
				id: q.qualification_id,
				name: q.qualifications?.name,
				department: {
					id: q.qualifications?.department_id,
					name: q.qualifications?.departments?.name, // Короткое название
					full_name: q.qualifications?.departments?.full_name, // Полное название
				},
			}));

			// Статусы для обратной совместимости
			const statuses = memberships
				.map((m: any) => m.status?.code)
				.filter(Boolean);

			const cadetTracksRaw = (cadetTracksRes.data || []) as any[];
			const cadetTracks = cadetTracksRaw.filter((t: any) => (typeof t.is_active === 'boolean' ? t.is_active : true));

			// Дополнительно: получаем заявки пользователя для состояния личного кабинета
			let applications: Array<{
				id: string | null;
				type?: string | null;
				status_code?: string | null;
				status_name?: string | null;
				created_at?: string | null;
				department_name?: string | null;
			}> = [];
			let attemptsLeft = 3; // По умолчанию 3 попытки
			try {
				const applicationsRes = await (supa.system as any)
					.from('my_applications_view' as any)
					.select('id, type, status_code, status_name, created_at, department_name')
					.order('created_at', { ascending: false })
					.limit(10);

				if (applicationsRes.error) {
					console.warn('[AuthMiddleware] get applications failed:', applicationsRes.error);
				} else {
					applications = (applicationsRes.data || []).map((a: any) => ({
						id: a.id ?? null,
						type: a.type ?? null,
						status_code: a.status_code ?? null,
						status_name: a.status_name ?? null,
						created_at: a.created_at ?? null,
						department_name: a.department_name ?? null,
					}));
					
					// Подсчет заявок за текущий месяц для определения оставшихся попыток
					const now = new Date();
					const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
					const monthlyApps = applications.filter(app => {
						if (!app.created_at) return false;
						const appDate = new Date(app.created_at);
						return appDate >= startOfMonth;
					});
					attemptsLeft = Math.max(0, 3 - monthlyApps.length);
				}
			} catch (appsErr) {
				console.warn('[AuthMiddleware] applications query threw error:', appsErr);
			}

			const unique = (arr: string[]) => Array.from(new Set(arr));

			// Прикрепляем построенную сессию к запросу
			(req as any).session = {
				user: { id: userId, username: authenticatedUser.username ?? null },
				roles: roles,
				permissions: unique(permissions),
				statuses: unique(statuses),
				cadetTracks,
				applications,
				attemptsLeft,
				// Новые поля для полноценного профиля
				memberships,
				qualifications,
				// Вычисляемые поля для совмещений (отображение через '/')
				combinedRank: memberships
					.filter((m: any) => m.rank?.name)
					.map((m: any) => m.rank.name)
					.join(' / '),
				combinedPosition: memberships
					.filter((m: any) => m.position)
					.map((m: any) => m.position)
					.join(' / '),
				combinedDepartment: memberships
					.filter((m: any) => m.department?.name)
					.map((m: any) => m.department.name)
					.join(' / '),
			};

			next();
		} catch (sessionError) {
			console.error('[AuthMiddleware] Error building session:', sessionError);
			res.status(500).json({ success: false, error: 'Failed to build user session' });
		}
	} catch (error) {
		console.error('[AuthMiddleware] CRITICAL ERROR:', error);
		res.status(500).json({ success: false, error: 'Authentication failed' });
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

    // Получаем персонажей пользователя строго через пер-запросный клиент
    const commonDb = req.supabase?.common;
    if (!commonDb) {
      res.status(500).json({
        success: false,
        error: 'Server configuration error: missing per-request Supabase client',
      });
      return;
    }
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
            req.supabase = userClients;
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

    // Проверяем разрешения из сессии, собранной в authenticateToken
    const sessionPermissions: string[] = req.session?.permissions ?? [];
    if (!Array.isArray(sessionPermissions) || !sessionPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: `Permission '${permission}' required`
      });
      return;
    }

    next();
  };
}