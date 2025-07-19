import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("candidate"), // candidate, member, supervisor, admin
  status: text("status").notNull().default("active"), // active, on_leave, banned
  departmentId: integer("department_id"),
  secondaryDepartmentId: integer("secondary_department_id"),
  rank: text("rank"),
  division: text("division"),
  qualifications: text("qualifications").array().default([]),
  gameWarnings: integer("game_warnings").notNull().default(0),
  adminWarnings: integer("admin_warnings").notNull().default(0),
  cadToken: text("cad_token").unique(), // Токен для авторизации из игры
  createdAt: timestamp("created_at").defaultNow().notNull(),
  authId: text("auth_id").unique(), // UUID reference to auth.users(id)
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  gallery: text("gallery").array().default([]),
});

// CAD/MDT таблицы
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  type: text("type").notNull(), // civilian, leo, fire, ems
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob").notNull(),
  address: text("address").notNull(),
  insuranceNumber: text("insurance_number").notNull().unique(),
  licenses: jsonb("licenses").notNull().default({}), // { driver: 'valid', weapon: 'expired', ... }
  medicalInfo: jsonb("medical_info").notNull().default({}), // { bloodType, allergies, history, ... }
  mugshotUrl: text("mugshot_url"),
  isUnit: boolean("is_unit").notNull().default(false),
  unitInfo: jsonb("unit_info"), // { badgeNumber, callsign, rank, division, departmentId, qualifications }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => characters.id),
  plate: text("plate").notNull().unique(),
  vin: text("vin").notNull().unique(),
  model: text("model").notNull(),
  color: text("color").notNull(),
  registration: text("registration").notNull().default("valid"), // valid, expired, stolen
  insurance: text("insurance").notNull().default("valid"), // valid, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weapons = pgTable("weapons", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => characters.id),
  serialNumber: text("serial_number").notNull().unique(),
  model: text("model").notNull(),
  registration: text("registration").notNull().default("valid"), // valid, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => characters.id),
  name: text("name").notNull(),
  breed: text("breed").notNull(),
  color: text("color").notNull(),
  medicalNotes: text("medical_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const records = pgTable("records", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  officerId: integer("officer_id").notNull().references(() => characters.id),
  type: text("type").notNull(), // arrest, ticket, warning
  charges: text("charges").array().notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const call911 = pgTable("call911", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, active, closed
  type: text("type").notNull(), // police, fire, ems
  priority: integer("priority").notNull().default(1), // 1-5, где 1 - высший приоритет
  callerInfo: jsonb("caller_info"), // информация о звонящем
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activeUnits = pgTable("active_units", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  status: text("status").notNull().default("10-8"), // 10-8 (Available), 10-7 (Out of Service), 10-6 (Busy), 10-5 (On Scene), etc.
  callsign: text("callsign").notNull(),
  location: jsonb("location").notNull(), // {x, y, z}
  partnerId: integer("partner_id"), // Ссылка на себя будет добавлена после создания таблицы
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  isPanic: boolean("is_panic").notNull().default(false),
  lastUpdate: timestamp("last_update").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const callAttachments = pgTable("call_attachments", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").notNull().references(() => call911.id),
  unitId: integer("unit_id").notNull().references(() => activeUnits.id),
  status: text("status").notNull().default("en_route"), // en_route, on_scene, cleared
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  characterId: integer("character_id"), // связь с персонажем (опционально)
  type: text("type").notNull(), // entry, promotion, qualification, transfer_dept, transfer_div, leave, joint_primary, joint_secondary, joint_remove
  status: text("status").notNull().default("pending"), // pending, approved, rejected, closed
  data: jsonb("data").notNull(),
  result: jsonb("result"),
  reviewerId: integer("reviewer_id"),
  reviewComment: text("review_comment"),
  statusHistory: jsonb("status_history").default([]).notNull(), // [{status, date, comment, reviewerId}]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  status: text("status").notNull().default("open"), // open, closed
  handlerId: integer("handler_id"),
  messages: jsonb("messages").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, resolved, declined
  incidentDate: timestamp("incident_date").notNull(),
  incidentType: text("incident_type").notNull(), // game, admin
  participants: text("participants").notNull(),
  description: text("description").notNull(),
  evidenceUrl: text("evidence_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  fileUrl: text("file_url").notNull(),
  supervisorComment: text("supervisor_comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  recipientId: integer("recipient_id").notNull(),
  content: text("content").notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  relatedTo: jsonb("related_to").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  questions: jsonb("questions").notNull(),
});

export const testSessions = pgTable("test_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  testId: integer("test_id").notNull(),
  applicationId: integer("application_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("in_progress"), // in_progress, completed, abandoned
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jointPositionsHistory = pgTable("joint_positions_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  primaryDepartmentId: integer("primary_department_id").notNull().references(() => departments.id),
  secondaryDepartmentId: integer("secondary_department_id").notNull().references(() => departments.id),
  status: text("status").notNull().default("pending"), // pending, active, inactive, removed
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  reason: text("reason").notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  removedBy: integer("removed_by").references(() => users.id),
  removedAt: timestamp("removed_at"),
  removalReason: text("removal_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  testId: integer("test_id").notNull(),
  sessionId: integer("session_id").notNull(),
  applicationId: integer("application_id"),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  percentage: integer("percentage").notNull(),
  passed: boolean("passed").notNull(),
  timeSpent: integer("time_spent").notNull(), // в секундах
  focusLostCount: integer("focus_lost_count").notNull().default(0),
  warningsCount: integer("warnings_count").notNull().default(0),
  answers: jsonb("answers").notNull(),
  results: jsonb("results").notNull(), // детальные результаты по каждому вопросу
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertWeaponSchema = createInsertSchema(weapons).omit({
  id: true,
  createdAt: true,
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
});

export const insertRecordSchema = createInsertSchema(records).omit({
  id: true,
  createdAt: true,
});

export const insertCall911Schema = createInsertSchema(call911).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActiveUnitSchema = createInsertSchema(activeUnits).omit({
  id: true,
  createdAt: true,
});

export const insertCallAttachmentSchema = createInsertSchema(callAttachments).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
});

export const insertTestSessionSchema = createInsertSchema(testSessions).omit({
  id: true,
  createdAt: true,
});

export const insertJointPositionHistorySchema = createInsertSchema(jointPositionsHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

// CAD schemas
export const createCharacterSchema = z.object({
  type: z.enum(["civilian", "leo", "fire", "ems"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string(), // ISO date string
  address: z.string().min(1),
  licenses: z.record(z.string()).optional(),
  medicalInfo: z.record(z.any()).optional(),
  mugshotUrl: z.string().optional(),
  isUnit: z.boolean().default(false),
  unitInfo: z.record(z.any()).optional(),
});

export const updateCharacterSchema = createCharacterSchema.partial();

export const createVehicleSchema = z.object({
  plate: z.string().min(1),
  model: z.string().min(1),
  color: z.string().min(1),
  registration: z.enum(["valid", "expired", "stolen"]).default("valid"),
  insurance: z.enum(["valid", "expired"]).default("valid"),
});

export const createWeaponSchema = z.object({
  serialNumber: z.string().min(1),
  model: z.string().min(1),
  registration: z.enum(["valid", "expired"]).default("valid"),
});

export const createCall911Schema = z.object({
  location: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["police", "fire", "ems"]),
  priority: z.number().min(1).max(5).default(1),
  callerInfo: z.record(z.any()).optional(),
});

export const goOnDutySchema = z.object({
  characterId: z.number(),
  vehicleId: z.number().optional(),
  partnerId: z.number().optional(),
  departmentId: z.number(),
});

export const updateUnitStatusSchema = z.object({
  status: z.string().min(1),
  location: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
});

// Entry application schema (заявка на вступление)
export const entryApplicationSchema = z.object({
  fullName: z.string().min(2, "ФИО должно содержать минимум 2 символа"),
  birthDate: z.string().min(1, "Дата рождения обязательна"),
  departmentId: z.number().min(1, "Выберите департамент"),
  departmentDescription: z.string().min(10, "Опишите чем занимается департамент (минимум 10 символов)"),
  motivation: z.string().min(20, "Мотивация должна содержать минимум 20 символов"),
  hasMicrophone: z.boolean(),
  meetsSystemRequirements: z.boolean(),
  systemRequirementsLink: z.string().url("Укажите корректную ссылку на системные требования"),
  sourceOfInformation: z.string().min(1, "Укажите откуда узнали о сообществе"),
  inOtherCommunities: z.boolean(),
  wasInOtherCommunities: z.boolean(),
  otherCommunitiesDetails: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Weapon = typeof weapons.$inferSelect;
export type InsertWeapon = z.infer<typeof insertWeaponSchema>;
export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Record = typeof records.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Call911 = typeof call911.$inferSelect;
export type InsertCall911 = z.infer<typeof insertCall911Schema>;
export type ActiveUnit = typeof activeUnits.$inferSelect;
export type InsertActiveUnit = z.infer<typeof insertActiveUnitSchema>;
export type CallAttachment = typeof callAttachments.$inferSelect;
export type InsertCallAttachment = z.infer<typeof insertCallAttachmentSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type TestSession = typeof testSessions.$inferSelect;
export type InsertTestSession = z.infer<typeof insertTestSessionSchema>;
export type JointPositionHistory = typeof jointPositionsHistory.$inferSelect;
export type InsertJointPositionHistory = z.infer<typeof insertJointPositionHistorySchema>;
export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type CreateCharacterData = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterData = z.infer<typeof updateCharacterSchema>;
export type CreateVehicleData = z.infer<typeof createVehicleSchema>;
export type CreateWeaponData = z.infer<typeof createWeaponSchema>;
export type CreateCall911Data = z.infer<typeof createCall911Schema>;
export type GoOnDutyData = z.infer<typeof goOnDutySchema>;
export type UpdateUnitStatusData = z.infer<typeof updateUnitStatusSchema>;
export type EntryApplicationData = z.infer<typeof entryApplicationSchema>;
