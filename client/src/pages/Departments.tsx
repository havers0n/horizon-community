import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Shield, Flame, Ambulance, Star, Building } from "lucide-react";

export default function Departments() {
  const { t } = useTranslation();
  
  const { data: departments, isLoading } = useQuery({
    queryKey: ['/api/departments']
  });

  const getDepartmentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'lspd': return <Shield className="h-16 w-16 text-blue-600" />;
      case 'lsfd': return <Flame className="h-16 w-16 text-red-600" />;
      case 'ems': return <Ambulance className="h-16 w-16 text-green-600" />;
      case 'bcso': return <Star className="h-16 w-16 text-yellow-600" />;
      default: return <Building className="h-16 w-16 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('departments.title', 'Departments')}</h1>
          <p className="text-gray-600">{t('departments.subtitle', 'Explore all available departments and their information.')}</p>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments?.map((department: any) => (
            <Card key={department.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                <CardTitle className="text-xl">{department.name}</CardTitle>
                <CardDescription className="text-sm font-medium text-gray-700">
                  {department.fullName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">
                  {department.description}
                </p>
                
                {department.gallery && department.gallery.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{t('departments.gallery', 'Gallery')}</h4>
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
          ))}
        </div>

        {(!departments || departments.length === 0) && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('departments.no_departments', 'No Departments Available')}</h3>
            <p className="text-gray-600">{t('departments.no_departments_desc', 'Departments will be displayed here once they are created.')}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
