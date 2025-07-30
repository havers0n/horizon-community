import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const forumStats = pgTable("forum_stats", {
  id: serial("id").primaryKey(),
  totalTopics: integer("total_topics").notNull().default(0),
  totalPosts: integer("total_posts").notNull().default(0),
  totalMembers: integer("total_members").notNull().default(0),
  onlineNow: integer("online_now").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 