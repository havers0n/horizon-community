import { Badge } from "./badge";
import { cn } from "@/shared/lib/utils";
import { getStatusClasses, type StatusType } from "@/shared/config/design-system";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusMapping = (status: string): StatusType => {
    switch (status.toLowerCase()) {
      case "approved":
      case "success":
      case "active":
      case "online":
      case "completed":
      case "finished":
        return "approved";
      case "rejected":
      case "denied":
      case "failed":
      case "cancelled":
        return "rejected";
      case "pending":
      case "waiting":
      case "review":
        return "pending";
      case "inactive":
      case "offline":
      case "draft":
        return "info";
      default:
        return "info";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "Одобрено";
      case "rejected": return "Отклонено";
      case "pending": return "На рассмотрении";
      case "active": return "Активно";
      case "inactive": return "Неактивно";
      case "draft": return "Черновик";
      case "completed": return "Завершено";
      case "cancelled": return "Отменено";
      case "online": return "В сети";
      case "offline": return "Не в сети";
      case "waiting": return "Ожидание";
      case "review": return "На проверке";
      case "success": return "Успешно";
      case "failed": return "Ошибка";
      case "finished": return "Завершено";
      case "denied": return "Отказано";
      default: return status;
    }
  };

  const statusType = getStatusMapping(status);
  const label = getStatusLabel(status);
  const statusClasses = getStatusClasses(statusType, 'badge');

  return (
    <Badge
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium transition-all duration-200",
        statusClasses,
        className
      )}
    >
      {label}
    </Badge>
  );
} 