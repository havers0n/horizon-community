import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    username?: string;
    password?: string;
}, {
    email?: string;
    username?: string;
    password?: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
}, {
    email?: string;
    password?: string;
}>;
export declare const applicationSchema: z.ZodObject<{
    departmentId: z.ZodString;
    position: z.ZodString;
    experience: z.ZodString;
    motivation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    experience?: string;
    position?: string;
    departmentId?: string;
    motivation?: string;
}, {
    experience?: string;
    position?: string;
    departmentId?: string;
    motivation?: string;
}>;
export declare const entryApplicationSchema: z.ZodObject<{
    fullName: z.ZodString;
    birthDate: z.ZodString;
    departmentId: z.ZodNumber;
    departmentDescription: z.ZodString;
    motivation: z.ZodString;
    hasMicrophone: z.ZodBoolean;
    meetsSystemRequirements: z.ZodBoolean;
    systemRequirementsLink: z.ZodOptional<z.ZodString>;
    sourceOfInformation: z.ZodString;
    inOtherCommunities: z.ZodBoolean;
    wasInOtherCommunities: z.ZodBoolean;
    otherCommunitiesDetails: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    departmentId?: number;
    motivation?: string;
    fullName?: string;
    birthDate?: string;
    departmentDescription?: string;
    hasMicrophone?: boolean;
    meetsSystemRequirements?: boolean;
    systemRequirementsLink?: string;
    sourceOfInformation?: string;
    inOtherCommunities?: boolean;
    wasInOtherCommunities?: boolean;
    otherCommunitiesDetails?: string;
}, {
    departmentId?: number;
    motivation?: string;
    fullName?: string;
    birthDate?: string;
    departmentDescription?: string;
    hasMicrophone?: boolean;
    meetsSystemRequirements?: boolean;
    systemRequirementsLink?: string;
    sourceOfInformation?: string;
    inOtherCommunities?: boolean;
    wasInOtherCommunities?: boolean;
    otherCommunitiesDetails?: string;
}>;
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ApplicationData = z.infer<typeof applicationSchema>;
export type EntryApplicationData = z.infer<typeof entryApplicationSchema>;
export * from './schemas';
export * from './types';
export type { User, Department, Application, ReportTemplate, Report, FilledReport } from './types';
