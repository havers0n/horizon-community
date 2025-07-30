

import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const characters = pgTable("common.characters", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(), // userId
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  departmentId: integer("department_id").notNull(),
  rank: text("rank"),
  status: text("status").notNull().default("active"),
  insuranceNumber: text("insurance_number"),
  address: text("address"),
  type: text("type").notNull().default("civilian"),
  isUnit: boolean("is_unit").notNull().default(false),
  badgeNumber: text("badge_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Добавьте другие игровые поля по необходимости
});
