import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // civil, police, fire, ems, dispatch
  // Можно добавить описание, лого и т.д.
});
