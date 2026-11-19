import { apiFetch } from "@/lib/api";

export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  roles: string[];
  departmentId?: string | null;
  departmentName?: string | null;
  departmentCode?: string | null;
  linkedStaffId?: string | null;
  linkedStaffCode?: string | null;
  designationTitle?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface ManagedUsersResponse {
  total: number;
  page: number;
  limit: number;
  items: ManagedUser[];
}

export interface CreateManagedUserInput {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  roles?: string[];
  departmentId?: string;
  linkedStaffId?: string;
  isActive?: boolean;
}

export interface UpdateManagedUserInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  departmentId?: string;
  linkedStaffId?: string;
  isActive?: boolean;
}

export interface RoleItem {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  usersCount: number;
  permissionsCount: number;
  permissions: string[];
}

export interface PermissionItem {
  key: string;
  label: string;
  category: string;
  description?: string;
}

export interface PermissionCategory {
  category: string;
  categoryLabel: string;
  permissions: PermissionItem[];
}

// -------------------------------------------------------------
// USER MANAGEMENT APIS
// -------------------------------------------------------------

export async function getManagedUsers(params?: {
  search?: string;
  role?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}): Promise<ManagedUsersResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.role) query.set("role", params.role);
  if (params?.departmentId) query.set("departmentId", params.departmentId);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());

  const res = await apiFetch(`/api/users-management?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch system users (${res.status})`);
  }
  return res.json();
}

export async function getManagedUserById(id: string): Promise<ManagedUser> {
  const res = await apiFetch(`/api/users-management/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user (${res.status})`);
  }
  return res.json();
}

export async function createManagedUser(data: CreateManagedUserInput): Promise<{ message: string; id: string; email: string }> {
  const res = await apiFetch("/api/users-management", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create user (${res.status})`);
  }
  return res.json();
}

export async function updateManagedUser(id: string, data: UpdateManagedUserInput): Promise<{ message: string }> {
  const res = await apiFetch(`/api/users-management/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update user (${res.status})`);
  }
  return res.json();
}

export async function assignUserRoles(id: string, roles: string[]): Promise<{ message: string }> {
  const res = await apiFetch(`/api/users-management/${id}/roles`, {
    method: "POST",
    body: JSON.stringify({ roles }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to assign roles (${res.status})`);
  }
  return res.json();
}

export async function assignUserDepartment(id: string, departmentId?: string | null): Promise<{ message: string }> {
  const res = await apiFetch(`/api/users-management/${id}/department`, {
    method: "POST",
    body: JSON.stringify({ departmentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to assign department (${res.status})`);
  }
  return res.json();
}

export async function resetUserPassword(id: string, newPassword: string): Promise<{ message: string }> {
  const res = await apiFetch(`/api/users-management/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to reset password (${res.status})`);
  }
  return res.json();
}

export async function toggleUserStatus(id: string, isActive: boolean): Promise<{ message: string; isActive: boolean }> {
  const res = await apiFetch(`/api/users-management/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update status (${res.status})`);
  }
  return res.json();
}

export async function deleteManagedUser(id: string): Promise<{ message: string }> {
  const res = await apiFetch(`/api/users-management/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete user (${res.status})`);
  }
  return res.json();
}

// -------------------------------------------------------------
// ROLES & PERMISSIONS APIS
// -------------------------------------------------------------

export async function getRoles(): Promise<RoleItem[]> {
  const res = await apiFetch("/api/roles");
  if (!res.ok) {
    throw new Error(`Failed to fetch roles (${res.status})`);
  }
  return res.json();
}

export async function createRole(data: { name: string; description?: string; permissions?: string[] }): Promise<{ message: string; id: string }> {
  const res = await apiFetch("/api/roles", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create role (${res.status})`);
  }
  return res.json();
}

export async function updateRole(id: string, data: { name: string; description?: string }): Promise<{ message: string }> {
  const res = await apiFetch(`/api/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update role (${res.status})`);
  }
  return res.json();
}

export async function deleteRole(id: string): Promise<{ message: string }> {
  const res = await apiFetch(`/api/roles/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete role (${res.status})`);
  }
  return res.json();
}

export async function getRolePermissions(roleName: string): Promise<string[]> {
  const res = await apiFetch(`/api/roles/${encodeURIComponent(roleName)}/permissions`);
  if (!res.ok) {
    throw new Error(`Failed to fetch role permissions (${res.status})`);
  }
  return res.json();
}

export async function updateRolePermissions(roleName: string, permissions: string[]): Promise<{ message: string; count: number }> {
  const res = await apiFetch(`/api/roles/${encodeURIComponent(roleName)}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissions }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update permissions (${res.status})`);
  }
  return res.json();
}

export async function getPermissionsCatalog(): Promise<PermissionCategory[]> {
  const res = await apiFetch("/api/roles/permissions-catalog");
  if (!res.ok) {
    throw new Error(`Failed to fetch permissions catalog (${res.status})`);
  }
  return res.json();
}
