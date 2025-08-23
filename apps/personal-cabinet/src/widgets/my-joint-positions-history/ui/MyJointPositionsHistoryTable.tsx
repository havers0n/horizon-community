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
  useMyJointPositionRequests, 
  formatCreatedAt, 
  JOINT_POSITION_STATUS_CONFIG,
  type JointPositionStatus 
} from '../../../entities/joint-position';
import type { JointPositionRequest } from '../../../shared/api/cabinet-service';

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
      У вас пока нет поданных заявок на совмещение должности
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

interface JointPositionStatusBadgeProps {
  statusCode: string;
  statusName: string;
}

const JointPositionStatusBadge = ({ statusCode, statusName }: JointPositionStatusBadgeProps) => {
  const config = JOINT_POSITION_STATUS_CONFIG[statusCode as JointPositionStatus];
  
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

interface MyJointPositionsHistoryTableProps {
  className?: string;
}

export const MyJointPositionsHistoryTable = ({ className }: MyJointPositionsHistoryTableProps) => {
  const { data: requests = [], isLoading, error } = useMyJointPositionRequests();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">История заявок на совмещение</h3>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">История заявок на совмещение</h3>
          <ErrorState error={error as Error} />
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">История заявок на совмещение</h3>
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">История заявок на совмещение</h3>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Департамент совмещения</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Дата подачи</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Одобрил</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request: JointPositionRequest) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.secondary_department_name}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={request.reason}>
                      {request.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatCreatedAt(request.created_at)}
                  </TableCell>
                  <TableCell>
                    <JointPositionStatusBadge 
                      statusCode={request.status_code} 
                      statusName={request.status_name}
                    />
                  </TableCell>
                  <TableCell>
                    {request.approver_full_name ? (
                      <span className="text-sm">{request.approver_full_name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {requests.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Всего заявок: {requests.length}
          </p>
        )}
      </div>
    </div>
  );
};