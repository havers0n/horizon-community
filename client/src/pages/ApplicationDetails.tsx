import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StatusHistoryTimeline } from "@/components/StatusHistoryTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/applications", id],
    queryFn: async () => {
      const res = await fetch(`/api/applications/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id
  });

  if (isLoading) return <div className="p-8">Загрузка...</div>;
  if (error || !data) return <div className="p-8 text-red-600">Ошибка загрузки заявки</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Заявка #{data.id}</CardTitle>
          <Badge>{data.status}</Badge>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="font-semibold">Тип: <span className="font-normal">{data.type}</span></div>
            <div className="font-semibold">Дата подачи: <span className="font-normal">{new Date(data.createdAt).toLocaleString()}</span></div>
            {data.reviewComment && (
              <div className="mt-2 text-blue-700">Комментарий: {data.reviewComment}</div>
            )}
          </div>
          <div className="mb-6">
            <div className="font-semibold mb-2">История статусов:</div>
            <StatusHistoryTimeline history={data.statusHistory || []} />
          </div>
          <div>
            <div className="font-semibold mb-1">Детали заявки:</div>
            <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">{JSON.stringify(data.data, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
