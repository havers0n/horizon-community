// ===========================================
// ОСНОВНЫЕ ТИПЫ СУЩНОСТЕЙ
// ===========================================

// Пользователь
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertUser {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateUser {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  avatarUrl?: string;
  isActive?: boolean;
  isVerified?: boolean;
  lastLoginAt?: string;
}

// Персонаж
export interface Character {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  address: string;
  phoneNumber: string;
  email?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertCharacter {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  address: string;
  phoneNumber: string;
  email?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface UpdateCharacter {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

// Департамент
export interface Department {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertDepartment {
  name: string;
  description: string;
  color: string;
  isActive?: boolean;
}

export interface UpdateDepartment {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

// Ранг
export interface Rank {
  id: string;
  departmentId: string;
  name: string;
  level: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertRank {
  departmentId: string;
  name: string;
  level: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateRank {
  departmentId?: string;
  name?: string;
  level?: number;
  description?: string;
  isActive?: boolean;
}

// Подразделение
export interface Division {
  id: string;
  departmentId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertDivision {
  departmentId: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDivision {
  departmentId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Квалификация
export interface Qualification {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertQualification {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateQualification {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Юнит
export interface Unit {
  id: string;
  departmentId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertUnit {
  departmentId: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateUnit {
  departmentId?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Квалификация персонажа
export interface CharacterQualification {
  id: string;
  characterId: string;
  qualificationId: string;
  issuedAt: string;
  expiresAt?: string;
  issuedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertCharacterQualification {
  characterId: string;
  qualificationId: string;
  issuedAt: string;
  expiresAt?: string;
  issuedBy: string;
  isActive?: boolean;
}

export interface UpdateCharacterQualification {
  qualificationId?: string;
  issuedAt?: string;
  expiresAt?: string;
  issuedBy?: string;
  isActive?: boolean;
}

// История карьеры персонажа
export interface CharacterCareerHistory {
  id: string;
  characterId: string;
  departmentId: string;
  rankId: string;
  divisionId?: string;
  unitId?: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertCharacterCareerHistory {
  characterId: string;
  departmentId: string;
  rankId: string;
  divisionId?: string;
  unitId?: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  isActive?: boolean;
}

export interface UpdateCharacterCareerHistory {
  departmentId?: string;
  rankId?: string;
  divisionId?: string;
  unitId?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  isActive?: boolean;
}

// Транспортное средство
export interface Vehicle {
  id: string;
  characterId: string;
  plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertVehicle {
  characterId: string;
  plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  isActive?: boolean;
}

export interface UpdateVehicle {
  plate?: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  registrationExpiry?: string;
  insuranceExpiry?: string;
  isActive?: boolean;
}

// Оружие
export interface Weapon {
  id: string;
  characterId: string;
  serialNumber: string;
  type: string;
  make: string;
  model: string;
  caliber?: string;
  licenseExpiry: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertWeapon {
  characterId: string;
  serialNumber: string;
  type: string;
  make: string;
  model: string;
  caliber?: string;
  licenseExpiry: string;
  isActive?: boolean;
}

export interface UpdateWeapon {
  serialNumber?: string;
  type?: string;
  make?: string;
  model?: string;
  caliber?: string;
  licenseExpiry?: string;
  isActive?: boolean;
}

// Питомец
export interface Pet {
  id: string;
  characterId: string;
  name: string;
  type: string;
  breed?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertPet {
  characterId: string;
  name: string;
  type: string;
  breed?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  isActive?: boolean;
}

export interface UpdatePet {
  name?: string;
  type?: string;
  breed?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  isActive?: boolean;
}

// Запись (Record)
export interface Record {
  id: string;
  characterId: string;
  type: 'arrest' | 'warning' | 'citation' | 'medical' | 'other';
  title: string;
  description: string;
  date: string;
  location?: string;
  officerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertRecord {
  characterId: string;
  type: 'arrest' | 'warning' | 'citation' | 'medical' | 'other';
  title: string;
  description: string;
  date: string;
  location?: string;
  officerId?: string;
  isActive?: boolean;
}

export interface UpdateRecord {
  type?: 'arrest' | 'warning' | 'citation' | 'medical' | 'other';
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  officerId?: string;
  isActive?: boolean;
}

// Вызов 911
export interface Call911 {
  id: string;
  callerName: string;
  callerPhone: string;
  location: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'cancelled';
  assignedUnits: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InsertCall911 {
  callerName: string;
  callerPhone: string;
  location: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status?: 'pending' | 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'cancelled';
  assignedUnits?: string[];
}

export interface UpdateCall911 {
  callerName?: string;
  callerPhone?: string;
  location?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  status?: 'pending' | 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'cancelled';
  assignedUnits?: string[];
}

// Активный юнит
export interface ActiveUnit {
  id: string;
  characterId: string;
  unitId: string;
  status: UnitStatus;
  location?: string;
  callId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertActiveUnit {
  characterId: string;
  unitId: string;
  status: UnitStatus;
  location?: string;
  callId?: string;
  isActive?: boolean;
}

export interface UpdateActiveUnit {
  unitId?: string;
  status?: UnitStatus;
  location?: string;
  callId?: string;
  isActive?: boolean;
}

// Вложение к вызову
export interface CallAttachment {
  id: string;
  callId: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  filename: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export interface InsertCallAttachment {
  callId: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  filename: string;
  size: number;
  uploadedBy: string;
}

// Заявка
export interface Application {
  id: string;
  userId: string;
  departmentId: string;
  rankId: string;
  divisionId?: string;
  unitId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertApplication {
  userId: string;
  departmentId: string;
  rankId: string;
  divisionId?: string;
  unitId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'under_review';
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface UpdateApplication {
  departmentId?: string;
  rankId?: string;
  divisionId?: string;
  unitId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'under_review';
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// Тикет поддержки
export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertSupportTicket {
  userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolvedAt?: string;
}

export interface UpdateSupportTicket {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolvedAt?: string;
}

// Жалоба
export interface Complaint {
  id: string;
  userId: string;
  targetUserId: string;
  title: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertComplaint {
  userId: string;
  targetUserId: string;
  title: string;
  description: string;
  status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface UpdateComplaint {
  title?: string;
  description?: string;
  status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
}

// Отчет
export interface Report {
  id: string;
  authorId: string;
  title: string;
  content: string;
  type: ReportType;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertReport {
  authorId: string;
  title: string;
  content: string;
  type: ReportType;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface UpdateReport {
  title?: string;
  content?: string;
  type?: ReportType;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}

// Шаблон отчета
export interface ReportTemplate {
  id: string;
  name: string;
  content: string;
  type: ReportType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertReportTemplate {
  name: string;
  content: string;
  type: ReportType;
  isActive?: boolean;
}

export interface UpdateReportTemplate {
  name?: string;
  content?: string;
  type?: ReportType;
  isActive?: boolean;
}

// Заполненный отчет
export interface FilledReport {
  id: string;
  templateId: string;
  authorId: string;
  data: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface InsertFilledReport {
  templateId: string;
  authorId: string;
  data: { [key: string]: any };
}

export interface UpdateFilledReport {
  templateId?: string;
  data?: { [key: string]: any };
}

// Уведомление
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface InsertNotification {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead?: boolean;
  readAt?: string;
}

export interface UpdateNotification {
  title?: string;
  message?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  isRead?: boolean;
  readAt?: string;
}

// Тест
export interface Test {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  questions: TestQuestion[];
  passingScore: number;
  timeLimit?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface InsertTest {
  title: string;
  description: string;
  departmentId: string;
  questions: TestQuestion[];
  passingScore: number;
  timeLimit?: number;
  isActive?: boolean;
}

export interface UpdateTest {
  title?: string;
  description?: string;
  departmentId?: string;
  questions?: TestQuestion[];
  passingScore?: number;
  timeLimit?: number;
  isActive?: boolean;
}

// Сессия теста
export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  score?: number;
  passed?: boolean;
  answers: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface InsertTestSession {
  testId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  score?: number;
  passed?: boolean;
  answers?: { [key: string]: any };
}

export interface UpdateTestSession {
  endTime?: string;
  score?: number;
  passed?: boolean;
  answers?: { [key: string]: any };
}

// История совместных позиций
export interface JointPositionHistory {
  id: string;
  characterId: string;
  position: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertJointPositionHistory {
  characterId: string;
  position: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  isActive?: boolean;
}

export interface UpdateJointPositionHistory {
  position?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  isActive?: boolean;
}

// Результат теста
export interface TestResult {
  id: string;
  sessionId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
  createdAt: string;
}

export interface InsertTestResult {
  sessionId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
}

// Достижение
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertAchievement {
  name: string;
  description: string;
  icon: string;
  points: number;
  isActive?: boolean;
}

export interface UpdateAchievement {
  name?: string;
  description?: string;
  icon?: string;
  points?: number;
  isActive?: boolean;
}

// Достижение пользователя
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  createdAt: string;
}

export interface InsertUserAchievement {
  userId: string;
  achievementId: string;
  earnedAt: string;
}

// Значок
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertBadge {
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive?: boolean;
}

export interface UpdateBadge {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

// Значок пользователя
export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  createdAt: string;
}

export interface InsertUserBadge {
  userId: string;
  badgeId: string;
  earnedAt: string;
}

// Статистика пользователя
export interface UserStats {
  id: string;
  userId: string;
  totalReports: number;
  totalArrests: number;
  totalCitations: number;
  totalWarnings: number;
  totalMedicalCalls: number;
  totalPatrolHours: number;
  totalTrainingHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsertUserStats {
  userId: string;
  totalReports?: number;
  totalArrests?: number;
  totalCitations?: number;
  totalWarnings?: number;
  totalMedicalCalls?: number;
  totalPatrolHours?: number;
  totalTrainingHours?: number;
}

export interface UpdateUserStats {
  totalReports?: number;
  totalArrests?: number;
  totalCitations?: number;
  totalWarnings?: number;
  totalMedicalCalls?: number;
  totalPatrolHours?: number;
  totalTrainingHours?: number;
}

// ===========================================
// ФОРУМ ТИПЫ
// ===========================================

// Категория форума
export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertForumCategory {
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive?: boolean;
}

export interface UpdateForumCategory {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}

// Тема форума
export interface ForumTopic {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertForumTopic {
  categoryId: string;
  authorId: string;
  title: string;
  content: string;
  isPinned?: boolean;
  isLocked?: boolean;
  viewCount?: number;
  replyCount?: number;
  lastReplyAt?: string;
}

export interface UpdateForumTopic {
  categoryId?: string;
  title?: string;
  content?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  viewCount?: number;
  replyCount?: number;
  lastReplyAt?: string;
}

// Пост форума
export interface ForumPost {
  id: string;
  topicId: string;
  authorId: string;
  content: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertForumPost {
  topicId: string;
  authorId: string;
  content: string;
  isEdited?: boolean;
  editedAt?: string;
}

export interface UpdateForumPost {
  content?: string;
  isEdited?: boolean;
  editedAt?: string;
}

// Реакция на пост
export interface ForumReaction {
  id: string;
  postId: string;
  userId: string;
  type: 'like' | 'dislike' | 'love' | 'laugh' | 'angry';
  createdAt: string;
}

export interface InsertForumReaction {
  postId: string;
  userId: string;
  type: 'like' | 'dislike' | 'love' | 'laugh' | 'angry';
}

// Подписка на тему
export interface ForumSubscription {
  id: string;
  topicId: string;
  userId: string;
  createdAt: string;
}

export interface InsertForumSubscription {
  topicId: string;
  userId: string;
}

// Просмотр темы
export interface ForumView {
  id: string;
  topicId: string;
  userId: string;
  viewedAt: string;
}

export interface InsertForumView {
  topicId: string;
  userId: string;
  viewedAt: string;
}

// Статистика форума
export interface ForumStats {
  id: string;
  totalTopics: number;
  totalPosts: number;
  totalUsers: number;
  totalViews: number;
  updatedAt: string;
}

export interface InsertForumStats {
  totalTopics?: number;
  totalPosts?: number;
  totalUsers?: number;
  totalViews?: number;
}

export interface UpdateForumStats {
  totalTopics?: number;
  totalPosts?: number;
  totalUsers?: number;
  totalViews?: number;
}

// ===========================================
// ДАННЫЕ ДЛЯ API
// ===========================================

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateCharacterData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  address: string;
  phoneNumber: string;
  email?: string;
}

export interface UpdateCharacterData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
}

export interface CreateVehicleData {
  plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  registrationExpiry: string;
  insuranceExpiry: string;
}

export interface CreateWeaponData {
  serialNumber: string;
  type: string;
  make: string;
  model: string;
  caliber?: string;
  licenseExpiry: string;
}

export interface CreateCall911Data {
  callerName: string;
  callerPhone: string;
  location: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
}

export interface GoOnDutyData {
  unitId: string;
  status: UnitStatus;
  location?: string;
}

export interface UpdateUnitStatusData {
  status: UnitStatus;
  location?: string;
  callId?: string;
}

export interface EntryApplicationData {
  departmentId: string;
  rankId: string;
  divisionId?: string;
  unitId?: string;
  reason?: string;
}

export interface CreateUserData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  avatarUrl?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

// ===========================================
// РОЛИ ПОЛЬЗОВАТЕЛЕЙ (Единый источник истины)
// ===========================================

// Экспортируем все из централизованного файла ролей
export * from './roles';

// Для обратной совместимости с MDT Client
export enum UserRole {
  CITIZEN = 'Citizen',
  LEO = 'LEO',
  EMS_FD = 'EMS/FD',
  DISPATCH = 'Dispatch',
  ADMIN = 'Admin',
}

export enum UnitStatus {
  AVAILABLE = '10-8 (Available)',
  BUSY = '10-6 (Busy)',
  EN_ROUTE = '10-76 (En Route)',
  ON_SCENE = '10-97 (On Scene)',
  UNAVAILABLE = '10-7 (Out of Service)',
  PANIC = '10-33 (PANIC)',
  EN_ROUTE_TO_HOSPITAL = 'En Route to Hospital',
  AT_HOSPITAL = 'At Hospital',
  AWAITING_PATIENT = 'Awaiting Patient',
}

export type ReportType = 'Arrest' | 'Medical' | 'Incident';

// MDT Client interfaces
export interface MedicalInfo {
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  notes?: string;
}

export interface Citizen {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  imageUrl: string;
  gender?: string;
  height?: string;
  weight?: string;
  occupation?: string;
  medicalInfo?: MedicalInfo;
}

export interface Bolo {
  id: string;
  description: string;
  type: 'PERSON' | 'VEHICLE';
  timestamp: string;
}

// MDT Client specific Vehicle interface (different from shared-schema Vehicle)
export interface MDTVehicle {
  id: string;
  ownerId: string;
  plate: string;
  vin: string;
  model: string;
  color: string;
  registration: string;
  insurance: string;
}

// MDT System Types
export interface MDTUnit {
  id: string;
  unitNumber: string;
  departmentId: number;
  departmentName?: string;
  status: string;
  location?: {
    x: number;
    y: number;
    z: number;
  };
  currentCallId?: number;
  partnerId?: number;
  vehicleId?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  isPanic: boolean;
  lastUpdate: string;
  createdAt: string;
  characterId?: number;
  firstName?: string;
  lastName?: string;
  badgeNumber?: string;
  callsign?: string;
}

export interface MDTCall911 {
  id: string;
  callerName?: string;
  callerPhone?: string;
  location: string;
  description: string;
  type: 'police' | 'fire' | 'ems';
  priority: number;
  status: string;
  assignedUnits?: number[];
  patientInfo?: any;
  fireInfo?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Signal {
  id: string;
  title: string;
  description: string;
  type: 'LEO' | 'EMS_FD';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  coordinates?: {
    x: number;
    y: number;
    z: number;
  };
  isActive: boolean;
  expiresAt?: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SignalNotification {
  id: string;
  signalId: string;
  userId: number;
  isRead: boolean;
  createdAt: string;
}

export interface Location {
  x: number;
  y: number;
  z: number;
}

// Create/Update Data Types
export interface CreateUnitData {
  characterId: number;
  unitNumber: string;
  departmentId: number;
  status?: string;
  location?: Location;
  vehicleId?: number;
}

export interface UpdateUnitData {
  unitNumber?: string;
  departmentId?: number;
  status?: string;
  location?: Location;
  vehicleId?: number;
}

export interface CreateCallData {
  callerName?: string;
  callerPhone?: string;
  location: string;
  description: string;
  type: 'police' | 'fire' | 'ems';
  priority?: number;
  status?: string;
  patientInfo?: any;
  fireInfo?: any;
  authorId: number;
}

export interface UpdateCallData {
  callerName?: string;
  callerPhone?: string;
  location?: string;
  description?: string;
  type?: 'police' | 'fire' | 'ems';
  priority?: number;
  status?: string;
  patientInfo?: any;
  fireInfo?: any;
}

export interface CreateSignalData {
  title: string;
  description: string;
  type: 'LEO' | 'EMS_FD';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  coordinates?: Location;
  isActive?: boolean;
  expiresAt?: string;
  authorId: number;
}

export interface UpdateSignalData {
  title?: string;
  description?: string;
  type?: 'LEO' | 'EMS_FD';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  coordinates?: Location;
  isActive?: boolean;
  expiresAt?: string;
}

export interface IncidentEvent {
  id: string;
  timestamp: string;
  description: string;
}

export interface Incident {
  id: string;
  title: string;
  events: IncidentEvent[];
  involvedUnits: string[];
  involvedCitizens: string[];
}

export interface PenalCode {
  id: string;
  title: string;
  description: string;
  fine: number;
  jailTime: number;
}

// MDT Client specific Report interface (different from shared-schema Report)
export interface MDTReport {
  id: string;
  title: string;
  author: string; 
  timestamp: string;
  content: string;
  type: ReportType;
}

export interface ReportTemplate {
  title: string;
  content: string;
  type: ReportType;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket Types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

export interface WebSocketEvent {
  type: 'connect' | 'disconnect' | 'message' | 'error';
  data?: any;
}

// Stats Types
export interface Stats {
  totalUsers: number;
  totalDepartments: number;
  totalReports: number;
  totalApplications: number;
} 