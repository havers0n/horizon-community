import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { QuickActionsWidgetProps } from '@/features/dashboard/model/types';
import { 
  ArrowUp,
  ArrowUpDown,
  Link,
  Plane,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ actions }) => {
  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'ArrowUp':
        return <ArrowUp className="w-4 h-4" />;
      case 'ArrowUpDown':
        return <ArrowUpDown className="w-4 h-4" />;
      case 'Link':
        return <Link className="w-4 h-4" />;
      case 'Plane':
        return <Plane className="w-4 h-4" />;
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const careerActions = actions.filter(action => action.category === 'career');
  const documentationActions = actions.filter(action => action.category === 'documentation');

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Быстрые действия
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Career Actions */}
        {careerActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Карьера
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {careerActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="h-auto p-3 flex flex-col items-center space-y-1 text-xs"
                >
                  <div className="text-gray-600">
                    {getActionIcon(action.icon)}
                  </div>
                  <span className="text-center">{action.title}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Documentation Actions */}
        {documentationActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Документация
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {documentationActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant === 'warning' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={action.action}
                  className={`h-auto p-3 flex flex-col items-center space-y-1 text-xs ${
                    action.variant === 'warning' 
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                      : ''
                  }`}
                >
                  <div className={action.variant === 'warning' ? 'text-red-600' : 'text-gray-600'}>
                    {getActionIcon(action.icon)}
                  </div>
                  <span className="text-center">{action.title}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {actions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <FileText className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">Нет доступных действий</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 