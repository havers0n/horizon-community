import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Интерфейс для схем валидации
 */
interface ValidationSchemas {
  params?: z.ZodSchema;
  query?: z.ZodSchema;
  body?: z.ZodSchema;
}

/**
 * Middleware для валидации запросов с использованием Zod
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Валидация параметров пути
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      // Валидация query параметров
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      // Валидация тела запроса
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          error: 'Ошибка валидации',
          details: validationErrors
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка валидации'
      });
    }
  };
};

/**
 * Middleware для валидации UUID
 */
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uuid = req.params[paramName];
    
    if (!uuid) {
      return res.status(400).json({
        success: false,
        error: `Параметр ${paramName} обязателен`
      });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      return res.status(400).json({
        success: false,
        error: `Неверный формат UUID для параметра ${paramName}`
      });
    }

    next();
  };
};

/**
 * Middleware для валидации числового ID
 */
export const validateNumericId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: `Параметр ${paramName} обязателен`
      });
    }

    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({
        success: false,
        error: `Неверный формат числового ID для параметра ${paramName}`
      });
    }

    req.params[paramName] = numericId.toString();
    next();
  };
};

/**
 * Middleware для валидации email
 */
export const validateEmail = (fieldName: string = 'email') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body[fieldName];
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: `Поле ${fieldName} обязательно`
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: `Неверный формат email для поля ${fieldName}`
      });
    }

    next();
  };
};

/**
 * Middleware для валидации обязательных полей
 */
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные поля',
        missingFields
      });
    }

    next();
  };
};

/**
 * Middleware для валидации длины строки
 */
export const validateStringLength = (fieldName: string, minLength: number, maxLength: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[fieldName];
    
    if (!value) {
      return res.status(400).json({
        success: false,
        error: `Поле ${fieldName} обязательно`
      });
    }

    if (typeof value !== 'string') {
      return res.status(400).json({
        success: false,
        error: `Поле ${fieldName} должно быть строкой`
      });
    }

    if (value.length < minLength || value.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: `Длина поля ${fieldName} должна быть от ${minLength} до ${maxLength} символов`
      });
    }

    next();
  };
};

/**
 * Middleware для валидации числового диапазона
 */
export const validateNumericRange = (fieldName: string, min: number, max: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[fieldName];
    
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        error: `Поле ${fieldName} обязательно`
      });
    }

    const numericValue = Number(value);
    
    if (isNaN(numericValue)) {
      return res.status(400).json({
        success: false,
        error: `Поле ${fieldName} должно быть числом`
      });
    }

    if (numericValue < min || numericValue > max) {
      return res.status(400).json({
        success: false,
        error: `Значение поля ${fieldName} должно быть от ${min} до ${max}`
      });
    }

    next();
  };
}; 