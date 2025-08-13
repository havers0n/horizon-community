import { Router } from 'express';
import { createCharacterRoutes } from './characters';
import { createCabinetRoutes } from './cabinet';
import { createApplicationRoutes } from './applications';
import { createDepartmentRoutes } from './departments';
import { createAuthRoutes } from '../auth'; // <-- Импортируем фабричную функцию для auth роутов
// Удаляем старые тестовые роуты на основе TestController/TestService
// import { createTestRoutes } from './tests';
import { authenticateToken } from '../../middleware/auth.middleware';
import testSessionsRoutes from './test-sessions.routes';
import adminRouter from '../admin';
import { CabinetService } from '../../../core/services/CabinetService';
import { ApplicationService } from '../../../core/services/ApplicationService';
import { ReportService } from '../../../core/services/ReportService';

// Временные заглушки для остальных роутов
// TODO: Преобразовать все роуты в фабричные функции
const createAdminRoutes = () => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Admin routes - TODO: implement DI' }));
  return router;
};

const createReportTemplatesRoutes = () => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Report templates routes - TODO: implement DI' }));
  return router;
};

const createEmsFdReportsRoutes = () => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'EMS/FD reports routes - TODO: implement DI' }));
  return router;
};

const createLawReportsRoutes = () => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Law reports routes - TODO: implement DI' }));
  return router;
};

const createDiscordRoutes = () => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Discord routes - TODO: implement DI' }));
  return router;
};

const createForumRoutes = () => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Forum routes - TODO: implement DI' }));
  return router;
};

const createRealtimeRoutes = () => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Realtime routes - TODO: implement DI' }));
  return router;
};

/**
 * Фабричная функция для создания v1 роутера с внедренными сервисами
 * Разделяет публичные и защищенные маршруты
 */
