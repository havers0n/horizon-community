import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const forumViews = pgTable("forum_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicId: integer("topic_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
}); 