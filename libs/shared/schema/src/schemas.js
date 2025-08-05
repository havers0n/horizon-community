import { z } from 'zod';
// Схема профиля пользователя
export const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
});
// Схема обновления пароля
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
// Схема поиска
export const searchSchema = z.object({
    query: z.string().min(1, 'Search query is required'),
    filters: z.record(z.any()).optional()
});
//# sourceMappingURL=schemas.js.map