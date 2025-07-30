import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const weapons = pgTable("common.weapons", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  type: text("type").notNull(),
  model: text("model").notNull(),
  serialNumber: text("serial_number").notNull().unique(),
  caliber: text("caliber"),
  licenseNumber: text("license_number"),
  registrationStatus: text("registration_status").notNull().default("active"),
  stolen: boolean("stolen").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 