export function createV1Router(): Router {
  const router: Router = Router();

  // --- ШАГ 1: РЕГИСТРИСТРИРУЕМ ПУБЛИЧНЫЕ РОУТЫ ---
  // Роуты аутентификации (register, login, verify) должны быть доступны всем
  router.use('/auth', createAuthRoutes());

  // Health check endpoint (публичный)
  router.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'UP', 
      timestamp: new Date().toISOString(),
      version: 'v1',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // --- ШАГ 2: ВЕШАЕМ "ОХРАННИКА" ---
  // Все, что будет зарегистрировано ПОСЛЕ этой строки,
  // будет требовать валидный токен
  router.use(authenticateToken);

  // --- ШАГ 3: РЕГИСТРИСТРИРУЕМ ЗАЩИЩЕННЫЕ РОУТЫ ---
  
  /**
   * GET /api/v1/auth/me/session
   * Возвращает сессию пользователя с динамическими ролями, пермишенами и статусами.
   * Источники данных:
   *  - Роли: common.v_effective_roles (по user_id)
   *  - Пермишены: common.v_effective_permissions или rpc.get_user_permissions(p_user_id)
   *  - Статусы: join common.memberships -> common.statuses по пользователю
   */
  router.get('/auth/me/session', async (req, res) => {
    try {
      const userId = req.user?.id as string | undefined;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const supa = req.supabase!;

      // Роли из представления v_effective_roles
      const rolesPromise = supa.common
        .from('v_effective_roles' as any)
        .select('role_name')
        .eq('user_id', userId);

      // Пермишены через RPC (public схема) с fall-back на представление
      const permissionsViaRpcPromise = (supa.public.rpc as any)?.('get_user_permissions', { p_user_id: userId });
      const permissionsViaViewPromise = supa.common
        .from('v_effective_permissions' as any)
        .select('permission_code')
        .eq('user_id', userId);

      // Статусы через memberships -> statuses
      const membershipsPromise = supa.common
        .from('memberships' as any)
        .select('status_id')
        .eq('user_id', userId);

      // Cadet tracks через v_cadet_tracks_enriched
      const cadetTracksPromise = supa.common
        .from('v_cadet_tracks_enriched' as any)
        .select('*')
        .eq('user_id', userId);

      const [rolesRes, permsRpcRes, permsViewRes, membershipsRes, cadetTracksRes] = await Promise.all([
        rolesPromise,
        permissionsViaRpcPromise?.catch(() => null) ?? Promise.resolve(null),
        permissionsViaViewPromise,
        membershipsPromise,
        cadetTracksPromise,
      ]);

      if (rolesRes.error) {
        return res.status(500).json({ success: false, error: rolesRes.error.message });
      }
      if (membershipsRes.error) {
        return res.status(500).json({ success: false, error: membershipsRes.error.message });
      }
      if (permsRpcRes && (permsRpcRes as any).error) {
        return res.status(500).json({ success: false, error: (permsRpcRes as any).error.message });
      }
      if (permsViewRes.error) {
        return res.status(500).json({ success: false, error: permsViewRes.error.message });
      }
      if (cadetTracksRes.error) {
        return res.status(500).json({ success: false, error: cadetTracksRes.error.message });
      }

      const roles = (rolesRes.data || []).map((r: any) => r.role_name).filter(Boolean);

      // Если RPC вернул массив строк — используем его; иначе соберем из view
      const permissions = Array.isArray(permsRpcRes?.data)
        ? (permsRpcRes!.data as string[])
        : ((permsViewRes.data || []).map((p: any) => p.permission_code).filter(Boolean));

      // Получить коды статусов по status_id
      const statusIds: string[] = (membershipsRes.data || []).map((m: any) => m.status_id).filter(Boolean);
      let statuses: string[] = [];
      if (statusIds.length > 0) {
        const statusesRes = await supa.common
          .from('statuses' as any)
          .select('code, id')
          .in('id', statusIds as any);
        if (statusesRes.error) {
          return res.status(500).json({ success: false, error: statusesRes.error.message });
        }
        statuses = (statusesRes.data || []).map((s: any) => s.code).filter(Boolean);
      }

      // Формируем cadetTracks (если в представлении есть флаг активности — фильтруем)
      const cadetTracksRaw = (cadetTracksRes.data || []) as any[];
      const cadetTracks = cadetTracksRaw.filter((t: any) => (typeof t.is_active === 'boolean' ? t.is_active : true));

      // Уникализируем
      const unique = (arr: string[]) => Array.from(new Set(arr));

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: userId,
            username: req.user?.username ?? null,
          },
          roles: unique(roles),
          permissions: unique(permissions),
          statuses: unique(statuses),
          cadetTracks,
        },
      });
    } catch (error) {
      console.error('Error building session:', error);
      return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/dashboard-data
   * Единый эндпоинт для получения всех данных дашборда
   * Возвращает структурированные данные в зависимости от роли пользователя
   */
  router.get('/dashboard-data', async (req, res) => {
    try {
      const userId = req.user.id;
      const cabinetService = new CabinetService(
        req.supabase!.public,
        new ApplicationService({ system: req.supabase!.system, common: req.supabase!.common, public: req.supabase!.public }),
        new ReportService(req.supabase!.mdt)
      );
      
      // Получаем профиль пользователя для определения роли
      const profile = await cabinetService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ 
          success: false, 
          error: 'Profile not found' 
        });
      }

      // Определяем роль пользователя
      // В актуальной схеме public.profiles поле role отсутствует; используем citizen по умолчанию
      const userRole = ((profile as any).role ?? 'citizen') as string;
      const isCandidate = ['candidate', 'cadet_test', 'cadet_practice'].includes(userRole);

      // Базовые данные для всех ролей
      const baseData = {
        user: {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          role: userRole,
          avatarUrl: null, // Будет заполнено из character
          firstName: null,
          lastName: null,
          department: null,
          division: null,
          isActive: true,
          gameWarnings: 0,
          adminWarnings: 0,
          attemptsLeft: 3,
          profileImageUrl: null,
        },
        activities: [],
        announcements: [],
        usefulLinks: [
          {
            id: '1',
            title: 'Discord сервер',
            url: 'https://discord.gg/horizoncommunity',
            icon: 'discord',
            description: 'Присоединяйтесь к нашему Discord серверу'
          },
          {
            id: '2',
            title: 'Группа ВКонтакте',
            url: 'https://vk.com/horizoncommunity',
            icon: 'vk',
            description: 'Следите за новостями в нашей группе ВК'
          },
          {
            id: '3',
            title: 'Правила сообщества',
            url: '/rules',
            icon: 'book',
            description: 'Ознакомьтесь с правилами сообщества'
          },
          {
            id: '4',
            title: 'FAQ',
            url: '/faq',
            icon: 'help-circle',
            description: 'Часто задаваемые вопросы'
          }
        ]
      };

      // Получаем character данные для расширения профиля
      try {
        const character = await cabinetService.getUserCharacter(userId);
        if (character) {
          baseData.user.firstName = character.first_name;
          baseData.user.lastName = character.last_name;
          baseData.user.profileImageUrl = character.mugshot_url;
        }
      } catch (error) {
        console.warn('Failed to get character data:', error);
      }

      // Получаем заявки пользователя для activities
      try {
        const applications = await cabinetService.getUserApplications(userId);
        baseData.activities = applications.map(app => ({
          id: app.id,
          type: 'application',
          status: app.status,
          title: `Заявка на вступление в ${app.data?.department || 'департамент'}`,
          createdAt: app.created_at || new Date().toISOString(),
        }));
      } catch (error) {
        console.warn('Failed to get applications:', error);
      }

      // Получаем объявления (пока mock данные)
      baseData.announcements = [
        {
          id: '1',
          title: 'Обновление правил сообщества',
          preview: 'Внесены изменения в правила поведения участников. Просим ознакомиться с обновлениями.',
          priority: 'high',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          title: 'Новые возможности системы',
          preview: 'Добавлены новые функции для работы с заявками и управления профилем.',
          priority: 'normal',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];

      // Если пользователь - кандидат, возвращаем базовые данные
      if (isCandidate) {
        return res.json({
          success: true,
          data: {
            ...baseData,
            // Для кандидатов НЕ включаем statistics
            applicationStatus: {
              attemptsLeft: baseData.user.attemptsLeft,
              applicationsCount: baseData.activities.filter(a => a.type === 'application').length,
              testsPassed: baseData.activities.filter(a => a.type === 'test' && a.status === 'approved').length,
            },
            nextSteps: [
              {
                id: '1',
                title: 'Подать заявку на вступление',
                description: 'Заполните форму заявки для вступления в сообщество',
                completed: baseData.activities.some(a => a.type === 'application'),
                link: '/entry-application'
              },
              {
                id: '2',
                title: 'Пройти интервью',
                description: 'После одобрения заявки вас пригласят на интервью',
                completed: false,
                link: null
              },
              {
                id: '3',
                title: 'Сдать вступительный тест',
                description: 'Пройдите тест на знание правил и основ ролевой игры',
                completed: false,
                link: null
              }
            ]
          }
        });
      }

      // Если пользователь - участник сообщества, добавляем расширенные данные
      try {
        // Получаем статистику пользователя
        const stats = await cabinetService.getUserStats(userId);
        
        // Получаем департаменты пользователя
        const departments = await cabinetService.getUserDepartments(userId);
        
        // Получаем жалобы пользователя
        const complaints = await cabinetService.getUserComplaints(userId);
        
        // Получаем рапорты пользователя
        const reports = await cabinetService.getUserReports(userId);

        // Расширяем activities данными о жалобах и рапортах
        const complaintActivities = complaints.map(complaint => ({
          id: complaint.id,
          type: 'complaint',
          status: complaint.status,
          title: complaint.title,
          createdAt: complaint.created_at || new Date().toISOString(),
        }));

        const reportActivities = reports.map(report => ({
          id: report.id,
          type: 'report',
          status: report.status || 'pending',
          title: report.title,
          createdAt: report.created_at || new Date().toISOString(),
        }));

        baseData.activities = [...baseData.activities, ...complaintActivities, ...reportActivities];

        // Обновляем профиль данными о департаментах
        if (departments.length > 0) {
          const primaryDept = departments[0];
          baseData.user.department = primaryDept.name;
          baseData.user.division = primaryDept.division?.name || null;
        }

        return res.json({
          success: true,
          data: {
            ...baseData,
            // Для участников включаем statistics
            statistics: {
              playtime: stats.playtime || 0,
              reputation: stats.reputation || 0,
              reports: reports.length,
              achievements: stats.achievements || 0,
            },
            // Дополнительные данные для участников
            departments: departments,
            complaints: complaints,
            reports: reports,
          }
        });

      } catch (error) {
        console.error('Error getting member data:', error);
        
        // Возвращаем базовые данные с пустой статистикой в случае ошибки
        return res.json({
          success: true,
          data: {
            ...baseData,
            statistics: {
              playtime: 0,
              reputation: 0,
              reports: 0,
              achievements: 0,
            },
            departments: [],
            complaints: [],
            reports: [],
          }
        });
      }

    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  });

  // Подключаем новые админские роуты, включая admin/tests
  router.use('/admin', adminRouter);
  router.use('/characters', createCharacterRoutes({} as any));
  router.use('/cabinet', createCabinetRoutes({} as any));
  router.use('/applications', createApplicationRoutes({} as any));
  router.use('/departments', createDepartmentRoutes({} as any));
  // Старые роуты тестов удалены в пользу новых сервисов и маршрутов
  // router.use('/tests', createTestRoutes(services));
  router.use('/test-sessions', testSessionsRoutes);
  router.use('/report-templates', createReportTemplatesRoutes());
  router.use('/ems-fd-reports', createEmsFdReportsRoutes());
  router.use('/law-reports', createLawReportsRoutes());
  router.use('/discord', createDiscordRoutes());
  router.use('/forum', createForumRoutes());
  router.use('/realtime', createRealtimeRoutes());

  return router;
}

// Оставляем экспорт по умолчанию для обратной совместимости
export default createV1Router; 
