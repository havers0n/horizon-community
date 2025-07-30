import { relations } from "drizzle-orm/relations";
import { users, supportTickets, complaints, notifications, applications, mdtBolos, testSessions, tests, testResults, departmentsInCommon, forumCategories, forumTopics, forumPosts, forumReactions, forumSubscriptions, forumViews, usersInAuth } from "./schema";

export const supportTicketsRelations = relations(supportTickets, ({one}) => ({
	user_authorId: one(users, {
		fields: [supportTickets.authorId],
		references: [users.id],
		relationName: "supportTickets_authorId_users_id"
	}),
	user_handlerId: one(users, {
		fields: [supportTickets.handlerId],
		references: [users.id],
		relationName: "supportTickets_handlerId_users_id"
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	supportTickets_authorId: many(supportTickets, {
		relationName: "supportTickets_authorId_users_id"
	}),
	supportTickets_handlerId: many(supportTickets, {
		relationName: "supportTickets_handlerId_users_id"
	}),
	complaints: many(complaints),
	notifications: many(notifications),
	applications_authorId: many(applications, {
		relationName: "applications_authorId_users_id"
	}),
	applications_reviewerId: many(applications, {
		relationName: "applications_reviewerId_users_id"
	}),
	mdtBolos: many(mdtBolos),
	testSessions: many(testSessions),
	testResults: many(testResults),
	forumTopics_authorId: many(forumTopics, {
		relationName: "forumTopics_authorId_users_id"
	}),
	forumTopics_lastPostAuthorId: many(forumTopics, {
		relationName: "forumTopics_lastPostAuthorId_users_id"
	}),
	forumPosts_authorId: many(forumPosts, {
		relationName: "forumPosts_authorId_users_id"
	}),
	forumPosts_editedBy: many(forumPosts, {
		relationName: "forumPosts_editedBy_users_id"
	}),
	forumReactions: many(forumReactions),
	forumSubscriptions: many(forumSubscriptions),
	forumViews: many(forumViews),
	usersInAuth: one(usersInAuth, {
		fields: [users.authId],
		references: [usersInAuth.id]
	}),
	departmentsInCommon_departmentId: one(departmentsInCommon, {
		fields: [users.departmentId],
		references: [departmentsInCommon.id],
		relationName: "users_departmentId_departmentsInCommon_id"
	}),
	departmentsInCommon_secondaryDepartmentId: one(departmentsInCommon, {
		fields: [users.secondaryDepartmentId],
		references: [departmentsInCommon.id],
		relationName: "users_secondaryDepartmentId_departmentsInCommon_id"
	}),
}));

export const complaintsRelations = relations(complaints, ({one}) => ({
	user: one(users, {
		fields: [complaints.authorId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.recipientId],
		references: [users.id]
	}),
}));

export const applicationsRelations = relations(applications, ({one, many}) => ({
	user_authorId: one(users, {
		fields: [applications.authorId],
		references: [users.id],
		relationName: "applications_authorId_users_id"
	}),
	user_reviewerId: one(users, {
		fields: [applications.reviewerId],
		references: [users.id],
		relationName: "applications_reviewerId_users_id"
	}),
	testSessions: many(testSessions),
	testResults: many(testResults),
}));

export const mdtBolosRelations = relations(mdtBolos, ({one}) => ({
	user: one(users, {
		fields: [mdtBolos.issuedBy],
		references: [users.id]
	}),
}));

export const testSessionsRelations = relations(testSessions, ({one, many}) => ({
	application: one(applications, {
		fields: [testSessions.applicationId],
		references: [applications.id]
	}),
	test: one(tests, {
		fields: [testSessions.testId],
		references: [tests.id]
	}),
	user: one(users, {
		fields: [testSessions.userId],
		references: [users.id]
	}),
	testResults: many(testResults),
}));

export const testsRelations = relations(tests, ({many}) => ({
	testSessions: many(testSessions),
	testResults: many(testResults),
}));

export const testResultsRelations = relations(testResults, ({one}) => ({
	application: one(applications, {
		fields: [testResults.applicationId],
		references: [applications.id]
	}),
	testSession: one(testSessions, {
		fields: [testResults.sessionId],
		references: [testSessions.id]
	}),
	test: one(tests, {
		fields: [testResults.testId],
		references: [tests.id]
	}),
	user: one(users, {
		fields: [testResults.userId],
		references: [users.id]
	}),
}));

export const forumCategoriesRelations = relations(forumCategories, ({one, many}) => ({
	departmentsInCommon: one(departmentsInCommon, {
		fields: [forumCategories.departmentId],
		references: [departmentsInCommon.id]
	}),
	forumTopics: many(forumTopics),
}));

export const departmentsInCommonRelations = relations(departmentsInCommon, ({many}) => ({
	forumCategories: many(forumCategories),
	users_departmentId: many(users, {
		relationName: "users_departmentId_departmentsInCommon_id"
	}),
	users_secondaryDepartmentId: many(users, {
		relationName: "users_secondaryDepartmentId_departmentsInCommon_id"
	}),
}));

export const forumTopicsRelations = relations(forumTopics, ({one, many}) => ({
	user_authorId: one(users, {
		fields: [forumTopics.authorId],
		references: [users.id],
		relationName: "forumTopics_authorId_users_id"
	}),
	forumCategory: one(forumCategories, {
		fields: [forumTopics.categoryId],
		references: [forumCategories.id]
	}),
	user_lastPostAuthorId: one(users, {
		fields: [forumTopics.lastPostAuthorId],
		references: [users.id],
		relationName: "forumTopics_lastPostAuthorId_users_id"
	}),
	forumPosts: many(forumPosts),
	forumSubscriptions: many(forumSubscriptions),
	forumViews: many(forumViews),
}));

export const forumPostsRelations = relations(forumPosts, ({one, many}) => ({
	user_authorId: one(users, {
		fields: [forumPosts.authorId],
		references: [users.id],
		relationName: "forumPosts_authorId_users_id"
	}),
	user_editedBy: one(users, {
		fields: [forumPosts.editedBy],
		references: [users.id],
		relationName: "forumPosts_editedBy_users_id"
	}),
	forumPost: one(forumPosts, {
		fields: [forumPosts.parentId],
		references: [forumPosts.id],
		relationName: "forumPosts_parentId_forumPosts_id"
	}),
	forumPosts: many(forumPosts, {
		relationName: "forumPosts_parentId_forumPosts_id"
	}),
	forumTopic: one(forumTopics, {
		fields: [forumPosts.topicId],
		references: [forumTopics.id]
	}),
	forumReactions: many(forumReactions),
}));

export const forumReactionsRelations = relations(forumReactions, ({one}) => ({
	forumPost: one(forumPosts, {
		fields: [forumReactions.postId],
		references: [forumPosts.id]
	}),
	user: one(users, {
		fields: [forumReactions.userId],
		references: [users.id]
	}),
}));

export const forumSubscriptionsRelations = relations(forumSubscriptions, ({one}) => ({
	forumTopic: one(forumTopics, {
		fields: [forumSubscriptions.topicId],
		references: [forumTopics.id]
	}),
	user: one(users, {
		fields: [forumSubscriptions.userId],
		references: [users.id]
	}),
}));

export const forumViewsRelations = relations(forumViews, ({one}) => ({
	forumTopic: one(forumTopics, {
		fields: [forumViews.topicId],
		references: [forumTopics.id]
	}),
	user: one(users, {
		fields: [forumViews.userId],
		references: [users.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	users: many(users),
}));