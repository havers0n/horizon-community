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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })

  return throwIfResNotOk(response)
}

type QueryFunction<T> = ({ queryKey }: { queryKey: string[] }) => Promise<T>

type UnauthorizedBehavior = "returnNull" | "throw"

export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior
}): QueryFunction<T> => {
  return async ({ queryKey }) => {
    const [_, url] = queryKey
    const res = await fetch(url as string, {
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