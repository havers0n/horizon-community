import { pgTable, serial, integer, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'closed']);

export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  handlerId: integer('handler_id').references(() => users.id),
  messages: jsonb('messages').default('[]').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
