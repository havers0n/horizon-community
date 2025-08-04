/**
 * Класс для обработки ошибок приложения
 * Соответствует архитектурным стандартам проекта
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Сохраняем стек вызовов
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Создание ошибки "Не найдено"
   */
  static notFound(message: string = 'Ресурс не найден'): AppError {
    return new AppError(message, 404);
  }

  /**
   * Создание ошибки "Доступ запрещен"
   */
  static forbidden(message: string = 'Доступ запрещен'): AppError {
    return new AppError(message, 403);
  }

  /**
   * Создание ошибки "Неавторизован"
   */
  static unauthorized(message: string = 'Неавторизован'): AppError {
    return new AppError(message, 401);
  }

  /**
   * Создание ошибки "Конфликт"
   */
  static conflict(message: string = 'Конфликт данных'): AppError {
    return new AppError(message, 409);
  }

  /**
   * Создание ошибки "Некорректные данные"
   */
  static badRequest(message: string = 'Некорректные данные'): AppError {
    return new AppError(message, 400);
  }

  /**
   * Создание внутренней ошибки сервера
   */
  static internal(message: string = 'Внутренняя ошибка сервера'): AppError {
    return new AppError(message, 500);
  }
} 