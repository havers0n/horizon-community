import request from 'supertest';
import express from 'express';
import { AuthService } from '@/services/AuthService';

// Мокаем AuthService
jest.mock('@/services/AuthService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    logoutUser: jest.fn(),
    refreshToken: jest.fn(),
    validateToken: jest.fn(),
  }))
}));

describe('Auth API', () => {
  let app: express.Application;
  let mockAuthService: AuthService;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Создаем мок сервиса
    mockAuthService = new AuthService();

    // Добавляем тестовые роуты
    app.post('/api/v1/auth/register', async (req, res) => {
      try {
        const profile = await mockAuthService.registerUser(req.body);
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            role: profile.role
          }
        });
      } catch (error: any) {
        res.status(error.statusCode || 500).json({
          success: false,
          error: error.message || 'Internal server error'
        });
      }
    });

    app.post('/api/v1/auth/login', async (req, res) => {
      try {
        const result = await mockAuthService.loginUser(req.body);
        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: result.profile.id,
              username: result.profile.username,
              email: result.profile.email,
              role: result.profile.role
            },
            session: result.session
          }
        });
      } catch (error: any) {
        res.status(error.statusCode || 500).json({
          success: false,
          error: error.message || 'Internal server error'
        });
      }
    });
  });

  describe('POST /api/v1/auth/register', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user successfully', async () => {
      const mockProfile = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'candidate',
        created_at: new Date().toISOString()
      };

      (mockAuthService.registerUser as jest.Mock).mockResolvedValue(mockProfile);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(validUserData);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('testuser');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.role).toBe('candidate');
    });

    it('should return 400 if registration fails', async () => {
      const error = new Error('Email already exists');
      (error as any).statusCode = 400;
      
      (mockAuthService.registerUser as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login user successfully', async () => {
      const mockResult = {
        profile: {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          role: 'candidate'
        },
        session: {
          access_token: 'test-token',
          refresh_token: 'refresh-token'
        }
      };

      (mockAuthService.loginUser as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLoginData)
        .expect(200);

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(validLoginData);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.session.access_token).toBe('test-token');
    });

    it('should return 401 if login fails', async () => {
      const error = new Error('Invalid credentials');
      (error as any).statusCode = 401;
      
      (mockAuthService.loginUser as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
}); 