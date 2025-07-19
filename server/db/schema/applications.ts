

import { pgTable, serial, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(), // userId
  characterId: integer("character_id"), // связь с персонажем (опционально)
  type: text("type").notNull(), // entry, promotion, etc.
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  data: jsonb("data").notNull(), // анкета
  reviewerId: integer("reviewer_id"),
  reviewComment: text("review_comment"),
  statusHistory: jsonb("status_history").default([]).notNull(), // [{status, date, comment, reviewerId}]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
