import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // В production можно отправить ошибку в систему мониторинга
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToMonitoring(error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="w-full max-w-md bg-slate-800 rounded-lg border border-red-500/20 p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50 border border-red-500/30">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Что-то пошло не так
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Произошла непредвиденная ошибка. Попробуйте обновить страницу или обратитесь к администратору.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-300 mb-2">
                    Детали ошибки (только для разработки)
                  </summary>
                  <div className="bg-gray-900 p-3 rounded text-xs font-mono text-gray-400 overflow-auto border border-gray-700">
                    <div className="mb-2">
                      <strong>Ошибка:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={this.handleRetry} 
                  className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  Попробовать снова
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded border border-blue-500 hover:border-blue-400 transition-colors"
                >
                  Обновить страницу
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC для оборачивания компонентов в Error Boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Компонент для отображения ошибок в отдельных частях приложения
export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="border border-red-500/20 bg-red-900/10 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-2">
        <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-sm font-medium text-red-400">
          Ошибка загрузки компонента
        </h3>
      </div>
      <p className="text-sm text-red-300 mb-3">
        {error.message}
      </p>
      <button 
        onClick={resetErrorBoundary} 
        className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded border border-slate-600 hover:border-slate-500 transition-colors"
      >
        Попробовать снова
      </button>
    </div>
  );
} 