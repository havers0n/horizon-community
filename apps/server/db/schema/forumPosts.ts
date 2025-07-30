import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  topicId: integer("topic_id").notNull(),
  parentId: integer("parent_id"),
  reactionsCount: integer("reactions_count").notNull().default(0),
  isEdited: boolean("is_edited").notNull().default(false),
  editedBy: integer("edited_by"),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 