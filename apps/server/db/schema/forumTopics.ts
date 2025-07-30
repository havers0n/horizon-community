import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  categoryId: integer("category_id").notNull(),
  status: text("status").notNull().default("active"),
  tags: jsonb("tags").notNull().default([]),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  viewsCount: integer("views_count").notNull().default(0),
  repliesCount: integer("replies_count").notNull().default(0),
  lastPostAt: timestamp("last_post_at"),
  lastPostAuthorId: integer("last_post_author_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 