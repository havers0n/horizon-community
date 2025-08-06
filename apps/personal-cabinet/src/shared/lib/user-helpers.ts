import { User } from '@/entities/user';

export const getUserInitials = (user: User) => {
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";
  return first + last || user.email?.[0]?.toUpperCase() || "U";
};

export const isCandidate = (user: User) => {
  return ["candidate", "cadet_test", "cadet_practice"].includes(user.role || "");
}; 