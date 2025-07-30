import * as React from "react"

interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface UseToastReturn {
  toast: (props: ToastProps) => void
  dismiss: (toastId?: string) => void
  toasts: Toast[]
}

function useToast(): UseToastReturn {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, ...props }
    
    // Для отладки показываем в консоли
    console.log(`[TOAST] ${props.title}: ${props.description}`)
    
    setToasts(prev => [newToast, ...prev])
    
    // Автоматически удаляем через 5 секунд
    setTimeout(() => {
      dismiss(id)
    }, 5000)
  }, [])

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      setToasts(prev => prev.filter(t => t.id !== toastId))
    } else {
      setToasts([])
    }
  }, [])

  return {
    toast,
    dismiss,
    toasts
  }
}

export { useToast } 