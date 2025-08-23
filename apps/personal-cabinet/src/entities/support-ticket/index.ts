import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinetApi, type CreateSupportTicketDto } from '@/shared/api/cabinet-service';
import { toast } from 'sonner';

/**
 * React Query mutation hook for creating support tickets
 * Following the React Query integration pattern from project specifications
 */
export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSupportTicketDto) => {
      return await cabinetApi.createSupportTicket(data);
    },
    onSuccess: () => {
      // Show success toast
      toast.success('Ваш тикет успешно создан!');
      
      // Invalidate support tickets queries if they exist in the future
      queryClient.invalidateQueries({ 
        queryKey: ['support-tickets'] 
      });
    },
    onError: (error: any) => {
      // Show error toast
      const errorMessage = error?.response?.data?.error || error?.message || 'Произошла ошибка при создании тикета';
      toast.error(errorMessage);
    },
    // Configure appropriate staleTime for caching as per project specifications
    meta: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  });
};