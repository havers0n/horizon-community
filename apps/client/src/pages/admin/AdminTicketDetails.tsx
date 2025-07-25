import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Message {
  senderId: number;
  content: string;
  timestamp: string;
}

interface Ticket {
  id: number;
  authorId: number;
  status: string;
  messages: Message[];
  createdAt: string;
}

export default function AdminTicketDetails() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data: ticket, isLoading, isError } = useQuery<Ticket>({
    queryKey: ['admin-ticket', ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/support/tickets/${ticketId}`);
      if (!res.ok) throw new Error('Ошибка загрузки тикета');
      return res.json();
    },
    enabled: !!ticketId,
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Ошибка отправки ответа');
      return res.json();
    },
    onSuccess: () => {
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] });
    },
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (isError || !ticket) return <div>Ошибка загрузки тикета</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">Тикет #{ticket.id}</h2>
      <div className="mb-4 text-sm text-gray-500">Статус: {ticket.status}</div>
      <div className="border rounded p-3 bg-gray-50 mb-4 max-h-96 overflow-y-auto">
        {ticket.messages.length === 0 && <div className="text-gray-400">Нет сообщений</div>}
        {ticket.messages.map((msg, idx) => (
          <div key={idx} className="mb-3">
            <div className="font-semibold text-xs text-gray-600">{msg.senderId === ticket.authorId ? 'Пользователь' : 'Админ'} <span className="text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span></div>
            <div className="bg-white border rounded p-2 mt-1 whitespace-pre-line">{msg.content}</div>
          </div>
        ))}
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (reply.trim()) mutation.mutate(reply);
        }}
        className="flex gap-2"
      >
        <textarea
          className="flex-1 border rounded p-2"
          rows={2}
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Ваш ответ..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={mutation.status === 'pending' || !reply.trim()}
        >
          {mutation.status === 'pending' ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  );
}
