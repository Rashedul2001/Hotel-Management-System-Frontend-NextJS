export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  ADMIN: "Admin",
  STAFF: "Staff",
  USER: "User",
  GUEST: "Guest",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
