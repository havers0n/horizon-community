import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Users } from "lucide-react";
import { EntryApplicationModal } from "@/components/EntryApplicationModal";
import { useAuth } from "@/contexts/AuthContext";

export default function EntryApplication() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();

  // Получаем ID департамента из URL
  const getDepartmentIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/apply\/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  };

  // Получаем данные департаментов
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['/api/departments']
  });

  // Устанавливаем выбранный департамент при загрузке
  useEffect(() => {
    const departmentId = getDepartmentIdFromUrl();
    if (departmentId) {
      setSelectedDepartmentId(departmentId);
    }
  }, []);

  // Находим выбранный департамент
  const selectedDepartment = departments.find(dept => dept.id === selectedDepartmentId);

  const handleBack = () => {
    if (selectedDepartmentId) {
      setLocation(`/departments/${selectedDepartmentId}`);
    } else {
      setLocation('/departments');
    }
  };

  const handleApply = () => {
    if (!user) {
      // Если пользователь не авторизован, перенаправляем на регистрацию
      setLocation('/register');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Подача заявки на вступление</h1>
            <p className="text-muted-foreground">
              {selectedDepartment 
                ? `Подача заявки в департамент ${selectedDepartment.name}`
                : 'Выберите департамент для подачи заявки'
              }
            </p>
          </div>
        </div>

        {/* Department Selection */}
        {!selectedDepartmentId && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Выберите департамент
                </CardTitle>
                <CardDescription>
                  Выберите департамент, в который хотите подать заявку на вступление
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <Card 
                      key={dept.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedDepartmentId(dept.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                          <Building className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold mb-1">{dept.name}</h3>
                        <p className="text-sm text-muted-foreground">{dept.fullName}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Application Form */}
        {selectedDepartment && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Заявка в {selectedDepartment.name}
                </CardTitle>
                <CardDescription>
                  {selectedDepartment.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Информация о департаменте</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedDepartment.description}
                  </p>
                  <div className="text-sm">
                    <p><strong>Название:</strong> {selectedDepartment.fullName}</p>
                    <p><strong>Сокращение:</strong> {selectedDepartment.name}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Требования к кандидатам:</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Исправный микрофон для голосового общения</li>
                    <li>• Соответствие системным требованиям FiveM</li>
                    <li>• Готовность к обучению и развитию</li>
                    <li>• Уважительное отношение к другим участникам</li>
                    <li>• Соблюдение правил сообщества</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleApply}
                    size="lg" 
                    className="w-full gap-2"
                  >
                    <Users className="h-4 w-4" />
                    {user ? 'Подать заявку' : 'Зарегистрироваться и подать заявку'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Application Modal */}
        {selectedDepartmentId && (
          <EntryApplicationModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        )}
      </div>
    </div>
  );
} 