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
  useMyTransferRequests, 
  formatCreatedAt, 
  TRANSFER_REQUEST_STATUS_CONFIG,
  type TransferRequestStatus 
} from '../../../entities/transfer-request';
import type { TransferRequest } from '../../../shared/api/cabinet-service';

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
      У вас пока нет поданных заявок на перевод в другой департамент
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

interface TransferRequestStatusBadgeProps {
  statusCode: string;
  statusName: string;
}

const TransferRequestStatusBadge = ({ statusCode, statusName }: TransferRequestStatusBadgeProps) => {
  const config = TRANSFER_REQUEST_STATUS_CONFIG[statusCode as TransferRequestStatus];
  
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

interface MyTransfersHistoryTableProps {
  className?: string;
}

export const MyTransfersHistoryTable = ({ className }: MyTransfersHistoryTableProps) => {
  const { data: requests = [], isLoading, error } = useMyTransferRequests();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">История заявок на перевод</h3>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">История заявок на перевод</h3>
          <ErrorState error={error as Error} />
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">История заявок на перевод</h3>
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">История заявок на перевод</h3>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Откуда</TableHead>
                <TableHead>Куда</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Дата подачи</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Одобрил</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request: TransferRequest) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.current_department_name || 'Текущий департамент'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {request.target_department_name}
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
                    <TransferRequestStatusBadge 
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