import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { LeaveRequestButton } from '@/features/request-leave';
import { RequestCareerChangeButton } from '@/features/request-career-change';
import { SupportButton } from '@/features/support-ticket';
import { Link } from 'react-router-dom';
import { 
  Users,
  Calendar,
  BookOpen,
  FileText,
} from 'lucide-react';

export const QuickActionsWidget: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Быстрые действия
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {/* Карьера */}
          <RequestCareerChangeButton />
          
          {/* Отпуск */}
          <LeaveRequestButton />
          
          {/* Документация */}
          <Link to="/docs">
            <Button
              variant="outline"
              size="sm"
              className="h-auto p-3 flex flex-col items-center justify-center space-y-1 text-xs w-full"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-center">Документация</span>
            </Button>
          </Link>
          
          {/* Поддержка / Жалобы */}
          <SupportButton />
        </div>
      </CardContent>
    </Card>
  );
};

export type QuickActionsWidgetProps = {};