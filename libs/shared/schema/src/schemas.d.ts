import { z } from 'zod';
export declare const profileSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
}, {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
}>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}, {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}>, {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}, {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}>;
export declare const searchSchema: z.ZodObject<{
    query: z.ZodString;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    query?: string;
    filters?: Record<string, any>;
}, {
    query?: string;
    filters?: Record<string, any>;
}>;
export type ProfileData = z.infer<typeof profileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type SearchData = z.infer<typeof searchSchema>;
