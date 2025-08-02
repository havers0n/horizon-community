import { z } from 'zod';

// Схема регистрации пользователя
export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Схема входа пользователя
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Схема заявки
export const applicationSchema = z.object({
  departmentId: z.string(),
  position: z.string(),
  experience: z.string(),
  motivation: z.string()
});

// Схема заявки на вступление
export const entryApplicationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  departmentId: z.number().min(1, 'Department is required'),
  departmentDescription: z.string().min(1, 'Department description is required'),
  motivation: z.string().min(10, 'Motivation must be at least 10 characters'),
  hasMicrophone: z.boolean(),
  meetsSystemRequirements: z.boolean(),
  systemRequirementsLink: z.string().optional(),
  sourceOfInformation: z.string().min(1, 'Source of information is required'),
  inOtherCommunities: z.boolean(),
  wasInOtherCommunities: z.boolean(),
  otherCommunitiesDetails: z.string().optional()
});

// Типы данных
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ApplicationData = z.infer<typeof applicationSchema>;
export type EntryApplicationData = z.infer<typeof entryApplicationSchema>;

// Экспорт всех схем
export * from './schemas';

// Экспорт всех типов
export * from './types'; 