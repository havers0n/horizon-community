

import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  siteRole: text("site_role").notNull().default("user"),
  discordId: text("discord_id"),
  apiToken: text("api_token"),
});
