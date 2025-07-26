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

export default function UserTicketDetails() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: ticket, isLoading, isError } = useQuery<Ticket>({
    queryKey: ['user-ticket', ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error('Ошибка загрузки тикета');
      return res.json();
    },
    enabled: !!ticketId,
  });

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/support/tickets/${ticketId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Ошибка отправки сообщения');
      return res.json();
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['user-ticket', ticketId] });
    },
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (isError || !ticket) return <div>Ошибка загрузки тикета</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2 text-foreground">Тикет #{ticket.id}</h2>
      <div className="mb-4 text-sm text-muted-foreground">Статус: {ticket.status}</div>
      <div className="border border-border rounded p-3 bg-muted mb-4 max-h-96 overflow-y-auto">
        {ticket.messages.length === 0 && <div className="text-muted-foreground">Нет сообщений</div>}
        {ticket.messages.map((msg, idx) => (
          <div key={idx} className="mb-3">
            <div className="font-semibold text-xs text-muted-foreground">{msg.senderId === ticket.authorId ? 'Вы' : 'Админ'} <span className="text-muted-foreground">{new Date(msg.timestamp).toLocaleString()}</span></div>
            <div className="bg-card border border-border rounded p-2 mt-1 whitespace-pre-line">{msg.content}</div>
          </div>
        ))}
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (message.trim()) mutation.mutate(message);
        }}
        className="flex gap-2"
      >
        <textarea
          className="flex-1 border border-border rounded p-2 bg-background text-foreground placeholder:text-muted-foreground"
          rows={2}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Ваше сообщение..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50 hover:bg-primary/90 transition-colors"
          disabled={mutation.status === 'pending' || !message.trim()}
        >
          {mutation.status === 'pending' ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  );
}
