import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  Users, 
  Shield, 
  Car, 
  Phone, 
  Mail, 
  MapPin,
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Box
} from "lucide-react";

// Импортируем интерфейсы из файла данных
import { DepartmentDetails as DepartmentDetailsType, Division, Asset } from "@/data/departments";

interface DepartmentDetailsProps {
  department: DepartmentDetailsType;
  onBack?: () => void;
}

export default function DepartmentDetails({ department, onBack }: DepartmentDetailsProps) {
  const getDepartmentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'pd': return <Shield className="h-16 w-16 text-blue-600" />;
      case 'sahp': return <Shield className="h-16 w-16 text-yellow-600" />;
      case 'sams': return <Building className="h-16 w-16 text-green-600" />;
      case 'safr': return <Building className="h-16 w-16 text-red-600" />;
      case 'dd': return <Building className="h-16 w-16 text-purple-600" />;
      case 'cd': return <Users className="h-16 w-16 text-gray-600" />;
      default: return <Building className="h-16 w-16 text-muted-foreground" />;
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case '3d-model': return <Box className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <ExternalLink className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with back button */}
      <div className="mb-6">
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к департаментам
          </Button>
        )}
        
        <div className="flex items-center gap-4">
          {department.logoUrl ? (
            <img 
              src={department.logoUrl} 
              alt={department.name}
              className="h-16 w-16 object-contain"
            />
          ) : (
            getDepartmentIcon(department.name)
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">{department.fullName}</h1>
            <p className="text-muted-foreground">{department.name}</p>
          </div>
        </div>
      </div>

      {/* Main content with tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="divisions">Подразделения</TabsTrigger>
          <TabsTrigger value="gallery">Галерея</TabsTrigger>
          <TabsTrigger value="assets">Материалы</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>О департаменте</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {department.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats & Contacts */}
            <div className="space-y-6">
              {/* Statistics */}
              {department.stats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Статистика</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {department.stats.totalOfficers && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Сотрудников:</span>
                        <span className="font-medium">{department.stats.totalOfficers}</span>
                      </div>
                    )}
                    {department.stats.activeUnits && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Активных юнитов:</span>
                        <span className="font-medium">{department.stats.activeUnits}</span>
                      </div>
                    )}
                    {department.stats.responseTime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Время реагирования:</span>
                        <span className="font-medium">{department.stats.responseTime}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contacts */}
              {department.contacts && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Контакты</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {department.contacts.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{department.contacts.phone}</span>
                      </div>
                    )}
                    {department.contacts.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{department.contacts.email}</span>
                      </div>
                    )}
                    {department.contacts.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{department.contacts.address}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Department Head */}
              {department.head && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Руководитель</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{department.head}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Divisions Tab */}
        <TabsContent value="divisions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Подразделения департамента</CardTitle>
              <CardDescription>
                Структура и специализация подразделений {department.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {department.divisions && department.divisions.length > 0 ? (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {department.divisions.map((division: Division, index: number) => (
                     <div key={division.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                       <div className="flex items-center gap-3 mb-2">
                         <Badge variant="secondary">{index + 1}</Badge>
                         <h3 className="font-semibold text-foreground">{division.name}</h3>
                       </div>
                       {division.description && (
                         <p className="text-sm text-muted-foreground">{division.description}</p>
                       )}
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Информация о подразделениях пока не добавлена</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Галерея департамента</CardTitle>
              <CardDescription>
                Фотографии и изображения {department.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {department.gallery && department.gallery.length > 0 ? (
                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {department.gallery.map((image: string, index: number) => (
                     <div key={index} className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform">
                       <img 
                         src={image} 
                         alt={`${department.name} gallery ${index + 1}`}
                         className="w-full h-full object-cover"
                       />
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Галерея пока не добавлена</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Визуальные материалы</CardTitle>
              <CardDescription>
                3D-модели, изображения техники и оборудования
              </CardDescription>
            </CardHeader>
            <CardContent>
              {department.assets && department.assets.length > 0 ? (
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {department.assets.map((asset: Asset, index: number) => (
                     <div key={index} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                       <div className="flex items-center gap-2 mb-2">
                         {getAssetIcon(asset.type)}
                         <Badge variant="outline" className="text-xs">
                           {asset.type === '3d-model' ? '3D-модель' : 
                            asset.type === 'image' ? 'Изображение' : 'Видео'}
                         </Badge>
                       </div>
                       {asset.description && (
                         <p className="text-sm font-medium mb-2">{asset.description}</p>
                       )}
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="w-full"
                         onClick={() => window.open(asset.url, '_blank')}
                       >
                         <ExternalLink className="h-3 w-3 mr-1" />
                         Открыть
                       </Button>
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="text-center py-8">
                  <Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Визуальные материалы пока не добавлены</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 