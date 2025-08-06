import { Router } from 'express';
import type { ServicesContainer } from '../../../types/services';
import { createCharacterRoutes } from './characters';
import { createCabinetRoutes } from './cabinet';
import { createAuthRoutes } from '../auth'; // <-- Импортируем фабричную функцию для auth роутов
import { authenticateToken } from '../../middleware/auth.middleware';

// Временные заглушки для остальных роутов
// TODO: Преобразовать все роуты в фабричные функции
const createAdminRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Admin routes - TODO: implement DI' }));
  return router;
};

const createReportTemplatesRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Report templates routes - TODO: implement DI' }));
  return router;
};

const createEmsFdReportsRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'EMS/FD reports routes - TODO: implement DI' }));
  return router;
};

const createLawReportsRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Law reports routes - TODO: implement DI' }));
  return router;
};

const createDiscordRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Discord routes - TODO: implement DI' }));
  return router;
};

const createForumRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Forum routes - TODO: implement DI' }));
  return router;
};

const createRealtimeRoutes = (services: ServicesContainer) => {
  const router: Router = Router();
  router.get('/health', (req, res) => res.json({ status: 'Realtime routes - TODO: implement DI' }));
  return router;
};

/**
 * Фабричная функция для создания v1 роутера с внедренными сервисами
 * Разделяет публичные и защищенные маршруты
 */
export function createV1Router(services: ServicesContainer): Router {
  const router: Router = Router();

  // --- ШАГ 1: РЕГИСТРИСТРИРУЕМ ПУБЛИЧНЫЕ РОУТЫ ---
  // Роуты аутентификации (register, login, verify) должны быть доступны всем
  router.use('/auth', createAuthRoutes(services));

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
   * GET /api/v1/dashboard-data
   * Единый эндпоинт для получения всех данных дашборда
   * Возвращает структурированные данные в зависимости от роли пользователя
   */
  router.get('/dashboard-data', async (req, res) => {
    try {
      const { cabinetService } = services;
      const userId = req.user.id;
      
      // Получаем профиль пользователя для определения роли
      const profile = await cabinetService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ 
          success: false, 
          error: 'Profile not found' 
        });
      }

      // Определяем роль пользователя
      const userRole = profile.role;
      const isCandidate = ['candidate', 'cadet_test', 'cadet_practice'].includes(userRole);

      // Базовые данные для всех ролей
      const baseData = {
        user: {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          role: profile.role,
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

  router.use('/admin', createAdminRoutes(services));
  router.use('/characters', createCharacterRoutes(services));
  router.use('/cabinet', createCabinetRoutes(services));
  router.use('/report-templates', createReportTemplatesRoutes(services));
  router.use('/ems-fd-reports', createEmsFdReportsRoutes(services));
  router.use('/law-reports', createLawReportsRoutes(services));
  router.use('/discord', createDiscordRoutes(services));
  router.use('/forum', createForumRoutes(services));
  router.use('/realtime', createRealtimeRoutes(services));

  return router;
}

// Оставляем экспорт по умолчанию для обратной совместимости
export default createV1Router; 