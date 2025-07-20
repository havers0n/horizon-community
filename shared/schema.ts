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
  // Discord интеграция
  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username"),
  discordAccessToken: text("discord_access_token"),
  discordRefreshToken: text("discord_refresh_token"),
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

// ===== НОВАЯ СИСТЕМА ПЕРСОНАЖЕЙ =====

// Звания и должности
export const ranks = pgTable("ranks", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // rank - звание, position - должность
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Подразделения
export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Квалификации
export const qualifications = pgTable("qualifications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  departmentId: integer("department_id").references(() => departments.id),
  divisionId: integer("division_id").references(() => divisions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Юниты
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Обновленная таблица персонажей
export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  type: text("type").notNull(), // civilian, leo, fire, ems
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob").notNull(),
  address: text("address").notNull(),
  insuranceNumber: text("insurance_number").notNull().unique(),
  licenses: jsonb("licenses").notNull().default({}),
  medicalInfo: jsonb("medical_info").notNull().default({}),
  mugshotUrl: text("mugshot_url"),
  isUnit: boolean("is_unit").notNull().default(false),
  unitInfo: jsonb("unit_info"),
  // Новые поля для карьеры
  departmentId: integer("department_id").references(() => departments.id),
  rankId: integer("rank_id").references(() => ranks.id),
  divisionId: integer("division_id").references(() => divisions.id),
  unitId: integer("unit_id").references(() => units.id),
  badgeNumber: text("badge_number"),
  employeeId: text("employee_id"),
  hireDate: date("hire_date"),
  terminationDate: date("termination_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Связь персонажей с квалификациями
export const characterQualifications = pgTable("character_qualifications", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  qualificationId: integer("qualification_id").notNull().references(() => qualifications.id),
  obtainedDate: date("obtained_date").notNull(),
  expiresDate: date("expires_date"),
  issuedBy: integer("issued_by").references(() => characters.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// История карьеры персонажа
export const characterCareerHistory = pgTable("character_career_history", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull().references(() => characters.id),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  rankId: integer("rank_id").references(() => ranks.id),
  divisionId: integer("division_id").references(() => divisions.id),
  unitId: integer("unit_id").references(() => units.id),
  actionType: text("action_type").notNull(), // hire, promotion, transfer, demotion, termination
  effectiveDate: date("effective_date").notNull(),
  reason: text("reason"),
  approvedBy: integer("approved_by").references(() => characters.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// Новая таблица для шаблонов рапортов
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  departmentId: integer("department_id").references(() => departments.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  status: text("status").notNull().default("draft"), // draft, ready - черновик для админов, готовый для пользователей
  // Новые поля для расширенной информации
  category: text("category").notNull().default("general"), // general, police, fire, ems, admin
  subcategory: text("subcategory"), // incident, arrest, traffic, etc.
  purpose: text("purpose"), // Назначение формы
  whoFills: text("who_fills"), // Кто заполняет
  whenUsed: text("when_used"), // Когда используется
  templateExample: text("template_example"), // Ссылка на пример шаблона
  filledExample: text("filled_example"), // Ссылка на заполненный пример
  difficulty: text("difficulty").default("medium"), // easy, medium, hard
  estimatedTime: integer("estimated_time"), // Время заполнения в минутах
  requiredFields: text("required_fields").array().default([]), // Обязательные поля
  tags: text("tags").array().default([]), // Теги для поиска
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Новая таблица для заполненных рапортов
export const filledReports = pgTable("filled_reports", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => reportTemplates.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(), // Заполненный рапорт
  status: text("status").notNull().default("draft"), // draft, submitted, approved, rejected
  supervisorComment: text("supervisor_comment"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // activity, skill, social, special
  points: integer("points").notNull().default(0),
  requirements: jsonb("requirements").notNull(), // { type: "applications_submitted", count: 10 }
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  progress: integer("progress").notNull().default(0), // Текущий прогресс
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  rarity: text("rarity").notNull(), // common, rare, epic, legendary
  category: text("category").notNull(), // department, event, special
  requirements: jsonb("requirements").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  awardedBy: integer("awarded_by").references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  applicationsSubmitted: integer("applications_submitted").notNull().default(0),
  applicationsApproved: integer("applications_approved").notNull().default(0),
  reportsSubmitted: integer("reports_submitted").notNull().default(0),
  reportsApproved: integer("reports_approved").notNull().default(0),
  complaintsSubmitted: integer("complaints_submitted").notNull().default(0),
  daysActive: integer("days_active").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFilledReportSchema = createInsertSchema(filledReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  createdAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Новые схемы для системы персонажей
export const insertRankSchema = createInsertSchema(ranks).omit({
  id: true,
  createdAt: true,
});

export const insertDivisionSchema = createInsertSchema(divisions).omit({
  id: true,
  createdAt: true,
});

export const insertQualificationSchema = createInsertSchema(qualifications).omit({
  id: true,
  createdAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
});

export const insertCharacterQualificationSchema = createInsertSchema(characterQualifications).omit({
  id: true,
  createdAt: true,
});

export const insertCharacterCareerHistorySchema = createInsertSchema(characterCareerHistory).omit({
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
  systemRequirementsLink: z.string().url("Укажите корректную ссылку на системные требования").optional(),
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

// Новые типы для системы персонажей
export type Rank = typeof ranks.$inferSelect;
export type InsertRank = z.infer<typeof insertRankSchema>;
export type Division = typeof divisions.$inferSelect;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;
export type Qualification = typeof qualifications.$inferSelect;
export type InsertQualification = z.infer<typeof insertQualificationSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type CharacterQualification = typeof characterQualifications.$inferSelect;
export type InsertCharacterQualification = z.infer<typeof insertCharacterQualificationSchema>;
export type CharacterCareerHistory = typeof characterCareerHistory.$inferSelect;
export type InsertCharacterCareerHistory = z.infer<typeof insertCharacterCareerHistorySchema>;

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
export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;
export type FilledReport = typeof filledReports.$inferSelect;
export type InsertFilledReport = z.infer<typeof insertFilledReportSchema>;
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
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

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
