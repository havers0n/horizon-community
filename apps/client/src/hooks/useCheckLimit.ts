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
      
      try {
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
      } catch (error) {
        console.log(`❌ Ошибка запроса:`, error);
        // Если есть ошибка, разрешаем подачу заявки
        return { restriction: { allowed: true, reason: null } };
      }
    },
    enabled: !!type && !!user,
    staleTime: 30000, // Данные считаются свежими 30 секунд
    gcTime: 60000, // Кэш хранится 1 минуту
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1 // Пробуем только 1 раз
  });

  let isLimitReached = false;
  let reason: string | undefined = undefined;

  if (isError) {
    // При ошибке разрешаем подачу заявки
    isLimitReached = false;
    reason = undefined;
    console.log(`❌ Ошибка проверки лимитов, разрешаем подачу заявки:`, (error as Error).message);
  } else if (data && data.restriction && data.restriction.allowed === false) {
    isLimitReached = true;
    reason = data.restriction.reason;
    console.log(`🚫 Лимит исчерпан:`, reason);
  } else {
    isLimitReached = false;
    reason = undefined;
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
