import { z } from 'zod';

/**
 * Обработчик ошибок валидации Zod
 * Преобразует ошибки Zod в удобный для клиента формат
 */
export function handleZodError(error: z.ZodError): {
  message: string;
  errors: Record<string, string>;
  details: z.ZodIssue[];
} {
  const errors: Record<string, string> = {};
  
  // Обрабатываем ошибки валидации
  error.errors.forEach((issue) => {
    const field = issue.path.join('.');
    errors[field] = issue.message;
  });

  return {
    message: 'Validation failed',
    errors,
    details: error.errors
  };
}

/**
 * Обработчик общих ошибок API
 */
export function handleApiError(error: unknown): {
  message: string;
  status: number;
  details?: any;
} {
  if (error instanceof z.ZodError) {
    return {
      message: 'Validation failed',
      status: 400,
      details: handleZodError(error)
    };
  }

  if (error instanceof Error) {
    // Обрабатываем специфические ошибки
    if (error.message.includes('not found')) {
      return {
        message: 'Resource not found',
        status: 404
      };
    }

    if (error.message.includes('unauthorized') || error.message.includes('access denied')) {
      return {
        message: 'Access denied',
        status: 403
      };
    }

    if (error.message.includes('duplicate') || error.message.includes('already exists')) {
      return {
        message: 'Resource already exists',
        status: 409
      };
    }

    return {
      message: error.message,
      status: 500
    };
  }

  return {
    message: 'Internal server error',
    status: 500
  };
}

/**
 * Middleware для обработки ошибок
 */
export function errorHandler(error: unknown, req: any, res: any, next: any) {
  const errorResponse = handleApiError(error);
  
  console.error('API Error:', {
    method: req.method,
    url: req.url,
    error: errorResponse,
    stack: error instanceof Error ? error.stack : undefined
  });

  res.status(errorResponse.status).json({
    error: errorResponse.message,
    ...(errorResponse.details && { details: errorResponse.details })
  });
}

/**
 * Асинхронный обработчик ошибок для Express
 */
export function asyncHandler(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 