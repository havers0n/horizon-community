import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const vehicles = pgTable("common.vehicles", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  plate: text("plate").notNull().unique(),
  model: text("model").notNull(),
  color: text("color").notNull(),
  year: integer("year"),
  vin: text("vin").unique(),
  insuranceNumber: text("insurance_number"),
  registrationStatus: text("registration_status").notNull().default("active"),
  stolen: boolean("stolen").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 