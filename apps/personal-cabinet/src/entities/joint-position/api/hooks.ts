import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinetApi } from '@/shared/api/cabinet-service';
import type { 
  JointPositionRequest, 
  AvailableDepartment, 
  CreateJointPositionRequestDto 
} from '@/shared/api/cabinet-service';
import { useToast } from '@/shared/ui/use-toast';

// Ключи для кэширования
const JOINT_POSITION_KEYS = {
  availableDepartments: ['available-joint-departments'] as const,
  myRequests: ['my-joint-position-requests'] as const,
} as const;

/**
 * Хук для получения списка доступных департаментов для совмещения
 */
export const useAvailableJointDepartments = () => {
  return useQuery<AvailableDepartment[]>({
    queryKey: JOINT_POSITION_KEYS.availableDepartments,
    queryFn: cabinetApi.getAvailableJointDepartments,
    staleTime: 5 * 60 * 1000, // 5 минут - данные не запрашиваются слишком часто
    gcTime: 10 * 60 * 1000, // 10 минут в кэше
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Хук для получения истории заявок на совмещение текущего пользователя
 */
export const useMyJointPositionRequests = () => {
  return useQuery<JointPositionRequest[]>({
    queryKey: JOINT_POSITION_KEYS.myRequests,
    queryFn: cabinetApi.getMyJointPositionRequests,
    staleTime: 1 * 60 * 1000, // 1 минута
    gcTime: 5 * 60 * 1000, // 5 минут в кэше
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Хук для создания новой заявки на совмещение должности
 */
export const useCreateJointPositionRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<JointPositionRequest, Error, CreateJointPositionRequestDto>({
    mutationFn: cabinetApi.createJointPositionRequest,
    onSuccess: (data) => {
      // Инвалидируем кэш заявок пользователя для обновления списка
      queryClient.invalidateQueries({
        queryKey: JOINT_POSITION_KEYS.myRequests,
      });

      toast({
        title: 'Заявка отправлена',
        description: 'Ваша заявка на совмещение должности успешно отправлена и будет рассмотрена администрацией.',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Ошибка при создании заявки на совмещение:', error);
      
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку на совмещение. Попробуйте позже.',
        variant: 'destructive',
      });
    },
  });
};

export { JOINT_POSITION_KEYS };