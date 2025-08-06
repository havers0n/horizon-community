import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { cn } from "@/shared/lib/utils";
import { Building2, Users, Clock, ArrowRight } from "lucide-react";

interface DepartmentCardProps {
  department: {
    id: string | number;
    name: string;
    fullName: string;
    description: string;
    logoUrl?: string;
    stats?: {
      totalOfficers?: number;
      activeUnits?: number;
      responseTime?: string;
    };
  };
  onClick?: () => void;
  className?: string;
}

export function DepartmentCard({ department, onClick, className }: DepartmentCardProps) {
  const getDepartmentStyle = (name: string) => {
    const departmentName = name.toLowerCase();
    
    if (departmentName.includes("pd") || departmentName.includes("полиция")) {
      return "department-card-pd";
    }
    if (departmentName.includes("sahp") || departmentName.includes("шоссе")) {
      return "department-card-sahp";
    }
    if (departmentName.includes("sams") || departmentName.includes("медицина")) {
      return "department-card-sams";
    }
    if (departmentName.includes("safr") || departmentName.includes("пожар")) {
      return "department-card-safr";
    }
    if (departmentName.includes("dd") || departmentName.includes("дизайн")) {
      return "department-card-dd";
    }
    if (departmentName.includes("cd") || departmentName.includes("криминал")) {
      return "department-card-cd";
    }
    
    return "department-card";
  };

  const getDepartmentIcon = (name: string) => {
    const departmentName = name.toLowerCase();
    
    if (departmentName.includes("pd") || departmentName.includes("полиция")) {
      return "👮";
    }
    if (departmentName.includes("sahp") || departmentName.includes("шоссе")) {
      return "🚔";
    }
    if (departmentName.includes("sams") || departmentName.includes("медицина")) {
      return "🚑";
    }
    if (departmentName.includes("safr") || departmentName.includes("пожар")) {
      return "🚒";
    }
    if (departmentName.includes("dd") || departmentName.includes("дизайн")) {
      return "🎨";
    }
    if (departmentName.includes("cd") || departmentName.includes("криминал")) {
      return "⚖️";
    }
    
    return "🏢";
  };

  return (
    <Card 
      className={cn(
        "department-card-animate cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl",
        getDepartmentStyle(department.name),
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getDepartmentIcon(department.name)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {department.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {department.fullName}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {department.description}
        </p>
        
        {department.stats && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Сотрудники</span>
              </div>
              <span className="font-medium">
                {department.stats.totalOfficers || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3" />
                <span>Активные юниты</span>
              </div>
              <span className="font-medium">
                {department.stats.activeUnits || 0}
              </span>
            </div>
            
            {department.stats.responseTime && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Время ответа</span>
                </div>
                <span className="font-medium">
                  {department.stats.responseTime}
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            Подробнее
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 