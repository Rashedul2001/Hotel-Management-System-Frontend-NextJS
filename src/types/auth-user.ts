export interface AuthUser {
  id: string;
  fullName: string;
  email: string | null;
  profilePictureUrl:string|null;
  roles: string[];
}
