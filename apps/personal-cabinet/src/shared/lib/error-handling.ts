/**
 * Centralized error handling system
 * Ensures consistent error handling across the application
 * Following project specifications for error standardization
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
 * Creates a typed application error
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
 * Parses API error and returns typed error
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
          data?.message || 'Invalid data provided',
          data?.details,
          error
        )
      case 401:
        return createAppError(
          ErrorType.AUTHENTICATION,
          'Authentication required',
          undefined,
          error
        )
      case 403:
        return createAppError(
          ErrorType.AUTHORIZATION,
          'Insufficient permissions',
          undefined,
          error
        )
      case 404:
        return createAppError(
          ErrorType.NOT_FOUND,
          'Resource not found',
          undefined,
          error
        )
      case 500:
      case 502:
      case 503:
        return createAppError(
          ErrorType.SERVER,
          'Server error. Please try again later',
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
        'Network error. Check your connection',
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
    'An unknown error occurred',
    undefined,
    error
  )
}

/**
 * Handles error according to options
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
    // Import toast dynamically to avoid circular dependencies
    import('@/shared/ui/use-toast').then(({ toast }) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: fallbackMessage || appError.message,
      })
    })
  }
  
  return appError
}

/**
 * Hook for convenient error handling in components
 */
export function useErrorHandler() {
  return (error: unknown, options?: ErrorHandlingOptions) => {
    return handleError(error, options)
  }
}

/**
 * Decorator for automatic error handling in async functions
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