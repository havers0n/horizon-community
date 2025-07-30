import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const call911 = pgTable("mdt.mdt_calls_911", {
  id: serial("id").primaryKey(),
  callerName: text("caller_name"),
  callerPhone: text("caller_phone"),
  location: text("location").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  priority: integer("priority").notNull().default(1),
  status: text("status").notNull().default("pending"),
  patientInfo: jsonb("patient_info"),
  fireInfo: jsonb("fire_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 