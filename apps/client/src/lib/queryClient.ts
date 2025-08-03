import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  adaptBackendUsersToFrontend, 
  adaptBackendApplicationsToFrontend, 
  adaptBackendNotificationsToFrontend,
  type FrontendUser,
  type FrontendApplication,
  type FrontendNotification
} from "@/lib/adapters";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {};
    
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    
    // Применяем адаптеры для совместимости типов
    const url = queryKey[0] as string;
    
    if (url.includes('/api/admin/users') || url.includes('/api/auth/me')) {
      return adaptBackendUsersToFrontend(data.users || data) as T;
    }
    
    if (url.includes('/api/applications') || url.includes('/api/admin/applications') || url.includes('/api/admin/leave-applications')) {
      return adaptBackendApplicationsToFrontend(data) as T;
    }
    
    if (url.includes('/api/notifications')) {
      return adaptBackendNotificationsToFrontend(data) as T;
    }
    
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
