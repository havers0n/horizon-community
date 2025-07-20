import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Shield, Flame, Ambulance, Star, Building, Headphones, Users } from "lucide-react";

interface Department {
  id: number;
  name: string;
  fullName: string;
  description: string;
  logoUrl?: string;
  gallery?: string[];
}

export default function Departments() {
  const { t } = useTranslation();
  
  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments']
  });

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
      case 'pd':
        return 'department-card-pd department-card-animate';
      case 'sahp':
        return 'department-card-sahp department-card-animate';
      case 'sams':
        return 'department-card-sams department-card-animate';
      case 'safr':
        return 'department-card-safr department-card-animate';
      case 'dd':
        return 'department-card-dd department-card-animate';
      case 'cd':
        return 'department-card-cd department-card-animate';
      default:
        return 'card-hover card-gold department-card-animate';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
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
          {departments?.map((department: Department) => {
            const style = getDepartmentStyle(department.name);
            return (
              <Card 
                key={department.id} 
                className={`card-hover cursor-pointer transition-all duration-300 border-2 ${style} hover:scale-105`}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {department.logoUrl ? (
                      <img 
                        src={department.logoUrl} 
                        alt={department.name}
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      getDepartmentIcon(department.name)
                    )}
                  </div>
                  <CardTitle className="text-xl text-foreground">{department.name}</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground">
                    {department.fullName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {department.description}
                  </p>
                  
                  {department.gallery && department.gallery.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">Галерея</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {department.gallery.slice(0, 3).map((image: string, index: number) => (
                          <img 
                            key={index}
                            src={image} 
                            alt={`${department.name} gallery ${index + 1}`}
                            className="h-16 w-full object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {(!departments || departments.length === 0) && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Департаменты недоступны</h3>
            <p className="text-muted-foreground">Департаменты будут отображаться здесь после их создания.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
