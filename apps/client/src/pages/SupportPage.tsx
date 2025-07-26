import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
// import SupportModal from '../components/SupportModal'; // Раскомментируйте, если SupportModal уже реализован

interface Ticket {
  id: number;
  status: string;
  createdAt: string;
}

export default function SupportPage() {
  const { data, isLoading, isError } = useQuery<Ticket[]>({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const res = await fetch('/api/tickets');
      if (!res.ok) throw new Error('Ошибка загрузки тикетов');
      return res.json();
    },
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Мои тикеты</h1>
          {/* <SupportModal /> */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Создать тикет</button>
        </div>
      {isLoading && <div>Загрузка...</div>}
      {isError && <div className="text-red-600">Ошибка загрузки тикетов</div>}
      {data && data.length === 0 && <div className="text-gray-500">У вас нет тикетов</div>}
      {data && data.length > 0 && (
        <ul className="divide-y border rounded bg-white">
          {data.map(ticket => (
            <li key={ticket.id}>
              <Link to={`/support/tickets/${ticket.id}`} className="block px-4 py-3 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Тикет #{ticket.id}</span>
                  <span className="text-sm text-gray-500">{ticket.status}</span>
                  <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </Layout>
  );
}
