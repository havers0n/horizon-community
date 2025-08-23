import { 
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from '../../../shared/ui';
import { 
  useMyLeaves, 
  formatDateRange, 
  formatCreatedAt, 
  LEAVE_STATUS_CONFIG,
  type LeaveRequest,
  type LeaveStatus 
} from '../../../entities/leave';

const LoadingSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
  </div>
);

const EmptyState = () => (
  <div className="text-center py-8">
    <p className="text-muted-foreground text-sm">
      У вас пока нет поданных заявок на отпуск
    </p>
  </div>
);

const ErrorState = ({ error }: { error: Error }) => (
  <div className="text-center py-8">
    <p className="text-destructive text-sm">
      Ошибка при загрузке заявок: {error.message}
    </p>
  </div>
);

interface LeaveStatusBadgeProps {
  statusCode: string;
  statusName: string;
}

const LeaveStatusBadge = ({ statusCode, statusName }: LeaveStatusBadgeProps) => {
  const config = LEAVE_STATUS_CONFIG[statusCode as LeaveStatus];
  
  // Если статус не найден в конфигурации, используем значения по умолчанию
  if (!config) {
    return (
      <Badge variant="default">
        {statusName}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

interface MyLeavesHistoryTableProps {
  className?: string;
}

export const MyLeavesHistoryTable = ({ className }: MyLeavesHistoryTableProps) => {
  const { data: leaves = [], isLoading, error } = useMyLeaves();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">История заявок на отпуск</h3>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">История заявок на отпуск</h3>
          <ErrorState error={error as Error} />
        </div>
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">История заявок на отпуск</h3>
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">История заявок на отпуск</h3>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Период</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Дата подачи</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Одобрил</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave: LeaveRequest) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">
                    {formatDateRange(leave.start_date, leave.end_date)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={leave.reason}>
                      {leave.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatCreatedAt(leave.created_at)}
                  </TableCell>
                  <TableCell>
                    <LeaveStatusBadge 
                      statusCode={leave.status_code} 
                      statusName={leave.status_name}
                    />
                  </TableCell>
                  <TableCell>
                    {leave.approver_full_name ? (
                      <span className="text-sm">{leave.approver_full_name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {leaves.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Всего заявок: {leaves.length}
          </p>
        )}
      </div>
    </div>
  );
};