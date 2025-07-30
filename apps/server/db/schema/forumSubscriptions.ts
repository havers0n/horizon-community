import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const forumSubscriptions = pgTable("forum_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicId: integer("topic_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}); 