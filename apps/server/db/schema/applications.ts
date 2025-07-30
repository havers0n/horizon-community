

import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const applications = pgTable("public.applications", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  data: jsonb("data").notNull().default({}),
  result: jsonb("result"),
  reviewerId: integer("reviewer_id"),
  reviewComment: text("review_comment"),
  statusHistory: jsonb("status_history").notNull().default([]),
  characterId: integer("character_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
