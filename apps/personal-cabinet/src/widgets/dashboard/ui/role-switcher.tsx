import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from '@/entities/user';
import { Button, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from '@/shared/ui';
import { useToast } from '@/shared/ui/use-toast';
import { Users, Shield, RefreshCw } from "lucide-react";

interface RoleSwitcherProps {
  user: User;
}

export function RoleSwitcher({ user }: RoleSwitcherProps) {
  const [selectedRole, setSelectedRole] = useState<string>(user.role || "candidate");
  const [department, setDepartment] = useState(user.department || "");
  const [rank, setRank] = useState(""); // Убираем user.rank, так как его нет в интерфейсе
  const [division, setDivision] = useState(user.division || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { role: string; department?: string; rank?: string; division?: string }) => {
      const response = await fetch("/api/user/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: Failed to update role`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Роль обновлена",
        description: "Ваша роль была успешно изменена",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить роль",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = () => {
    const updateData: any = { role: selectedRole };
    
    if (selectedRole === "staff") { // Изменяем "member" на "staff" для соответствия типам
      updateData.department = department || "LSPD";
      updateData.rank = rank || "Officer I";
      updateData.division = division || "Patrol Division";
    }
    
    updateRoleMutation.mutate(updateData);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "candidate":
        return { text: "Кандидат", icon: Users, color: "text-yellow-600" };
      case "staff":
        return { text: "Участник сообщества", icon: Shield, color: "text-green-600" };
      case "admin":
        return { text: "Администратор", icon: Shield, color: "text-red-600" };
      case "citizen":
        return { text: "Гражданский", icon: Users, color: "text-blue-600" };
      default:
        return { text: "Неизвестно", icon: Users, color: "text-gray-600" };
    }
  };

  const currentRoleDisplay = getRoleDisplay(user.role || "candidate");
  const CurrentRoleIcon = currentRoleDisplay.icon;

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <RefreshCw className="h-4 w-4" />
          <span>Переключение роли (Демо)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm">
          <CurrentRoleIcon className={`h-4 w-4 ${currentRoleDisplay.color}`} />
          <span className="text-gray-600">Текущая роль:</span>
          <span className={`font-medium ${currentRoleDisplay.color}`}>
            {currentRoleDisplay.text}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="role-select" className="text-sm font-medium">
              Выберите роль:
            </Label>
            <Select value={selectedRole} onValueChange={(value: string) => setSelectedRole(value)}>
              <SelectTrigger id="role-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidate">Кандидат</SelectItem>
                <SelectItem value="staff">Участник сообщества</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
                <SelectItem value="citizen">Гражданский</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === "staff" && (
            <div className="space-y-2">
              <div>
                <Label htmlFor="department" className="text-sm font-medium">
                  Департамент:
                </Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Выберите департамент" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LSPD">LSPD</SelectItem>
                    <SelectItem value="SAMS">SAMS</SelectItem>
                    <SelectItem value="FBI">FBI</SelectItem>
                    <SelectItem value="FIB">FIB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rank" className="text-sm font-medium">
                  Звание:
                </Label>
                <Input
                  id="rank"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder="Например: Officer II"
                />
              </div>
              
              <div>
                <Label htmlFor="division" className="text-sm font-medium">
                  Подразделение:
                </Label>
                <Input
                  id="division"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="Например: Patrol Division"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleRoleChange}
            disabled={updateRoleMutation.isPending}
            className="w-full"
          >
            {updateRoleMutation.isPending ? "Обновление..." : "Применить роль"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 