import { pgTable, pgPolicy, serial, text, jsonb, integer, index, foreignKey, timestamp, boolean, check, varchar, unique, uniqueIndex, uuid, date, pgSequence } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const jointPositionsHistoryIdSeq = pgSequence("joint_positions_history_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const petsIdSeq = pgSequence("pets_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const achievementsIdSeq = pgSequence("achievements_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const activeUnitsIdSeq = pgSequence("active_units_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const badgesIdSeq = pgSequence("badges_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const call911IdSeq = pgSequence("call911_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const callAttachmentsIdSeq = pgSequence("call_attachments_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const filledReportsIdSeq = pgSequence("filled_reports_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const recordsIdSeq = pgSequence("records_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const reportTemplatesIdSeq = pgSequence("report_templates_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const userAchievementsIdSeq = pgSequence("user_achievements_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const userBadgesIdSeq = pgSequence("user_badges_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })
export const userStatsIdSeq = pgSequence("user_stats_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const tests = pgTable("tests", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	relatedTo: jsonb("related_to").notNull(),
	durationMinutes: integer("duration_minutes").notNull(),
	questions: jsonb().notNull(),
	description: text(),
}, (table) => [
	pgPolicy("Admins can manage tests", { as: "permissive", for: "all", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM users
  WHERE ((users.auth_id = auth.uid()) AND (users.role = 'admin'::text))))` }),
	pgPolicy("Users can view all tests", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("All users can read tests", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Admins can access all tests", { as: "permissive", for: "all", to: ["public"] }),
]);

export const supportTickets = pgTable("support_tickets", {
	id: serial().primaryKey().notNull(),
	authorId: integer("author_id").notNull(),
	status: text().default('open').notNull(),
	handlerId: integer("handler_id"),
	messages: jsonb().default([]),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("support_tickets_author_id_idx").using("btree", table.authorId.asc().nullsLast().op("int4_ops")),
	index("support_tickets_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "support_tickets_author_id_fkey"
		}),
	foreignKey({
			columns: [table.handlerId],
			foreignColumns: [users.id],
			name: "support_tickets_handler_id_fkey"
		}),
	pgPolicy("Support staff can update support tickets", { as: "permissive", for: "update", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM users
  WHERE ((users.auth_id = auth.uid()) AND (users.role = ANY (ARRAY['support'::text, 'admin'::text])))))` }),
	pgPolicy("Support staff can view all support tickets", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Users can update their own support tickets", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Users can view their own support tickets", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Non-guest users can create support tickets", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const complaints = pgTable("complaints", {
	id: serial().primaryKey().notNull(),
	authorId: integer("author_id").notNull(),
	status: text().default('pending').notNull(),
	incidentDate: timestamp("incident_date", { withTimezone: true, mode: 'string' }).notNull(),
	incidentType: text("incident_type").notNull(),
	participants: text().notNull(),
	description: text().notNull(),
	evidenceUrl: text("evidence_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("complaints_author_id_idx").using("btree", table.authorId.asc().nullsLast().op("int4_ops")),
	index("complaints_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "complaints_author_id_fkey"
		}),
	pgPolicy("Moderators can update complaints", { as: "permissive", for: "update", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM users
  WHERE ((users.auth_id = auth.uid()) AND (users.role = ANY (ARRAY['moderator'::text, 'admin'::text])))))` }),
	pgPolicy("Moderators can view all complaints", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Users can update their own complaints", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Users can view their own complaints", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Non-guest users can create complaints", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	recipientId: integer("recipient_id").notNull(),
	content: text().notNull(),
	link: text(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("notifications_is_read_idx").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("notifications_recipient_id_idx").using("btree", table.recipientId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.recipientId],
			foreignColumns: [users.id],
			name: "notifications_recipient_id_fkey"
		}),
	pgPolicy("System can create notifications", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("Users can update their own notifications", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Users can view their own notifications", { as: "permissive", for: "select", to: ["public"] }),
]);

export const applications = pgTable("applications", {
	id: serial().primaryKey().notNull(),
	authorId: integer("author_id").notNull(),
	characterId: integer("character_id"),
	type: text().notNull(),
	status: text().default('pending').notNull(),
	data: jsonb().notNull(),
	result: jsonb(),
	reviewerId: integer("reviewer_id"),
	reviewComment: text("review_comment"),
	statusHistory: jsonb("status_history").default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("applications_author_id_idx").using("btree", table.authorId.asc().nullsLast().op("int4_ops")),
	index("applications_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("applications_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "applications_author_id_fkey"
		}),
	foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [users.id],
			name: "applications_reviewer_id_fkey"
		}),
	pgPolicy("Supervisors can update all applications", { as: "permissive", for: "update", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM users
  WHERE ((users.auth_id = auth.uid()) AND (users.role = ANY (ARRAY['supervisor'::text, 'admin'::text])))))` }),
	pgPolicy("Supervisors can view all applications", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Users can update their own applications", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Users can view their own applications", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Non-guest users can create applications", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can create applications", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const mdtBolos = pgTable("mdt_bolos", {
	id: serial().primaryKey().notNull(),
	type: varchar({ length: 20 }).notNull(),
	description: text().notNull(),
	vehicle: varchar({ length: 100 }),
	plate: varchar({ length: 20 }),
	reason: text().notNull(),
	priority: varchar({ length: 20 }).notNull(),
	location: text(),
	additionalInfo: text("additional_info"),
	status: varchar({ length: 20 }).default('active').notNull(),
	issuedBy: integer("issued_by").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_mdt_bolos_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_mdt_bolos_issued_by").using("btree", table.issuedBy.asc().nullsLast().op("int4_ops")),
	index("idx_mdt_bolos_priority").using("btree", table.priority.asc().nullsLast().op("text_ops")),
	index("idx_mdt_bolos_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_mdt_bolos_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.issuedBy],
			foreignColumns: [users.id],
			name: "mdt_bolos_issued_by_fkey"
		}),
	check("mdt_bolos_priority_check", sql`(priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[])`),
	check("mdt_bolos_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'resolved'::character varying, 'expired'::character varying, 'deleted'::character varying])::text[])`),
	check("mdt_bolos_type_check", sql`(type)::text = ANY ((ARRAY['vehicle'::character varying, 'person'::character varying, 'general'::character varying])::text[])`),
]);

export const testSessions = pgTable("test_sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	testId: integer("test_id").notNull(),
	applicationId: integer("application_id"),
	startTime: timestamp("start_time", { mode: 'string' }).defaultNow().notNull(),
	endTime: timestamp("end_time", { mode: 'string' }),
	status: text().default('in_progress').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_test_sessions_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_test_sessions_user_test").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.testId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "test_sessions_application_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.testId],
			foreignColumns: [tests.id],
			name: "test_sessions_test_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "test_sessions_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can view own test sessions", { as: "permissive", for: "select", to: ["public"], using: sql`(auth.uid() IN ( SELECT users.auth_id
   FROM users
  WHERE (users.id = test_sessions.user_id)))` }),
	pgPolicy("Users can create own test sessions", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can update own test sessions", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Admins can view all test sessions", { as: "permissive", for: "select", to: ["public"] }),
	check("test_sessions_status_check", sql`status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'abandoned'::text])`),
]);

export const testResults = pgTable("test_results", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	testId: integer("test_id").notNull(),
	sessionId: integer("session_id").notNull(),
	applicationId: integer("application_id"),
	score: integer().notNull(),
	maxScore: integer("max_score").notNull(),
	percentage: integer().notNull(),
	passed: boolean().notNull(),
	timeSpent: integer("time_spent").notNull(),
	focusLostCount: integer("focus_lost_count").default(0).notNull(),
	warningsCount: integer("warnings_count").default(0).notNull(),
	answers: jsonb().notNull(),
	results: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_test_results_application").using("btree", table.applicationId.asc().nullsLast().op("int4_ops")),
	index("idx_test_results_session").using("btree", table.sessionId.asc().nullsLast().op("int4_ops")),
	index("idx_test_results_user_test").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.testId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "test_results_application_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [testSessions.id],
			name: "test_results_session_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.testId],
			foreignColumns: [tests.id],
			name: "test_results_test_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "test_results_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Users can view own test results", { as: "permissive", for: "select", to: ["public"], using: sql`(auth.uid() IN ( SELECT users.auth_id
   FROM users
  WHERE (users.id = test_results.user_id)))` }),
	pgPolicy("Users can create own test results", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Admins can view all test results", { as: "permissive", for: "select", to: ["public"] }),
]);

export const forumCategories = pgTable("forum_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	departmentId: integer("department_id"),
	icon: text(),
	color: text(),
	orderIndex: integer("order_index").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	topicsCount: integer("topics_count").default(0).notNull(),
	postsCount: integer("posts_count").default(0).notNull(),
	lastActivity: timestamp("last_activity", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "forum_categories_department_id_fkey"
		}),
	pgPolicy("forum_categories_read_policy", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("forum_categories_admin_policy", { as: "permissive", for: "all", to: ["public"] }),
]);

export const forumTopics = pgTable("forum_topics", {
	id: serial().primaryKey().notNull(),
	categoryId: integer("category_id").notNull(),
	authorId: integer("author_id").notNull(),
	title: text().notNull(),
	content: text().notNull(),
	status: text().default('open').notNull(),
	isPinned: boolean("is_pinned").default(false).notNull(),
	isLocked: boolean("is_locked").default(false).notNull(),
	viewsCount: integer("views_count").default(0).notNull(),
	repliesCount: integer("replies_count").default(0).notNull(),
	lastPostId: integer("last_post_id"),
	lastPostAuthorId: integer("last_post_author_id"),
	lastPostAt: timestamp("last_post_at", { mode: 'string' }),
	tags: text().array().default([""]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_forum_topics_author_id").using("btree", table.authorId.asc().nullsLast().op("int4_ops")),
	index("idx_forum_topics_category_id").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("idx_forum_topics_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_forum_topics_is_pinned").using("btree", table.isPinned.asc().nullsLast().op("bool_ops")),
	index("idx_forum_topics_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "forum_topics_author_id_fkey"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [forumCategories.id],
			name: "forum_topics_category_id_fkey"
		}),
	foreignKey({
			columns: [table.lastPostAuthorId],
			foreignColumns: [users.id],
			name: "forum_topics_last_post_author_id_fkey"
		}),
	pgPolicy("forum_topics_read_policy", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("forum_topics_insert_policy", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("forum_topics_update_policy", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("forum_topics_delete_policy", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const forumPosts = pgTable("forum_posts", {
	id: serial().primaryKey().notNull(),
	topicId: integer("topic_id").notNull(),
	authorId: integer("author_id").notNull(),
	parentId: integer("parent_id"),
	content: text().notNull(),
	isEdited: boolean("is_edited").default(false).notNull(),
	editedAt: timestamp("edited_at", { mode: 'string' }),
	editedBy: integer("edited_by"),
	reactionsCount: integer("reactions_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_forum_posts_author_id").using("btree", table.authorId.asc().nullsLast().op("int4_ops")),
	index("idx_forum_posts_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_forum_posts_parent_id").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
	index("idx_forum_posts_topic_id").using("btree", table.topicId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "forum_posts_author_id_fkey"
		}),
	foreignKey({
			columns: [table.editedBy],
			foreignColumns: [users.id],
			name: "forum_posts_edited_by_fkey"
		}),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "forum_posts_parent_id_fkey"
		}),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [forumTopics.id],
			name: "forum_posts_topic_id_fkey"
		}),
	pgPolicy("forum_posts_read_policy", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("forum_posts_insert_policy", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("forum_posts_update_policy", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("forum_posts_delete_policy", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const forumReactions = pgTable("forum_reactions", {
	id: serial().primaryKey().notNull(),
	postId: integer("post_id").notNull(),
	userId: integer("user_id").notNull(),
	reactionType: text("reaction_type").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_forum_reactions_post_id").using("btree", table.postId.asc().nullsLast().op("int4_ops")),
	index("idx_forum_reactions_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [forumPosts.id],
			name: "forum_reactions_post_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "forum_reactions_user_id_fkey"
		}),
	unique("forum_reactions_post_id_user_id_reaction_type_key").on(table.postId, table.userId, table.reactionType),
	pgPolicy("forum_reactions_read_policy", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("forum_reactions_insert_policy", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("forum_reactions_delete_policy", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const forumSubscriptions = pgTable("forum_subscriptions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	topicId: integer("topic_id").notNull(),
	isEmailNotification: boolean("is_email_notification").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_forum_subscriptions_topic_id").using("btree", table.topicId.asc().nullsLast().op("int4_ops")),
	index("idx_forum_subscriptions_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [forumTopics.id],
			name: "forum_subscriptions_topic_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "forum_subscriptions_user_id_fkey"
		}),
	unique("forum_subscriptions_user_id_topic_id_key").on(table.userId, table.topicId),
	pgPolicy("forum_subscriptions_read_policy", { as: "permissive", for: "select", to: ["public"], using: sql`((user_id = ( SELECT users.id
   FROM users
  WHERE (users.auth_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.auth_id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'supervisor'::text]))))))` }),
	pgPolicy("forum_subscriptions_insert_policy", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("forum_subscriptions_delete_policy", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const forumViews = pgTable("forum_views", {
	id: serial().primaryKey().notNull(),
	topicId: integer("topic_id").notNull(),
	userId: integer("user_id"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	viewedAt: timestamp("viewed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_forum_views_topic_id").using("btree", table.topicId.asc().nullsLast().op("int4_ops")),
	index("idx_forum_views_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("idx_forum_views_viewed_at").using("btree", table.viewedAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [forumTopics.id],
			name: "forum_views_topic_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "forum_views_user_id_fkey"
		}),
	pgPolicy("forum_views_read_policy", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("forum_views_insert_policy", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const forumStats = pgTable("forum_stats", {
	id: serial().primaryKey().notNull(),
	totalTopics: integer("total_topics").default(0).notNull(),
	totalPosts: integer("total_posts").default(0).notNull(),
	totalMembers: integer("total_members").default(0).notNull(),
	onlineNow: integer("online_now").default(0).notNull(),
	lastUpdate: timestamp("last_update", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	pgPolicy("forum_stats_read_policy", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("forum_stats_admin_policy", { as: "permissive", for: "all", to: ["public"] }),
]);

export const migrations = pgTable("migrations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("migrations_name_key").on(table.name),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text().default('candidate').notNull(),
	status: text().default('active').notNull(),
	departmentId: integer("department_id"),
	secondaryDepartmentId: integer("secondary_department_id"),
	rank: text(),
	division: text(),
	qualifications: text().array().default([""]),
	gameWarnings: integer("game_warnings").default(0).notNull(),
	adminWarnings: integer("admin_warnings").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	authId: uuid("auth_id"),
	cadToken: text("cad_token"),
	discordId: text("discord_id"),
	discordUsername: text("discord_username"),
	discordAccessToken: text("discord_access_token"),
	discordRefreshToken: text("discord_refresh_token"),
}, (table) => [
	uniqueIndex("users_auth_id_idx").using("btree", table.authId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("users_auth_id_key").using("btree", table.authId.asc().nullsLast().op("uuid_ops")),
	index("users_department_id_idx").using("btree", table.departmentId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("users_discord_id_key").using("btree", table.discordId.asc().nullsLast().op("text_ops")),
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_secondary_department_id_idx").using("btree", table.secondaryDepartmentId.asc().nullsLast().op("int4_ops")),
	index("users_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.authId],
			foreignColumns: [table.id],
			name: "users_auth_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "users_department_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.secondaryDepartmentId],
			foreignColumns: [departments.id],
			name: "users_secondary_department_id_fkey"
		}),
	unique("users_username_key").on(table.username),
	unique("users_email_key").on(table.email),
	unique("users_auth_id_unique").on(table.authId),
	unique("users_cad_token_key").on(table.cadToken),
	unique("users_cad_token_unique").on(table.cadToken),
	unique("users_discord_id_unique").on(table.discordId),
	pgPolicy("Users can update their own profile", { as: "permissive", for: "update", to: ["public"], using: sql`(auth.uid() = auth_id)` }),
	pgPolicy("Users can view their own profile", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Users can read own data or non-candidate data", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Non-guest users can update own data", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Admins can access all users", { as: "permissive", for: "all", to: ["public"] }),
]);

export const achievements = pgTable("achievements", {
	id: integer(),
	name: text(),
	description: text(),
	icon: text(),
	category: text(),
	points: integer(),
	requirements: jsonb(),
	isHidden: boolean("is_hidden"),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	uniqueIndex("achievements_pkey").using("btree", table.id.asc().nullsLast().op("int4_ops")),
]);

export const badges = pgTable("badges", {
	id: integer(),
	name: text(),
	description: text(),
	icon: text(),
	rarity: text(),
	category: text(),
	requirements: jsonb(),
	isActive: boolean("is_active"),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	uniqueIndex("badges_pkey").using("btree", table.id.asc().nullsLast().op("int4_ops")),
]);

export const jointPositionsHistory = pgTable("joint_positions_history", {
	id: integer(),
	userId: integer("user_id"),
	primaryDepartmentId: integer("primary_department_id"),
	secondaryDepartmentId: integer("secondary_department_id"),
	status: text(),
	startDate: date("start_date"),
	endDate: date("end_date"),
	reason: text(),
	approvedBy: integer("approved_by"),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	removedBy: integer("removed_by"),
	removedAt: timestamp("removed_at", { mode: 'string' }),
	removalReason: text("removal_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	uniqueIndex("joint_positions_history_pkey").using("btree", table.id.asc().nullsLast().op("int4_ops")),
]);

export const userAchievements = pgTable("user_achievements", {
	id: integer(),
	userId: integer("user_id"),
	achievementId: integer("achievement_id"),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }),
	progress: integer(),
	isCompleted: boolean("is_completed"),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	uniqueIndex("user_achievements_pkey").using("btree", table.id.asc().nullsLast().op("int4_ops")),
]);

export const userBadges = pgTable("user_badges", {
	id: integer(),
	userId: integer("user_id"),
	badgeId: integer("badge_id"),
	awardedAt: timestamp("awarded_at", { mode: 'string' }),
	awardedBy: integer("awarded_by"),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	uniqueIndex("user_badges_pkey").using("btree", table.id.asc().nullsLast().op("int4_ops")),
]);

export const userStats = pgTable("user_stats", {
	id: integer(),
	userId: integer("user_id"),
	applicationsSubmitted: integer("applications_submitted"),
	applicationsApproved: integer("applications_approved"),
	reportsSubmitted: integer("reports_submitted"),
	reportsApproved: integer("reports_approved"),
	complaintsSubmitted: integer("complaints_submitted"),
	daysActive: integer("days_active"),
	totalPoints: integer("total_points"),
	level: integer(),
	experience: integer(),
	lastActivity: timestamp("last_activity", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	uniqueIndex("user_stats_pkey").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	uniqueIndex("user_stats_user_id_unique").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
]);
