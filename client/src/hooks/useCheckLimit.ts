import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";

interface CheckLimitResult {
  isLimitReached: boolean;
  isLoading: boolean;
  reason?: string;
  refetch: () => void;
}

export function useCheckLimit(type: string): CheckLimitResult {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/application-limits", type],
    queryFn: async () => {
      console.log(`🔍 Проверка лимитов для типа: ${type}`);
      console.log(`🔍 Пользователь:`, user);
      
      // Получаем токен из localStorage
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken') || localStorage.getItem('mockToken');
      console.log(`🔍 Токен:`, token ? 'Найден' : 'Не найден');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/application-limits/${encodeURIComponent(type)}`, {
        credentials: "include",
        headers
      });
      
      console.log(`🔍 Статус ответа:`, res.status);
      
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.log(`❌ Ошибка API:`, json);
        throw new Error(json.message || res.statusText);
      }
      
      const result = await res.json();
      console.log(`📊 Результат проверки лимитов:`, result);
      return result;
    },
    enabled: !!type && !!user,
    staleTime: 1000, // Данные считаются свежими 1 секунду
    gcTime: 5000, // Кэш хранится 5 секунд
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5000 // Обновляем каждые 5 секунд
  });

  let isLimitReached = false;
  let reason: string | undefined = undefined;

  if (isError) {
    isLimitReached = true;
    reason = (error as Error).message;
    console.log(`❌ Ошибка проверки лимитов:`, reason);
  } else if (data && data.restriction && data.restriction.allowed === false) {
    isLimitReached = true;
    reason = data.restriction.reason;
    console.log(`🚫 Лимит исчерпан:`, reason);
  } else {
    console.log(`✅ Лимит доступен:`, data?.restriction);
  }

  // Функция для принудительного обновления
  const forceRefetch = () => {
    console.log('🔄 Принудительное обновление лимитов...');
    queryClient.invalidateQueries({ queryKey: ["/api/application-limits", type] });
    refetch();
  };

  return { isLimitReached, isLoading, reason, refetch: forceRefetch };
}
