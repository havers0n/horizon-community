/**
 * Централизованная система обработки ошибок
 * Обеспечивает единообразную обработку ошибок по всему приложению
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION', 
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  details?: string
  code?: string | number
  originalError?: unknown
}

export interface ErrorHandlingOptions {
  showToast?: boolean
  logError?: boolean
  fallbackMessage?: string
}

/**
 * Создает типизированную ошибку приложения
 */
export function createAppError(
  type: ErrorType,
  message: string,
  details?: string,
  originalError?: unknown
): AppError {
  return {
    type,
    message,
    details,
    originalError
  }
}

/**
 * Парсит ошибку API и возвращает типизированную ошибку
 */
export function parseApiError(error: unknown): AppError {
  // Axios error
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any
    const status = axiosError.response?.status
    const data = axiosError.response?.data
    
    switch (status) {
      case 400:
        return createAppError(
          ErrorType.VALIDATION,
          data?.message || 'Некорректные данные',
          data?.details,
          error
        )
      case 401:
        return createAppError(
          ErrorType.AUTHENTICATION,
          'Необходимо войти в систему',
          undefined,
          error
        )
      case 403:
        return createAppError(
          ErrorType.AUTHORIZATION,
          'Недостаточно прав доступа',
          undefined,
          error
        )
      case 404:
        return createAppError(
          ErrorType.NOT_FOUND,
          'Ресурс не найден',
          undefined,
          error
        )
      case 500:
      case 502:
      case 503:
        return createAppError(
          ErrorType.SERVER,
          'Ошибка сервера. Попробуйте позже',
          undefined,
          error
        )
    }
  }

  // Network error
  if (error && typeof error === 'object' && 'code' in error) {
    const networkError = error as any
    if (networkError.code === 'NETWORK_ERROR') {
      return createAppError(
        ErrorType.NETWORK,
        'Ошибка сети. Проверьте подключение',
        undefined,
        error
      )
    }
  }

  // Generic error
  if (error instanceof Error) {
    return createAppError(
      ErrorType.UNKNOWN,
      error.message,
      undefined,
      error
    )
  }

  // Unknown error
  return createAppError(
    ErrorType.UNKNOWN,
    'Произошла неизвестная ошибка',
    undefined,
    error
  )
}

/**
 * Обрабатывает ошибку согласно настройкам
 */
export function handleError(
  error: unknown, 
  options: ErrorHandlingOptions = {}
): AppError {
  const appError = parseApiError(error)
  
  const {
    showToast = true,
    logError = true,
    fallbackMessage
  } = options
  
  if (logError) {
    console.error('[ErrorHandler]', {
      type: appError.type,
      message: appError.message,
      details: appError.details,
      originalError: appError.originalError
    })
  }
  
  if (showToast) {
    // Импортируем toast динамически чтобы избежать циклических зависимостей
    import('@/shared/ui/use-toast').then(({ toast }) => {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: fallbackMessage || appError.message,
      })
    })
  }
  
  return appError
}

/**
 * Хук для удобной обработки ошибок в компонентах
 */
export function useErrorHandler() {
  return (error: unknown, options?: ErrorHandlingOptions) => {
    return handleError(error, options)
  }
}

/**
 * Декоратор для автоматической обработки ошибок в async функциях
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: ErrorHandlingOptions
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error, options)
      throw error
    }
  }) as T
}