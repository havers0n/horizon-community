import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }
  return res
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem('authToken')
  
  // Если URL не начинается с http, добавляем базовый URL
  let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  
  // Если VITE_API_URL не содержит /api, добавляем его
  if (baseUrl && !baseUrl.includes('/api')) {
    baseUrl = `${baseUrl}/api`
  }
  
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  
  // Отладочная информация для диагностики
  console.log('🔍 URL Debug:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    baseUrl,
    originalUrl: url,
    fullUrl
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  console.log(`🌐 API Request: ${method} ${fullUrl}`, { 
    originalUrl: url,
    baseUrl,
    fullUrl,
    data, 
    headers 
  })

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })

  console.log(`📡 API Response: ${response.status} ${response.statusText}`)
  
  // Добавляем больше информации об ошибках
  if (!response.ok) {
    const errorText = await response.text()
    console.error(`❌ API Error: ${response.status} ${response.statusText}`, errorText)
  }

  return throwIfResNotOk(response)
}

type QueryFunction<T> = ({ queryKey }: { queryKey: string[] }) => Promise<T>

type UnauthorizedBehavior = "returnNull" | "throw"

export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior
}): QueryFunction<T> => {
  return async ({ queryKey }) => {
    const [_, url] = queryKey
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    
    // Если VITE_API_URL не содержит /api, добавляем его
    if (baseUrl && !baseUrl.includes('/api')) {
      baseUrl = `${baseUrl}/api`
    }
    
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
    
    const res = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    if (res.status === 401) {
      if (options.on401 === "returnNull") return null as T
      throw new Error("Unauthorized")
    }
    return res.json()
  }
} 