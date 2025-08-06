import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { NextStepsWidgetProps } from '@/features/dashboard/model/types';
import { 
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export const NextStepsWidget: React.FC<NextStepsWidgetProps> = ({ steps }) => {
  return (
    <Card className="h-full bg-gray-800 border-gray-600">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-100">
          Следующие шаги
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <CheckCircle className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-400">Все шаги выполнены!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  step.completed 
                    ? 'bg-green-900 border-green-700' 
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors'
                }`}
              >
                {/* Step Number and Icon */}
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <div className="w-6 h-6 rounded-full bg-green-800 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${
                    step.completed ? 'text-green-200' : 'text-gray-100'
                  }`}>
                    {step.title}
                  </h4>
                  {step.description && (
                    <p className={`text-xs mt-1 ${
                      step.completed ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  )}
                </div>
                
                {/* Action Button */}
                {step.action && !step.completed && (
                  <button
                    onClick={step.action}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 