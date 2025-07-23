import React from "react";
import { useTranslation } from "react-i18next";

interface StatusHistoryItem {
  status: string;
  date: string;
  comment?: string;
  reviewerId?: number;
  reviewerName?: string;
}

interface StatusHistoryTimelineProps {
  history: StatusHistoryItem[];
}

const statusColors: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
  closed: "bg-muted text-muted-foreground",
  'test_required': "bg-info text-info-foreground",
  'test_completed': "bg-info text-info-foreground",
  resolved: "bg-success text-success-foreground"
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <span>⏳</span>,
  approved: <span>✅</span>,
  rejected: <span>❌</span>,
  closed: <span>🔒</span>,
  test_required: <span>📝</span>,
  test_completed: <span>📋</span>,
  resolved: <span>🏁</span>
};

export function StatusHistoryTimeline({ history }: StatusHistoryTimelineProps) {
  const { t } = useTranslation();
  if (!history || history.length === 0) return null;

  return (
    <div>
      <ol className="relative border-l border-border ml-4">
        {history.map((item, idx) => (
          <li key={idx} className="mb-8 ml-6">
            <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-8 ring-background ${statusColors[item.status] || 'bg-muted text-muted-foreground'}`}>{statusIcons[item.status] || '•'}</span>
            <div className="flex flex-col gap-1">
              <span className="font-semibold capitalize text-foreground">{item.status}</span>
              <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString()}</span>
              {item.comment && <span className="text-sm text-muted-foreground">{item.comment}</span>}
              {item.reviewerName && <span className="text-xs text-muted-foreground">{t('applications.reviewer')}: {item.reviewerName}</span>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
