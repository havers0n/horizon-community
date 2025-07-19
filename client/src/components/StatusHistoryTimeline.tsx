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
  pending: "bg-yellow-400 text-yellow-900",
  approved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
  closed: "bg-gray-400 text-white",
  'test_required': "bg-blue-400 text-white",
  'test_completed': "bg-blue-600 text-white",
  resolved: "bg-green-700 text-white"
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
      <ol className="relative border-l border-gray-200 ml-4">
        {history.map((item, idx) => (
          <li key={idx} className="mb-8 ml-6">
            <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-8 ring-white ${statusColors[item.status] || 'bg-gray-300 text-gray-800'}`}>{statusIcons[item.status] || '•'}</span>
            <div className="flex flex-col gap-1">
              <span className="font-semibold capitalize">{item.status}</span>
              <span className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</span>
              {item.comment && <span className="text-sm text-gray-700">{item.comment}</span>}
              {item.reviewerName && <span className="text-xs text-gray-400">{t('applications.reviewer')}: {item.reviewerName}</span>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
