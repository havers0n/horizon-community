import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

interface SecurityConfig {
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  csrf: {
    enabled: boolean;
    secret: string;
  };
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
  };
  encryption: {
    algorithm: string;
    keyLength: number;
  };
}

interface RateLimitRule {
  path: string;
  windowMs: number;
  maxRequests: number;
  message: string;
  skipIf?: (req: Request) => boolean;
}

interface SecurityLog {
  timestamp: Date;
  type: 'rate_limit' | 'csrf_violation' | 'auth_failure' | 'suspicious_activity';
  ip: string;
  userAgent?: string;
  userId?: number;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityManager {
  private config: SecurityConfig;
  private securityLogs: SecurityLog[] = [];
  private blockedIPs: Set<string> = new Set();
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

  /**
   * Проверка и декодирование JWT-токена
   */
  verifyToken(token: string): any | null {
    try {
      const secret = process.env.JWT_SECRET || 'default_jwt_secret';
      return jwt.verify(token, secret);
    } catch (err) {
      return null;
    }
  }

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      rateLimiting: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        skipSuccessfulRequests: false,
        ...config.rateLimiting
      },
      csrf: {
        enabled: true,
        secret: process.env.CSRF_SECRET || 'default-csrf-secret',
        ...config.csrf
      },
      cors: {
        enabled: true,
        allowedOrigins: [
          'http://localhost:5000',
          'https://*.replit.app',
          'https://*.replit.dev'
        ],
        ...config.cors
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ...config.encryption
      }
    };
  }

  /**
   * Create rate limiting middleware
   */
  createRateLimiter(options?: Partial<RateLimitRule>) {
    const defaultOptions = {
      windowMs: this.config.rateLimiting.windowMs,
      max: this.config.rateLimiting.maxRequests,
      message: { error: 'Too many requests, please try again later' },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: this.config.rateLimiting.skipSuccessfulRequests,
      ...options
    };

    return rateLimit({
      ...defaultOptions,
      handler: (req: Request, res: Response) => {
        this.logSecurityEvent({
          type: 'rate_limit',
          ip: this.getClientIP(req),
          userAgent: req.get('User-Agent'),
          details: {
            path: req.path,
            method: req.method,
            limit: defaultOptions.max
          },
          severity: 'medium'
        });

        res.status(429).json(defaultOptions.message);
      }
    });
  }

  /**
   * Rate limiting rules for different endpoints
   */
  getRateLimitingRules(): Record<string, any> {
    return {
      // Authentication endpoints - stricter limits
      '/api/auth/login': this.createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per window
        message: { error: 'Too many login attempts, please try again in 15 minutes' }
      }),

      '/api/auth/register': this.createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 registrations per hour per IP
        message: { error: 'Too many registration attempts, please try again later' }
      }),

      // Application submission - prevent spam
      '/api/applications': this.createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 applications per hour
        message: { error: 'Application submission limit reached, please try again later' }
      }),

      // Support tickets
      '/api/tickets': this.createRateLimiter({
        windowMs: 30 * 60 * 1000, // 30 minutes
        max: 5, // 5 tickets per 30 minutes
        message: { error: 'Support ticket limit reached, please try again later' }
      }),

      // File uploads
      '/api/files/upload': this.createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 20, // 20 uploads per 15 minutes
        message: { error: 'File upload limit reached, please try again later' }
      }),

      // General API endpoints
      '/api/*': this.createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200, // 200 requests per 15 minutes
        message: { error: 'API rate limit exceeded, please slow down' }
      })
    };
  }

  /**
   * Input sanitization middleware
   */
  sanitizeInput() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Sanitize body
        if (req.body) {
          req.body = this.sanitizeObject(req.body);
        }

        // Sanitize query parameters
        if (req.query) {
          req.query = this.sanitizeObject(req.query);
        }

        // Sanitize route parameters
        if (req.params) {
          req.params = this.sanitizeObject(req.params);
        }

        next();
      } catch (error) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          ip: this.getClientIP(req),
          userAgent: req.get('User-Agent'),
          details: {
            error: 'Input sanitization failed',
            path: req.path,
            method: req.method
          },
          severity: 'high'
        });

        res.status(400).json({ error: 'Invalid input detected' });
      }
    };
  }

  /**
   * CSRF protection middleware
   */
  csrfProtection() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.csrf.enabled) {
        return next();
      }

      // Skip CSRF for GET requests
      if (req.method === 'GET') {
        return next();
      }

      const token = req.headers['x-csrf-token'] as string;
      const sessionToken = req.session?.csrfToken;

      if (!token || !sessionToken || token !== sessionToken) {
        this.logSecurityEvent({
          type: 'csrf_violation',
          ip: this.getClientIP(req),
          userAgent: req.get('User-Agent'),
          details: {
            path: req.path,
            method: req.method,
            hasToken: !!token,
            hasSessionToken: !!sessionToken
          },
          severity: 'high'
        });

        return res.status(403).json({ error: 'CSRF token validation failed' });
      }

      next();
    };
  }

  /**
   * IP blocking middleware
   */
  ipBlocking() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = this.getClientIP(req);

      if (this.blockedIPs.has(clientIP)) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          ip: clientIP,
          userAgent: req.get('User-Agent'),
          details: {
            reason: 'Blocked IP attempted access',
            path: req.path,
            method: req.method
          },
          severity: 'high'
        });

        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    };
  }

  /**
   * Authentication failure tracking
   */
  trackAuthFailure(ip: string, userId?: number) {
    const key = `${ip}:${userId || 'unknown'}`;
    const now = new Date();
    
    const existing = this.failedAttempts.get(key) || { count: 0, lastAttempt: now };
    existing.count += 1;
    existing.lastAttempt = now;
    
    this.failedAttempts.set(key, existing);

    // Block IP after 10 failed attempts in 1 hour
    if (existing.count >= 10) {
      this.blockedIPs.add(ip);
      
      this.logSecurityEvent({
        type: 'auth_failure',
        ip,
        userId,
        details: {
          reason: 'Too many failed authentication attempts',
          attemptCount: existing.count,
          autoBlocked: true
        },
        severity: 'critical'
      });

      // Auto-unblock after 24 hours
      setTimeout(() => {
        this.blockedIPs.delete(ip);
        this.failedAttempts.delete(key);
      }, 24 * 60 * 60 * 1000);
    }

    this.logSecurityEvent({
      type: 'auth_failure',
      ip,
      userId,
      details: {
        attemptCount: existing.count,
        timeWindow: '1 hour'
      },
      severity: existing.count > 5 ? 'high' : 'medium'
    });
  }

  /**
   * Clear auth failures on successful login
   */
  clearAuthFailures(ip: string, userId?: number) {
    const key = `${ip}:${userId || 'unknown'}`;
    this.failedAttempts.delete(key);
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const algorithm = this.config.encryption.algorithm;
    const key = crypto.scryptSync(this.config.csrf.secret, 'salt', this.config.encryption.keyLength);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('CAD-System', 'utf8'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string, iv: string, tag: string): string {
    const algorithm = this.config.encryption.algorithm;
    const key = crypto.scryptSync(this.config.csrf.secret, 'salt', this.config.encryption.keyLength);
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('CAD-System', 'utf8'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate secure CSRF token
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Log security events
   */
  private logSecurityEvent(event: Omit<SecurityLog, 'timestamp'>) {
    const logEntry: SecurityLog = {
      ...event,
      timestamp: new Date()
    };

    this.securityLogs.push(logEntry);

    // Keep only last 1000 logs in memory
    if (this.securityLogs.length > 1000) {
      this.securityLogs = this.securityLogs.slice(-1000);
    }

    // In production, would send to external logging service
    console.log('Security Event:', logEntry);

    // Alert on critical events
    if (event.severity === 'critical') {
      this.sendSecurityAlert(logEntry);
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Recursively sanitize object properties
   */
  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Sanitize string input
   */
  private sanitizeString(input: string): string {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/style\s*=/gi, '') // Remove inline styles
      .trim();
  }

  /**
   * Send security alert (mock implementation)
   */
  private sendSecurityAlert(event: SecurityLog) {
    // In production, would integrate with alerting system
    console.error('SECURITY ALERT:', {
      severity: event.severity,
      type: event.type,
      ip: event.ip,
      details: event.details,
      timestamp: event.timestamp
    });
    
    // Could send to Slack, email, or monitoring service
    // Example: webhook to Discord/Slack
    // await fetch(process.env.SECURITY_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text: `🚨 Security Alert: ${event.type} from ${event.ip}`,
    //     severity: event.severity
    //   })
    // });
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalLogs: number;
    logsBySeverity: Record<string, number>;
    logsByType: Record<string, number>;
    blockedIPs: number;
    failedAttempts: number;
    recentEvents: SecurityLog[];
  } {
    const logsBySeverity = this.securityLogs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const logsByType = this.securityLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: this.securityLogs.length,
      logsBySeverity,
      logsByType,
      blockedIPs: this.blockedIPs.size,
      failedAttempts: this.failedAttempts.size,
      recentEvents: this.securityLogs.slice(-10).reverse()
    };
  }

  /**
   * Manual IP blocking/unblocking
   */
  blockIP(ip: string, reason: string) {
    this.blockedIPs.add(ip);
    this.logSecurityEvent({
      type: 'suspicious_activity',
      ip,
      details: { reason: `Manually blocked: ${reason}` },
      severity: 'high'
    });
  }

  unblockIP(ip: string) {
    this.blockedIPs.delete(ip);
    this.failedAttempts.forEach((_, key) => {
      if (key.startsWith(ip)) {
        this.failedAttempts.delete(key);
      }
    });
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Prevent MIME sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Referrer policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Content Security Policy
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' https:; " +
        "connect-src 'self' wss: ws:;"
      );
      
      next();
    };
  }
}

// Export singleton instance
export const securityManager = new SecurityManager();

// Utility functions
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}