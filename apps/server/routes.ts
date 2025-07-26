import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from '@supabase/supabase-js';
import { loginSchema, registerSchema, insertApplicationSchema, insertComplaintSchema, User } from "./types";
import { getAuthenticatedUser, requireAuthentication } from "./utils/auth";
import { createTestRoutes } from "./routes/tests";
import { createSchedulerRoutes } from "./routes/scheduler";
import { BusinessLogic } from "./businessLogic";
import { Scheduler } from "./scheduler";
import cadRoutes from "./routes/cad";
import discordRoutes from "./routes/discord";
import reportTemplatesRoutes from "./routes/reportTemplates";
import filledReportsRoutes from "./routes/filledReports";
import { initializeCADWebSocket } from "./websocket";
import fs from 'fs/promises';
import path from 'path';
import { authenticateToken, requireSupervisor, requireAdmin } from './middleware/auth.middleware';
import { uploadMiddleware, handleUpload } from './fileUpload';
import adminSupportRoutes from './routes/admin/support.routes.js';
import adminTestsRoutes from './routes/adminTests.js';
import forumRoutes from './routes/forum.js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

interface AuthenticatedRequest extends Request {
  user: User;
  authUser?: any;
}

// Middleware to verify JWT token
// const authenticateToken = async (req: any, res: any, next: any) => {
//   console.log('🔍 authenticateToken middleware called');
//   console.log('  URL:', req.url);
//   console.log('  Method:', req.method);
//   console.log('  Headers:', req.headers);
  
//   try {
//     const user = await getAuthenticatedUser(req);
//     console.log('  User result:', user ? `${user.email} (ID: ${user.id})` : 'null');
    
//     if (!user) {
//       console.log('❌ No user found, returning 401');
//       return res.status(401).json({ message: 'Access token required' });
//     }
    
//     req.user = user;
//     console.log('✅ User authenticated, proceeding to route');
    
