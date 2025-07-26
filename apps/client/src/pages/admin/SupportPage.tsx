import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface Ticket {
  id: number;
  authorId: number;
  status: string;
  createdAt: string;
}

interface TicketsResponse {
  tickets: Ticket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <table className="min-w-full border text-sm">
      <thead>
        <tr>
          <th className="border px-2 py-1">ID</th>
          <th className="border px-2 py-1">Автор</th>
          <th className="border px-2 py-1">Статус</th>
          <th className="border px-2 py-1">Создан</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => (
          <tr key={t.id} className="hover:bg-gray-100 cursor-pointer">
            <td className="border px-2 py-1">
              <Link to={`/admin/support/tickets/${t.id}`}>{t.id}</Link>
            </td>
            <td className="border px-2 py-1">{t.authorId}</td>
            <td className="border px-2 py-1">{t.status}</td>
            <td className="border px-2 py-1">{new Date(t.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function SupportPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery<TicketsResponse>({
    queryKey: ['admin-tickets', page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/support/tickets?page=${page}`);
      if (!res.ok) throw new Error('Ошибка загрузки тикетов');
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (isError || !data) return <div>Ошибка загрузки тикетов</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Тикеты поддержки</h1>
      <TicketsTable tickets={data.tickets} />
      <div className="flex gap-2 mt-4 justify-center">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Назад
        </button>
        <span>Стр. {data.page} из {data.totalPages}</span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => (p < data.totalPages ? p + 1 : p))}
          disabled={page === data.totalPages}
        >
          Вперед
        </button>
      </div>
    </div>
  );
}
