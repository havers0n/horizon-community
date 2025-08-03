import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Flame, Ambulance, Star, Building, Headphones, Users } from "lucide-react";
import DepartmentDetails from "@/components/DepartmentDetails";
import { DepartmentDetails as DepartmentDetailsType, getDepartmentByName } from "@/data/departments";
import { useDepartments } from "@/hooks/useDepartments";
import { Department } from "@/services/departmentsService";

interface DepartmentDisplay {
  id: string;
  name: string;
  fullName: string;
  description: string;
  logoUrl?: string;
  gallery?: string[];
}

export default function Departments() {
  const { t } = useTranslation();
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentDetailsType | null>(null);
  
  const { departments, loading, error, refetch } = useDepartments();

  const handleDepartmentClick = async (department: Department) => {
    try {
      // Пытаемся найти расширенные данные для департамента
      const detailedDepartment = await getDepartmentByName(department.name);
      if (detailedDepartment) {
        setSelectedDepartment(detailedDepartment);
      } else {
        // Если расширенных данных нет, создаем базовый объект
        setSelectedDepartment({
          id: department.id,
          name: department.name,
          fullName: department.full_name,
          description: department.description || '',
          logoUrl: department.logo_url,
          gallery: department.gallery || []
        });
      }
    } catch (error) {
      console.error('[handleDepartmentClick] Ошибка при получении деталей департамента:', error);
      // В случае ошибки создаем базовый объект
      setSelectedDepartment({
        id: department.id,
        name: department.name,
        fullName: department.full_name,
        description: department.description || '',
        logoUrl: department.logo_url,
        gallery: department.gallery || []
      });
    }
  };

  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
  };

  const getDepartmentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'pd': return <Shield className="h-16 w-16 text-blue-600" />;
      case 'sahp': return <Shield className="h-16 w-16 text-yellow-600" />;
      case 'sams': return <Ambulance className="h-16 w-16 text-green-600" />;
      case 'safr': return <Flame className="h-16 w-16 text-red-600" />;
      case 'dd': return <Headphones className="h-16 w-16 text-purple-600" />;
      case 'cd': return <Users className="h-16 w-16 text-gray-600" />;
      default: return <Building className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const getDepartmentStyle = (name: string) => {
    switch (name.toLowerCase()) {
      case 'pd': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'sahp': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'sams': return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      case 'safr': return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'dd': return 'border-purple-500 bg-purple-50 dark:bg-purple-950/20';
      case 'cd': return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20';
      default: return 'border-muted-foreground bg-muted/20';
    }
  };

  // Если выбран конкретный департамент, показываем его детали
  if (selectedDepartment) {
    return (
      <Layout>
        <DepartmentDetails 
          department={selectedDepartment} 
          onBack={handleBackToDepartments} 
        />
      </Layout>
    );
  }

  // Показываем состояние загрузки
  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Департаменты</h1>
            <p className="text-muted-foreground">Изучите все доступные департаменты и их информацию.</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Загрузка департаментов...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Департаменты</h1>
            <p className="text-muted-foreground">Изучите все доступные департаменты и их информацию.</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Shield className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ошибка загрузки</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button 
                onClick={refetch}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Показываем пустое состояние, если нет департаментов
  if (!departments || departments.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Департаменты</h1>
            <p className="text-muted-foreground">Изучите все доступные департаменты и их информацию.</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-muted-foreground mb-4">
                <Building className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Департаменты недоступны</h3>
              <p className="text-muted-foreground">Департаменты будут отображаться здесь после их создания.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Департаменты</h1>
          <p className="text-muted-foreground">Изучите все доступные департаменты и их информацию.</p>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department: Department) => {
            const style = getDepartmentStyle(department.name);
            return (
              <Card 
                key={department.id} 
                className={`card-hover cursor-pointer transition-all duration-300 border-2 ${style} hover:scale-105`}
                onClick={() => handleDepartmentClick(department)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {department.logo_url ? (
                      <img 
                        src={department.logo_url} 
                        alt={department.name}
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      getDepartmentIcon(department.name)
                    )}
                  </div>
                  <CardTitle className="text-xl text-foreground">{department.name}</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground">
                    {department.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {department.description || 'Описание недоступно'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
