import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export function ProfileSummarySkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Заголовок приветствия */}
        <Skeleton className="h-5 w-32" />
        
        {/* Членства */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-3 w-24 ml-6" />
          </div>
        </div>
        
        {/* Квалификации */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
        
        {/* Предупреждения */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex space-x-3">
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-8 rounded" />
            </div>
            <div className="flex items-center space-x-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-8 rounded" />
            </div>
          </div>
        </div>
        
        {/* Ссылка на профиль */}
        <div className="pt-2">
          <Skeleton className="h-4 w-44" />
        </div>
      </CardContent>
    </Card>
  );
}