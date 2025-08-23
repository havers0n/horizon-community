import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Plus, Trash2, Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useToast } from '@/shared/ui/use-toast';
import { supabase } from '@/shared/lib/supabase';
import { type UserWithRoles } from '@/shared/api/user-management';

// Types for career management
interface Membership {
  id?: string;
  user_id: string;
  department_id: string;
  division_id?: string;
  rank_id?: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Department {
  id: string;
  name: string;
  full_name: string;
  logo_url?: string;
}

interface Division {
  id: string;
  name: string;
  department_id: string;
}

interface Rank {
  id: string;
  name: string;
  department_id: string;
  level: number;
}

interface ManageUserCareerModalProps {
  user: UserWithRoles;
  open: boolean;
  onClose: () => void;
}

export function ManageUserCareerModal({ user, open, onClose }: ManageUserCareerModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [divisionsData, setDivisionsData] = useState<Record<string, Division[]>>({});
  const [ranksData, setRanksData] = useState<Record<string, Rank[]>>({});

  // Reset state when modal opens
  useEffect(() => {
    if (open && user) {
      setMemberships([]);
      setIsLoading(true);
    }
  }, [open, user]);

  // Fetch user memberships
  const {
    data: userMemberships,
    isLoading: isLoadingMemberships,
    error: membershipsError,
  } = useQuery({
    queryKey: ['user-memberships', user.id],
    queryFn: async () => {
      console.log(`%c[ManageUserCareerModal] Fetching memberships for user: ${user.id}`, 'color: purple; font-weight: bold;');
      
      const { data, error } = await supabase.rpc('get_user_memberships', {
        p_user_id: user.id,
      });
      
      if (error) {
        console.error('Error fetching user memberships:', error);
        throw new Error(`Failed to fetch user memberships: ${error.message}`);
      }
      
      console.log('%c[ManageUserCareerModal] User memberships loaded:', 'color: green; font-weight: bold;', data);
      return data || [];
    },
    enabled: open && !!user.id,
  });

  // Fetch all departments for dropdown
  const {
    data: departments = [],
    isLoading: isLoadingDepartments,
  } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_departments');
      
      if (error) {
        console.error('Error fetching departments:', error);
        throw new Error(`Failed to fetch departments: ${error.message}`);
      }
      
      return data || [];
    },
    enabled: open,
  });

  // Helper function to fetch divisions for a department
  const fetchDivisions = async (departmentId: string) => {
    if (!departmentId || divisionsData[departmentId]) return;
    
    try {
      const { data, error } = await supabase.rpc('get_divisions_for_department', {
        p_department_id: departmentId,
      });
      
      if (error) {
        console.error('Error fetching divisions:', error);
        return;
      }
      
      setDivisionsData(prev => ({
        ...prev,
        [departmentId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  // Helper function to fetch ranks for a department
  const fetchRanks = async (departmentId: string) => {
    if (!departmentId || ranksData[departmentId]) return;
    
    try {
      const { data, error } = await supabase.rpc('get_ranks_for_department', {
        p_department_id: departmentId,
      });
      
      if (error) {
        console.error('Error fetching ranks:', error);
        return;
      }
      
      setRanksData(prev => ({
        ...prev,
        [departmentId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching ranks:', error);
    }
  };

  // Effect to fetch divisions and ranks when departments change in memberships
  useEffect(() => {
    if (!open) return;
    
    const uniqueDepartmentIds = [...new Set(
      memberships
        .map(m => m.department_id)
        .filter(id => id && id.trim() !== '')
    )];
    
    uniqueDepartmentIds.forEach(departmentId => {
      fetchDivisions(departmentId);
      fetchRanks(departmentId);
    });
  }, [memberships, open]);

  // Update local state when data loads
  useEffect(() => {
    if (userMemberships) {
      setMemberships(userMemberships);
      setIsLoading(false);
    }
  }, [userMemberships]);

  // Add new membership
  const addMembership = () => {
    const newMembership: Membership = {
      user_id: user.id,
      department_id: '',
      division_id: '',
      rank_id: '',
      is_primary: memberships.length === 0, // First membership is primary by default
    };
    
    setMemberships([...memberships, newMembership]);
  };

  // Remove membership
  const removeMembership = (index: number) => {
    const newMemberships = memberships.filter((_, i) => i !== index);
    
    // If we removed the primary membership, make the first remaining one primary
    if (newMemberships.length > 0 && !newMemberships.some(m => m.is_primary)) {
      newMemberships[0].is_primary = true;
    }
    
    setMemberships(newMemberships);
  };

  // Update membership field
  const updateMembership = (index: number, field: keyof Membership, value: any) => {
    const newMemberships = [...memberships];
    
    // If setting as primary, unset all others
    if (field === 'is_primary' && value) {
      newMemberships.forEach((m, i) => {
        m.is_primary = i === index;
      });
    } else {
      // If changing department, clear division and rank and fetch new data
      if (field === 'department_id') {
        newMemberships[index] = { 
          ...newMemberships[index], 
          [field]: value,
          division_id: '',
          rank_id: ''
        };
        
        // Fetch divisions and ranks for the new department
        if (value && value.trim() !== '') {
          fetchDivisions(value);
          fetchRanks(value);
        }
      } else {
        newMemberships[index] = { ...newMemberships[index], [field]: value };
      }
    }
    
    setMemberships(newMemberships);
  };

  // Handle save action
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validate that all memberships have required fields
      const invalidMemberships = memberships.filter(m => !m.department_id);
      if (invalidMemberships.length > 0) {
        toast({
          title: 'Ошибка валидации',
          description: 'Все места службы должны иметь выбранный департамент.',
          variant: 'destructive',
        });
        return;
      }
      
      // Ensure exactly one primary membership
      const primaryCount = memberships.filter(m => m.is_primary).length;
      if (primaryCount !== 1 && memberships.length > 0) {
        toast({
          title: 'Ошибка валидации',
          description: 'Должно быть выбрано ровно одно основное место службы.',
          variant: 'destructive',
        });
        return;
      }
      
      const originalMemberships = userMemberships || [];
      const currentMemberships = memberships;
      
      // Determine what operations to perform
      const toCreate = currentMemberships.filter(m => !m.id);
      const toUpdate = currentMemberships.filter(m => {
        const original = originalMemberships.find((om: any) => om.id === m.id);
        return m.id && original && (
          original.department_id !== m.department_id ||
          original.division_id !== m.division_id ||
          original.rank_id !== m.rank_id ||
          original.is_primary !== m.is_primary
        );
      });
      const toDelete = originalMemberships.filter((om: any) => 
        !currentMemberships.some(m => m.id === om.id)
      );
      
      console.log('Save operations:', { toCreate, toUpdate, toDelete });
      
      // Prepare promises for parallel execution
      const promises: Promise<any>[] = [];
      
      // Create new memberships
      toCreate.forEach(membership => {
        promises.push(
          (async () => {
            const { data, error } = await supabase.rpc('create_membership', {
              p_user_id: user.id,
              p_department_id: membership.department_id,
              p_division_id: membership.division_id || null,
              p_rank_id: membership.rank_id || null,
              p_is_primary: membership.is_primary
            });
            if (error) throw error;
            return data;
          })()
        );
      });
      
      // Update existing memberships
      toUpdate.forEach(membership => {
        promises.push(
          (async () => {
            const { data, error } = await supabase.rpc('update_membership', {
              p_membership_id: membership.id,
              p_department_id: membership.department_id,
              p_division_id: membership.division_id || null,
              p_rank_id: membership.rank_id || null,
              p_is_primary: membership.is_primary
            });
            if (error) throw error;
            return data;
          })()
        );
      });
      
      // Delete removed memberships
      toDelete.forEach((membership: any) => {
        promises.push(
          (async () => {
            const { data, error } = await supabase.rpc('delete_membership', {
              p_membership_id: membership.id
            });
            if (error) throw error;
            return data;
          })()
        );
      });
      
      // Execute all operations in parallel
      const results = await Promise.all(promises);
      
      console.log('Save operation results:', results);
      
      toast({
        title: 'Карьера обновлена',
        description: `Карьера пользователя ${user.username} успешно обновлена.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-memberships', user.id] });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      
      onClose();
    } catch (error) {
      console.error('Error saving career:', error);
      toast({
        title: 'Ошибка сохранения',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Loading state
  if (isLoadingMemberships && open) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Управление карьерой для: {user.username}
            </DialogTitle>
            <DialogDescription>
              Назначайте департаменты, подразделения и ранги пользователю.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (membershipsError) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Управление карьерой для: {user.username}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8 text-destructive">
            Ошибка загрузки данных: {membershipsError instanceof Error ? membershipsError.message : 'Неизвестная ошибка'}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Управление карьерой для: {user.username}
          </DialogTitle>
          <DialogDescription>
            Назначайте департаменты, подразделения и ранги пользователю.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {memberships.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">У пользователя нет назначенных департаментов</p>
                    <p className="text-sm mt-2">Нажмите кнопку ниже, чтобы добавить место службы.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              memberships.map((membership, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Место службы {index + 1}
                        {membership.is_primary && (
                          <Badge variant="default" className="ml-2">
                            Основное
                          </Badge>
                        )}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMembership(index)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Удалить место службы"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Department Selection */}
                    <div className="space-y-2">
                      <Label>Департамент</Label>
                      <Select
                        value={membership.department_id}
                        onValueChange={(value) => updateMembership(index, 'department_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите департамент" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept: Department) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.full_name || dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Division Selection */}
                    <div className="space-y-2">
                      <Label>Подразделение</Label>
                      <Select
                        value={membership.division_id || ''}
                        onValueChange={(value) => updateMembership(index, 'division_id', value)}
                        disabled={!membership.department_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите подразделение" />
                        </SelectTrigger>
                        <SelectContent>
                          {!membership.department_id ? (
                            <SelectItem value="no-department" disabled>Сначала выберите департамент</SelectItem>
                          ) : !divisionsData[membership.department_id] ? (
                            <SelectItem value="loading-divisions" disabled>Загрузка подразделений...</SelectItem>
                          ) : divisionsData[membership.department_id].length === 0 ? (
                            <SelectItem value="no-divisions" disabled>Нет доступных подразделений</SelectItem>
                          ) : (
                            divisionsData[membership.department_id].map((division: Division) => (
                              <SelectItem key={division.id} value={division.id}>
                                {division.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rank Selection */}
                    <div className="space-y-2">
                      <Label>Ранг</Label>
                      <Select
                        value={membership.rank_id || ''}
                        onValueChange={(value) => updateMembership(index, 'rank_id', value)}
                        disabled={!membership.department_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите ранг" />
                        </SelectTrigger>
                        <SelectContent>
                          {!membership.department_id ? (
                            <SelectItem value="no-department" disabled>Сначала выберите департамент</SelectItem>
                          ) : !ranksData[membership.department_id] ? (
                            <SelectItem value="loading-ranks" disabled>Загрузка рангов...</SelectItem>
                          ) : ranksData[membership.department_id].length === 0 ? (
                            <SelectItem value="no-ranks" disabled>Нет доступных рангов</SelectItem>
                          ) : (
                            ranksData[membership.department_id].map((rank: Rank) => (
                              <SelectItem key={rank.id} value={rank.id}>
                                {rank.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Primary Switch */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`primary-${index}`}
                        checked={membership.is_primary}
                        onCheckedChange={(checked) => updateMembership(index, 'is_primary', checked)}
                      />
                      <Label htmlFor={`primary-${index}`}>Основное место службы</Label>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Add new membership button */}
            {memberships.length < 2 && (
              <Button
                variant="outline"
                onClick={addMembership}
                className="w-full"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                {memberships.length === 0 ? 'Добавить место службы' : 'Добавить совмещение'}
              </Button>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}