import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const reports = pgTable("public.reports", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  status: text("status").notNull().default("draft"),
  fileUrl: text("file_url").notNull(),
  supervisorComment: text("supervisor_comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 