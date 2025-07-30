import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const forumReactions = pgTable("forum_reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  postId: integer("post_id").notNull(),
  type: text("type").notNull(), // like, dislike, etc.
  reactionType: text("reaction_type").notNull(), // like, dislike, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
}); 