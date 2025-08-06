import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinetApi, type UpdateProfileData, type UpdateSettingsData } from '../api/cabinet-service';
import { toast } from 'sonner';

export const useCabinet = () => {
  const queryClient = useQueryClient();

  // Профиль
  const profileQuery = useQuery({
    queryKey: ['cabinet', 'profile'],
    queryFn: async () => {
      const response = await cabinetApi.getProfile();
      return response.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await cabinetApi.updateProfile(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabinet', 'profile'] });
      toast.success('Профиль успешно обновлен');
    },
    onError: (error) => {
      toast.error('Ошибка при обновлении профиля');
      console.error('Update profile error:', error);
    },
  });

  // Заявки
  const applicationsQuery = useQuery({
    queryKey: ['cabinet', 'applications'],
    queryFn: async () => {
      const response = await cabinetApi.getApplications();
      return response.data;
    },
  });

  // Департаменты
  const departmentsQuery = useQuery({
    queryKey: ['cabinet', 'departments'],
    queryFn: async () => {
      const response = await cabinetApi.getDepartments();
      return response.data;
    },
  });

  // Настройки
  const settingsQuery = useQuery({
    queryKey: ['cabinet', 'settings'],
    queryFn: async () => {
      const response = await cabinetApi.getSettings();
      return response.data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: UpdateSettingsData) => {
      const response = await cabinetApi.updateSettings(settings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cabinet', 'settings'] });
      toast.success('Настройки успешно обновлены');
    },
    onError: (error) => {
      toast.error('Ошибка при обновлении настроек');
      console.error('Update settings error:', error);
    },
  });

  // Статистика
  const statsQuery = useQuery({
    queryKey: ['cabinet', 'stats'],
    queryFn: async () => {
      const response = await cabinetApi.getStats();
      return response.data;
    },
  });

  return {
    // Профиль
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    updateProfile: updateProfileMutation.mutate,
    updateProfileLoading: updateProfileMutation.isPending,

    // Заявки
    applications: applicationsQuery.data,
    applicationsLoading: applicationsQuery.isLoading,
    applicationsError: applicationsQuery.error,

    // Департаменты
    departments: departmentsQuery.data,
    departmentsLoading: departmentsQuery.isLoading,
    departmentsError: departmentsQuery.error,

    // Настройки
    settings: settingsQuery.data,
    settingsLoading: settingsQuery.isLoading,
    settingsError: settingsQuery.error,
    updateSettings: updateSettingsMutation.mutate,
    updateSettingsLoading: updateSettingsMutation.isPending,

    // Статистика
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    statsError: statsQuery.error,
  };
}; 