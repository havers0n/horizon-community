import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinetApi, type LeaveRequest, type CreateLeaveRequestDto } from '../../../shared/api/cabinet-service';
import { toast } from '../../../shared/ui/use-toast';

// Ключи запросов
export const LEAVE_QUERY_KEYS = {
  myLeaves: ['my-leaves'] as const,
};

/**
 * Хук для получения всех заявок на отпуск текущего пользователя
 */
export const useMyLeaves = () => {
  return useQuery({
    queryKey: LEAVE_QUERY_KEYS.myLeaves,
    queryFn: cabinetApi.getMyLeaves,
    staleTime: 5 * 60 * 1000, // 5 минут
    refetchOnWindowFocus: false,
  });
};

/**
 * Хук для создания новой заявки на отпуск
 */
export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cabinetApi.createLeaveRequest,
    onSuccess: (data: LeaveRequest) => {
      // Инвалидируем кеш для обновления списка заявок
      queryClient.invalidateQueries({ 
        queryKey: LEAVE_QUERY_KEYS.myLeaves 
      });
      
      // Показываем уведомление об успехе
      toast({
        title: 'Заявка отправлена',
        description: 'Ваша заявка на отпуск успешно подана и отправлена на рассмотрение.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      // Показываем уведомление об ошибке
      const errorMessage = error?.message || error?.error || 'Произошла ошибка при подаче заявки';
      
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Хук для получения количества заявок (для статистики)
 */
export const useLeavesStats = () => {
  const { data: leaves = [] } = useMyLeaves();
  
  const stats = {
    total: leaves.length,
    pending: leaves.filter(leave => leave.status_code === 'in_review').length,
    approved: leaves.filter(leave => leave.status_code === 'approved').length,
    rejected: leaves.filter(leave => leave.status_code === 'rejected').length,
  };

  return stats;
};