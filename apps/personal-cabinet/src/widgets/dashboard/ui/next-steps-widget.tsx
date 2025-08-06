import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { NextStepsWidgetProps } from '@/features/dashboard/model/types';
import { 
  CheckCircle,
  Circle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const NextStepsWidget: React.FC<NextStepsWidgetProps> = ({ steps }) => {
  const handleStepClick = (step: NextStepsWidgetProps['steps'][0]) => {
    if (step.link) {
      window.open(step.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Следующие шаги
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <CheckCircle className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">Все шаги выполнены!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  step.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors'
                }`}
              >
                {/* Step Number and Icon */}
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${
                    step.completed ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs mt-1 ${
                    step.completed ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                </div>
                
                {/* Action Button */}
                {step.link && !step.completed && (
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStepClick(step)}
                      className="h-auto p-1 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Progress Summary */}
        {steps.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Прогресс: {steps.filter(s => s.completed).length} из {steps.length}
              </span>
              <span className="text-gray-500">
                {Math.round((steps.filter(s => s.completed).length / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 