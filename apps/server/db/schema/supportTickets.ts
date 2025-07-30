import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const supportTickets = pgTable("public.support_tickets", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  status: text("status").notNull().default("open"),
  handlerId: integer("handler_id"),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
