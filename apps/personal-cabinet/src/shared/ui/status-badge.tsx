import { Badge } from "./badge";
import { cn } from "@/shared/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "success":
        return {
          variant: "success" as const,
          label: "Одобрено",
          className: "bg-success/20 text-success border border-success/30"
        };
      case "rejected":
      case "denied":
      case "failed":
        return {
          variant: "destructive" as const,
          label: "Отклонено",
          className: "bg-destructive/20 text-destructive border border-destructive/30"
        };
      case "pending":
      case "waiting":
      case "review":
        return {
          variant: "warning" as const,
          label: "На рассмотрении",
          className: "bg-warning/20 text-warning border border-warning/30"
        };
      case "active":
      case "online":
        return {
          variant: "success" as const,
          label: "Активно",
          className: "bg-success/20 text-success border border-success/30"
        };
      case "inactive":
      case "offline":
        return {
          variant: "secondary" as const,
          label: "Неактивно",
          className: "bg-muted text-muted-foreground border border-muted"
        };
      case "draft":
        return {
          variant: "secondary" as const,
          label: "Черновик",
          className: "bg-muted text-muted-foreground border border-muted"
        };
      case "completed":
      case "finished":
        return {
          variant: "success" as const,
          label: "Завершено",
          className: "bg-success/20 text-success border border-success/30"
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          label: "Отменено",
          className: "bg-destructive/20 text-destructive border border-destructive/30"
        };
      default:
        return {
          variant: "secondary" as const,
          label: status,
          className: "bg-muted text-muted-foreground border border-muted"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium transition-all duration-200",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
} 