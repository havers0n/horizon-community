import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { storage } from '../../storage';

// Мокаем storage для тестов
jest.mock('../../storage', () => ({
  storage: {
    getUserByEmail: jest.fn(),
    getUserByUsername: jest.fn(),
    createUser: jest.fn(),
    getUserByAuthId: jest.fn(),
    getCharactersByOwner: jest.fn(),
    getAllUsers: jest.fn(),
    createNotification: jest.fn(),
  }
}));

// Мокаем Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      admin: {
        createUser: jest.fn(),
      },
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
  })),
}));

describe('Auth API', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(() => {
    server?.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user successfully', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Мокаем что пользователь не существует
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (storage.getUserByUsername as jest.Mock).mockResolvedValue(null);
      
      // Мокаем создание пользователя в Supabase
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null
      });
      
      // Мокаем создание пользователя в нашей БД
      (storage.createUser as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active',
        authId: 'auth-123'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('candidate');
    });

    it('should return 400 if email already exists', async () => {
      (storage.getUserByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(400);

      expect(response.body.message).toBe('Email already registered');
    });

    it('should return 400 if username already exists', async () => {
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (storage.getUserByUsername as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(400);

      expect(response.body.message).toBe('Username already taken');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        username: '',
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Invalid request data');
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login user successfully', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Мокаем успешную аутентификацию в Supabase
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'auth-123' },
          session: { access_token: 'token-123' }
        },
        error: null
      });
      
      // Мокаем поиск пользователя в нашей БД
      (storage.getUserByAuthId as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active',
        authId: 'auth-123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 if user not found in database', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'auth-123' },
          session: { access_token: 'token-123' }
        },
        error: null
      });
      
      (storage.getUserByAuthId as jest.Mock).mockResolvedValue(null);
      (storage.getUserByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile when authenticated', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        status: 'active'
      };

      (storage.getCharactersByOwner as jest.Mock).mockResolvedValue([]);

      // Мокаем middleware аутентификации
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      };

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('characters');
      expect(response.body.user.username).toBe('testuser');

      // Восстанавливаем оригинальный middleware
      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };

      // Мокаем middleware аутентификации
      const originalAuthenticateToken = require('../../middleware/auth.middleware').authenticateToken;
      require('../../middleware/auth.middleware').authenticateToken = (req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      };

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');

      // Восстанавливаем оригинальный middleware
      require('../../middleware/auth.middleware').authenticateToken = originalAuthenticateToken;
    });
  });
}); 