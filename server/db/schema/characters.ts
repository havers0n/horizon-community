

import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(), // userId
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  departmentId: integer("department_id").notNull(),
  rank: text("rank"),
  status: text("status").notNull().default("active"),
  insuranceNumber: text("insurance_number"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Добавьте другие игровые поля по необходимости
});
