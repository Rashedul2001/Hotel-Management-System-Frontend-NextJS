export interface AuthUser {
  id: string;
  fullName: string;
  email: string | null;
  roles: string[];
}
