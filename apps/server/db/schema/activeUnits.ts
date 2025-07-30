import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const activeUnits = pgTable("mdt.active_units", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  status: text("status").notNull().default("10-8"),
  callsign: text("callsign").notNull(),
  unitNumber: text("unit_number"),
  location: jsonb("location").notNull(),
  partnerId: integer("partner_id"),
  vehicleId: integer("vehicle_id"),
  departmentId: integer("department_id").notNull(),
  isPanic: boolean("is_panic").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  lastUpdate: timestamp("last_update").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}); 