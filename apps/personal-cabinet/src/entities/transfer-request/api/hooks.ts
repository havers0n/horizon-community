import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinetApi } from '@/shared/api/cabinet-service';
import type { 
  TransferRequest, 
  AvailableTransferDepartment, 
  CreateTransferRequestDto 
} from '@/shared/api/cabinet-service';
import { useToast } from '@/shared/ui/use-toast';

// Ключи для кэширования
const TRANSFER_REQUEST_KEYS = {
  availableDepartments: ['available-transfer-departments'] as const,
  myRequests: ['my-transfer-requests'] as const,
} as const;

/**
 * Хук для получения списка доступных департаментов для перевода
 */
export const useAvailableTransferDepartments = () => {
  return useQuery<AvailableTransferDepartment[]>({
    queryKey: TRANSFER_REQUEST_KEYS.availableDepartments,
    queryFn: cabinetApi.getAvailableTransferDepartments,
    staleTime: 5 * 60 * 1000, // 5 минут - данные не запрашиваются слишком часто
    gcTime: 10 * 60 * 1000, // 10 минут в кэше
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Хук для получения истории заявок на перевод текущего пользователя
 */
export const useMyTransferRequests = () => {
  return useQuery<TransferRequest[]>({
    queryKey: TRANSFER_REQUEST_KEYS.myRequests,
    queryFn: cabinetApi.getMyTransferRequests,
    staleTime: 1 * 60 * 1000, // 1 минута
    gcTime: 5 * 60 * 1000, // 5 минут в кэше
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Хук для создания новой заявки на перевод в другой департамент
 */
export const useCreateTransferRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TransferRequest, Error, CreateTransferRequestDto>({
    mutationFn: cabinetApi.createTransferRequest,
    onSuccess: (data) => {
      // Инвалидируем кэш заявок пользователя для обновления списка
      queryClient.invalidateQueries({
        queryKey: TRANSFER_REQUEST_KEYS.myRequests,
      });

      toast({
        title: 'Заявка отправлена',
        description: 'Ваша заявка на перевод в другой департамент успешно отправлена и будет рассмотрена администрацией.',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Ошибка при создании заявки на перевод:', error);
      
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку на перевод. Попробуйте позже.',
        variant: 'destructive',
      });
    },
  });
};

export { TRANSFER_REQUEST_KEYS };