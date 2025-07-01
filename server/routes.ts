import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema, insertApplicationSchema, insertComplaintSchema } from "@shared/schema";
import type { User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthRequest extends Request {
  user?: User;
}

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user has supervisor/admin role
const requireSupervisor = (req: any, res: any, next: any) => {
  if (!req.user || !['supervisor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Supervisor access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
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
      
      const passwordHash = await storage.hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        passwordHash,
        role: 'candidate',
        status: 'active',
        gameWarnings: 0,
        adminWarnings: 0
      });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await storage.validatePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const { passwordHash: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
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

  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    const notifications = await storage.getNotificationsByUser(req.user.id);
    res.json(notifications);
  });

  app.put('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const notification = await storage.markNotificationAsRead(id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
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
    
    const application = await storage.updateApplication(id, {
      status,
      reviewComment,
      reviewerId: req.user.id
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Create notification for applicant
    await storage.createNotification({
      recipientId: application.authorId,
      content: `Your ${application.type} application has been ${status}`,
      link: `/applications/${application.id}`
    });
    
    res.json(application);
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

  const httpServer = createServer(app);
  return httpServer;
}
