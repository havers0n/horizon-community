import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";

export const ranks = pgTable("ranks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  orderIndex: integer("order_index").notNull(),
}); 