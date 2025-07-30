

import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("public.users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  siteRole: text("site_role").notNull().default("user"),
  discordId: text("discord_id"),
  apiToken: text("api_token"),
  username: text("username").notNull().unique(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  departmentId: integer("department_id"),
  secondaryDepartmentId: integer("secondary_department_id"),
  rank: text("rank"),
  division: text("division"),
  qualifications: jsonb("qualifications").notNull().default([]),
  gameWarnings: integer("game_warnings").notNull().default(0),
  adminWarnings: integer("admin_warnings").notNull().default(0),
  cadToken: text("cad_token"),
  discordUsername: text("discord_username"),
  has2FA: boolean("has_2fa").notNull().default(false),
  isDarkTheme: boolean("is_dark_theme").notNull().default(false),
  soundSettings: jsonb("sound_settings").notNull().default({}),
  authId: text("auth_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