//     // Также получаем Supabase auth user для backward compatibility
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (token) {
//       const { data: { user: authUser } } = await supabase.auth.getUser(token);
//       req.authUser = authUser;
//     }
    
//     next();
//   } catch (error) {
//     console.error('❌ Authentication error:', error);
//     return res.status(401).json({ message: 'Authentication failed' });
//   }
// };

// Middleware to check if user has supervisor/admin role
// const requireSupervisor = (req: any, res: any, next: any) => {
//   if (!req.user || !['supervisor', 'admin'].includes(req.user.role)) {
//     return res.status(403).json({ message: 'Supervisor access required' });
//   }
//   next();
// };

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      const existingUserByUsername = await storage.getUserByUsername(username);
      
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Создать пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      
      if (authError) return res.status(400).json({ error: authError.message });
      
      // Создать запись в таблице users
      const user = await storage.createUser({
        username,
        email,
        passwordHash: '', // Больше не нужен
        role: 'candidate',
        status: 'active',
        gameWarnings: 0,
        adminWarnings: 0,
        authId: authData.user.id
      });
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword, authUser: authData.user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('LOGIN BODY:', req.body);
      const { email, password } = loginSchema.parse(req.body);
      
      // Authenticate with Supabase using admin client
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('Auth successful, user ID:', authData.user.id);
      console.log('Looking for user with auth_id:', authData.user.id);
      
      // Get user from our database
      const user = await storage.getUserByAuthId(authData.user.id);
      
      if (!user) {
        console.error('User not found in database with auth_id:', authData.user.id);
        // Попробуем найти по email
        const userByEmail = await storage.getUserByEmail(email);
        console.log('User by email search result:', userByEmail);
        return res.status(401).json({ message: 'User not found' });
      }
      
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword, 
        authUser: authData.user,
        session: authData.session
      });
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const { passwordHash: _, ...userWithoutPassword } = req.user;
    // Получаем всех персонажей пользователя
    const characters = await storage.getCharactersByOwner(req.user.id);
    res.json({ user: userWithoutPassword, characters });
  });

  app.post('/api/auth/logout', authenticateToken, async (req: any, res) => {
    try {
      // Supabase handles logout on the client side
      // We just return success here
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  // Public routes
  app.get('/api/departments', async (req, res) => {
    const departments = await storage.getAllDepartments();
    res.json(departments);
  });

  app.get('/api/departments/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const department = await storage.getDepartment(id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json(department);
  });

  // Protected user routes
  app.get('/api/applications', authenticateToken, async (req: any, res) => {
    const applications = await storage.getApplicationsByUser(req.user.id);
    res.json(applications);
  });

  app.post('/api/applications', authenticateToken, async (req: any, res) => {
    try {
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      
      const application = await storage.createApplication(applicationData);
      
      // Create notification for supervisors
      const supervisors = (await storage.getAllUsers()).filter(u => u.role === 'supervisor' || u.role === 'admin');
      for (const supervisor of supervisors) {
        await storage.createNotification({
          recipientId: supervisor.id,
          content: `New ${application.type} application from ${req.user.username}`,
          link: `/admin/applications/${application.id}`
        });
      }
      
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ message: 'Invalid application data' });
    }
  });

  app.get('/api/reports', authenticateToken, async (req: any, res) => {
    const reports = await storage.getReportsByUser(req.user.id);
    res.json(reports);
  });

  // Создание нового рапорта с загрузкой файла
  app.post('/api/reports', authenticateToken, async (req: any, res) => {
    try {
      // В реальной реализации здесь будет обработка multipart/form-data
      // с использованием multer или аналогичного middleware
      const { fileUrl, type, notes } = req.body;
      
      if (!fileUrl) {
        return res.status(400).json({ message: 'File URL is required' });
      }

      const reportData = {
        authorId: req.user.id,
        status: 'pending',
        fileUrl,
        supervisorComment: null
      };

      const report = await storage.createReport(reportData);

      // Создаем уведомление для супервайзеров
      const supervisors = (await storage.getAllUsers()).filter(u => u.role === 'supervisor' || u.role === 'admin');
      for (const supervisor of supervisors) {
        await storage.createNotification({
          recipientId: supervisor.id,
          content: `New report submitted by ${req.user.username}`,
          link: `/admin/reports/${report.id}`
        });
      }

      res.status(201).json(report);
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(400).json({ message: 'Failed to create report' });
    }
  });

  // Получение списка шаблонов рапортов
  app.get('/api/report-templates', authenticateToken, async (req: any, res) => {
    try {
      // В реальной реализации шаблоны будут храниться в БД
      // Пока возвращаем моковые данные
      const templates = [
        {
          id: "incident-report",
          name: "Incident Report",
          description: "Standard incident documentation form",
          fileUrl: "/templates/incident-report.pdf",
          department: "LSPD"
        },
        {
          id: "arrest-report", 
          name: "Arrest Report",
          description: "Detailed arrest documentation",
          fileUrl: "/templates/arrest-report.pdf",
          department: "LSPD"
        },
        {
          id: "vehicle-report",
          name: "Vehicle Inspection Report", 
          description: "Vehicle condition and inspection details",
          fileUrl: "/templates/vehicle-report.pdf",
          department: "LSPD"
        },
        {
          id: "fire-report",
          name: "Fire Incident Report",
          description: "Fire department incident documentation", 
          fileUrl: "/templates/fire-report.pdf",
          department: "LSFD"
        },
        {
          id: "medical-report",
          name: "Medical Response Report",
          description: "EMS response and treatment documentation",
          fileUrl: "/templates/medical-report.pdf", 
          department: "EMS"
        }
      ];

      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  // Скачивание шаблона рапорта
  app.get('/api/report-templates/:id/download', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Список доступных шаблонов
      const availableTemplates = {
        'incident-report': 'incident-report.txt',
        'arrest-report': 'arrest-report.txt',
        'vehicle-report': 'vehicle-report.txt',
        'fire-report': 'fire-report.txt',
        'medical-report': 'medical-report.txt'
      };
      
      const fileName = availableTemplates[id as keyof typeof availableTemplates];
      
      if (!fileName) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      const filePath = path.join(__dirname, '../public/templates', fileName);
      
      // Проверяем существование файла
      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({ message: 'Template file not found' });
      }
      
      // Отправляем файл для скачивания
      res.download(filePath, fileName);
      
    } catch (error) {
      console.error('Error downloading template:', error);
      res.status(500).json({ message: 'Failed to download template' });
    }
  });

  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    const notifications = await storage.getNotificationsByUser(req.user.id);
    res.json(notifications);
  });

  app.get('/api/application-limits/:type', authenticateToken, async (req: any, res) => {
    const { type } = req.params;
    const businessLogic = new BusinessLogic(storage);
    
    console.log('🔍 API Application Limits Debug:');
    console.log('  User ID:', req.user.id);
    console.log('  User Email:', req.user.email);
    console.log('  Application Type:', type);
    
    try {
      const restriction = await businessLogic.canSubmitApplication(req.user.id, type);
      const stats = await businessLogic.getUserApplicationStats(req.user.id);
      
      console.log('  Restriction Result:', restriction);
      console.log('  Stats Result:', stats);
      
      res.json({
        restriction,
        stats
      });
    } catch (error) {
      console.error('  Error:', error);
      res.status(500).json({ message: 'Failed to check application limits' });
    }
  });

  app.put('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const notification = await storage.markNotificationAsRead(id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  });

  app.put('/api/notifications/read-all', authenticateToken, async (req: any, res) => {
    const notifications = await storage.markAllNotificationsAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read', count: notifications.length });
  });

  app.delete('/api/notifications/:id', authenticateToken, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const notification = await storage.getNotification(id);
    
    if (!notification || notification.recipientId !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await storage.deleteNotification(id);
    res.json({ message: 'Notification deleted' });
  });

  app.post('/api/complaints', authenticateToken, async (req: any, res) => {
    try {
      const complaintData = insertComplaintSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      
      const complaint = await storage.createComplaint(complaintData);
      res.status(201).json(complaint);
    } catch (error) {
      res.status(400).json({ message: 'Invalid complaint data' });
    }
  });

  // Support ticket routes
  app.get('/api/tickets', authenticateToken, async (req: any, res) => {
    const tickets = await storage.getSupportTicketsByUser(req.user.id);
    res.json(tickets);
  });

  app.post('/api/tickets', authenticateToken, async (req: any, res) => {
    try {
      const ticket = await storage.createSupportTicket({
        authorId: req.user.id,
        status: 'open',
        messages: []
      });
      
      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create ticket' });
    }
  });

  app.get('/api/tickets/:id', authenticateToken, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const ticket = await storage.getSupportTicket(id);
    
    if (!ticket || ticket.authorId !== req.user.id) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json(ticket);
  });

  // Admin routes
  app.get('/api/admin/applications', authenticateToken, requireSupervisor, async (req, res) => {
    const applications = await storage.getAllApplications();
    const users = await storage.getAllUsers();
    
    const applicationsWithUsers = applications.map(app => {
      const author = users.find(u => u.id === app.authorId);
      return {
        ...app,
        author: author ? { id: author.id, username: author.username, rank: author.rank } : null
      };
    });
    
    res.json(applicationsWithUsers);
  });

  app.put('/api/admin/applications/:id', authenticateToken, requireSupervisor, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const { status, reviewComment } = req.body;

    // Получаем заявку
    const application = await storage.getApplication(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    let updatedApplication = application;

    if (status === 'approved') {
      // Создаем персонажа на основе данных заявки
      const data = application.data as {
        firstName: string;
        lastName: string;
        departmentId: number;
        rank?: string;
        insuranceNumber?: string;
        address?: string;
      };
      const newCharacter = await storage.createCharacter({
        ownerId: application.authorId,
        firstName: data.firstName,
        lastName: data.lastName,
        departmentId: data.departmentId,
        rank: data.rank || '',
        status: 'active',
        insuranceNumber: data.insuranceNumber || '',
        address: data.address || ''
      });
      // Обновляем заявку: статус, reviewer, комментарий, characterId
      updatedApplication = await storage.updateApplication(id, {
        status,
        reviewComment,
        reviewerId: req.user.id,
        characterId: newCharacter.id
      }) ?? application;
    } else {
      // Просто обновляем статус и комментарий
      updatedApplication = await storage.updateApplication(id, {
        status,
        reviewComment,
        reviewerId: req.user.id
      }) ?? application;
    }

    // Create notification for applicant
    await storage.createNotification({
      recipientId: application.authorId,
      content: `Your ${application.type} application has been ${status}`,
      link: `/applications/${application.id}`
    });

    res.json(updatedApplication);
  });

  app.get('/api/admin/users', authenticateToken, requireSupervisor, async (req, res) => {
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);
    res.json(usersWithoutPasswords);
  });

  app.put('/api/admin/users/:id', authenticateToken, requireSupervisor, async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const user = await storage.updateUser(id, updates);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get('/api/admin/tickets', authenticateToken, requireSupervisor, async (req, res) => {
    const tickets = await storage.getAllSupportTickets();
    res.json(tickets);
  });

  // Получение всех рапортов для администраторов
  app.get('/api/admin/reports', authenticateToken, requireSupervisor, async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      
      // Получаем информацию об авторах для каждого рапорта
      const reportsWithAuthors = await Promise.all(
        reports.map(async (report) => {
          const author = await storage.getUser(report.authorId);
          return {
            ...report,
            author: author ? {
              id: author.id,
              username: author.username,
              email: author.email,
              department: author.departmentId
            } : null
          };
        })
      );
      
      res.json(reportsWithAuthors);
    } catch (error) {
      console.error('Error fetching admin reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  });

  // Обновление статуса рапорта (одобрение/отклонение)
  app.put('/api/admin/reports/:id', authenticateToken, requireSupervisor, async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const { status, supervisorComment } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
      }

      const report = await storage.updateReport(reportId, {
        status,
        supervisorComment
      });

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      // Создаем уведомление автору рапорта
      await storage.createNotification({
        recipientId: report.authorId,
        content: `Your report #${report.id} has been ${status}`,
        link: `/reports`
      });

      res.json(report);
    } catch (error) {
      console.error('Error updating report:', error);
      res.status(500).json({ message: 'Failed to update report' });
    }
  });

  app.get('/api/stats', authenticateToken, requireSupervisor, async (req, res) => {
    const users = await storage.getAllUsers();
    const applications = await storage.getAllApplications();
    const departments = await storage.getAllDepartments();
    const tickets = await storage.getAllSupportTickets();
    
    const stats = {
      totalUsers: users.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      activeDepartments: departments.length,
      openTickets: tickets.filter(ticket => ticket.status === 'open').length
    };
    
    res.json(stats);
  });

  // CAD/MDT routes
  app.use('/api/cad', cadRoutes);
  app.use('/api/discord', discordRoutes);

  // Report templates and filled reports routes
  app.use('/api/report-templates', reportTemplatesRoutes);
  app.use('/api/filled-reports', filledReportsRoutes);

  // Test routes
  const businessLogic = new BusinessLogic(storage);
  const testRoutes = createTestRoutes(storage, businessLogic);
  app.use('/api/tests', testRoutes);

  // Joint positions routes
  app.get('/api/joint-positions', authenticateToken, async (req: any, res) => {
    try {
      const activeJoints = await businessLogic.getActiveJointPositions(req.user.id);
      res.json(activeJoints);
    } catch (error) {
      console.error('Error getting joint positions:', error);
      res.status(500).json({ message: 'Failed to get joint positions' });
    }
  });

  // Leave statistics route
  app.get('/api/leave-stats', authenticateToken, async (req: any, res) => {
    try {
      const leaveStats = await businessLogic.getUserLeaveStats(req.user.id);
      res.json(leaveStats);
    } catch (error) {
      console.error('Error getting leave stats:', error);
      res.status(500).json({ message: 'Failed to get leave statistics' });
    }
  });

  app.delete('/api/joint-positions/:userId', authenticateToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { reason } = req.body;

      // Проверяем, что пользователь удаляет свое собственное совмещение
      if (userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only remove your own joint position' });
      }

      await businessLogic.removeJointPosition(userId, reason);
      res.json({ message: 'Joint position removed successfully' });
    } catch (error) {
      console.error('Error removing joint position:', error);
      res.status(500).json({ message: 'Failed to remove joint position' });
    }
  });

  // Admin joint position management
  app.get('/api/admin/joint-applications', authenticateToken, requireSupervisor, async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      const jointApplications = applications.filter(app => 
        app.type === 'joint_primary' || app.type === 'joint_secondary'
      );
      
      const users = await storage.getAllUsers();
      const departments = await storage.getAllDepartments();
      
      const applicationsWithDetails = jointApplications.map(app => {
        const author = users.find(u => u.id === app.authorId);
        const secondaryDepartment = departments.find(d => d.id === (app.data as any)?.secondaryDepartmentId);
        
        return {
          ...app,
          author: author ? { id: author.id, username: author.username, rank: author.rank } : null,
          secondaryDepartment: secondaryDepartment ? { id: secondaryDepartment.id, name: secondaryDepartment.name, fullName: secondaryDepartment.fullName } : null
        };
      });
      
      res.json(applicationsWithDetails);
    } catch (error) {
      console.error('Error getting joint applications:', error);
      res.status(500).json({ message: 'Failed to get joint applications' });
    }
  });

  app.put('/api/admin/joint-applications/:id', authenticateToken, requireSupervisor, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approved, comment } = req.body;

      await businessLogic.processJointApplication(id, approved, req.user.id, comment);
      
      res.json({ message: `Joint application ${approved ? 'approved' : 'rejected'} successfully` });
    } catch (error) {
      console.error('Error processing joint application:', error);
      res.status(500).json({ message: 'Failed to process joint application' });
    }
  });

  // Admin leave management routes
  app.get('/api/admin/leave-applications', authenticateToken, requireSupervisor, async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      const leaveApplications = applications.filter(app => app.type === 'leave');
      
      const users = await storage.getAllUsers();
      const departments = await storage.getAllDepartments();
      
      const applicationsWithDetails = leaveApplications.map(app => {
        const author = users.find(u => u.id === app.authorId);
        const department = departments.find(d => d.id === author?.departmentId);
        
        return {
          ...app,
          author: author ? { 
            id: author.id, 
            username: author.username, 
            rank: author.rank,
            department: department ? { id: department.id, name: department.name } : null
          } : null
        };
      });
      
      res.json(applicationsWithDetails);
    } catch (error) {
      console.error('Error getting leave applications:', error);
      res.status(500).json({ message: 'Failed to get leave applications' });
    }
  });

  app.get('/api/admin/leave-stats', authenticateToken, requireSupervisor, async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      const leaveApplications = applications.filter(app => app.type === 'leave');
      const users = await storage.getAllUsers();
      const departments = await storage.getAllDepartments();

      // Статистика по департаментам
      const departmentStats: Record<number, {
        name: string;
        totalLeaves: number;
        approvedLeaves: number;
        pendingLeaves: number;
        totalDays: number;
        leaveTypes: Record<string, number>;
      }> = {};

      for (const dept of departments) {
        const deptUsers = users.filter(u => u.departmentId === dept.id);
        const deptLeaves = leaveApplications.filter(app => 
          deptUsers.some(u => u.id === app.authorId)
        );

        const approvedLeaves = deptLeaves.filter(app => app.status === 'approved');
        const pendingLeaves = deptLeaves.filter(app => app.status === 'pending');

        let totalDays = 0;
        const leaveTypes: Record<string, number> = {};

        for (const leave of approvedLeaves) {
          const data = leave.data as any;
          const startDate = new Date(data.startDate);
          const endDate = new Date(data.endDate);
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          totalDays += days;
          leaveTypes[data.leaveType] = (leaveTypes[data.leaveType] || 0) + days;
        }

        departmentStats[dept.id] = {
          name: dept.name,
          totalLeaves: deptLeaves.length,
          approvedLeaves: approvedLeaves.length,
          pendingLeaves: pendingLeaves.length,
          totalDays,
          leaveTypes
        };
      }

      // Общая статистика
      const totalStats = {
        totalApplications: leaveApplications.length,
        approvedApplications: leaveApplications.filter(app => app.status === 'approved').length,
        pendingApplications: leaveApplications.filter(app => app.status === 'pending').length,
        rejectedApplications: leaveApplications.filter(app => app.status === 'rejected').length,
        totalDays: leaveApplications
          .filter(app => app.status === 'approved')
          .reduce((total, app) => {
            const data = app.data as any;
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return total + days;
          }, 0)
      };

      res.json({
        totalStats,
        departmentStats
      });
    } catch (error) {
      console.error('Error getting leave stats:', error);
      res.status(500).json({ message: 'Failed to get leave statistics' });
    }
  });

  // Scheduler routes
  const scheduler = new Scheduler(businessLogic, storage, {
    resetLimitsCron: "0 0 1 * *",
    leaveProcessingCron: "0 9 * * *",
    timezone: "Europe/Moscow"
  });
  const schedulerRoutes = createSchedulerRoutes(scheduler);
  app.use('/api/scheduler', schedulerRoutes);

  app.post('/api/files/upload/:category', authenticateToken, uploadMiddleware, handleUpload);

  // Admin routes
  app.use('/api/admin/support', adminSupportRoutes);
  app.use('/api/admin/tests', adminTestsRoutes);

  // Forum routes
  app.use('/api/forum', forumRoutes);

  const httpServer = createServer(app);
  
  // Initialize CAD WebSocket
  initializeCADWebSocket(httpServer);
  
  return httpServer;
}
