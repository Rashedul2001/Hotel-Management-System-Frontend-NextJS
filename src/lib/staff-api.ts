import { apiFetch } from "@/lib/api";

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  headOfDepartment?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  budget?: number | null;
  isActive: boolean;
  staffCount: number;
  designationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  title: string;
  departmentId?: string | null;
  departmentName?: string | null;
  level?: string | null;
  description?: string | null;
  baseSalary?: number | null;
  staffCount: number;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  staffCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  departmentCode?: string | null;
  designationId?: string | null;
  designationTitle?: string | null;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Intern" | "Seasonal" | string;
  status: "Active" | "On Leave" | "Probation" | "Suspended" | "Terminated" | string;
  hireDate: string;
  shift?: string | null;
  salary?: number | null;
  address?: string | null;
  notes?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffSummary {
  totalStaff: number;
  activeStaff: number;
  onLeaveStaff: number;
  probationStaff: number;
  totalDepartments: number;
  staffByDepartment: Record<string, number>;
  staffByShift: Record<string, number>;
}

export interface StaffListResponse {
  total: number;
  page: number;
  limit: number;
  items: StaffMember[];
}

export interface CreateStaffInput {
  staffCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  departmentId?: string;
  designationId?: string;
  employmentType?: string;
  status?: string;
  hireDate?: string;
  shift?: string;
  salary?: number;
  address?: string;
  notes?: string;
  userId?: string;
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  email?: string;
  phone?: string;
  location?: string;
  budget?: number;
  isActive?: boolean;
}

export interface CreateDesignationInput {
  title: string;
  departmentId?: string;
  level?: string;
  description?: string;
  baseSalary?: number;
}

// -------------------------------------------------------------
// STAFF APIS
// -------------------------------------------------------------

export async function getStaffList(params?: {
  search?: string;
  departmentId?: string;
  status?: string;
  employmentType?: string;
  shift?: string;
  page?: number;
  limit?: number;
}): Promise<StaffListResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.departmentId) query.set("departmentId", params.departmentId);
  if (params?.status) query.set("status", params.status);
  if (params?.employmentType) query.set("employmentType", params.employmentType);
  if (params?.shift) query.set("shift", params.shift);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());

  const res = await apiFetch(`/api/staff?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch staff members (${res.status})`);
  }
  return res.json();
}

export async function getStaffSummary(): Promise<StaffSummary> {
  const res = await apiFetch("/api/staff/summary");
  if (!res.ok) {
    throw new Error(`Failed to fetch staff summary (${res.status})`);
  }
  return res.json();
}

export async function getStaffById(id: string): Promise<StaffMember> {
  const res = await apiFetch(`/api/staff/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch staff member (${res.status})`);
  }
  return res.json();
}

export async function createStaff(data: CreateStaffInput): Promise<{ message: string; id: string; staffCode: string }> {
  const res = await apiFetch("/api/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create staff (${res.status})`);
  }
  return res.json();
}

export async function updateStaff(id: string, data: Partial<CreateStaffInput>): Promise<{ message: string }> {
  const res = await apiFetch(`/api/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update staff (${res.status})`);
  }
  return res.json();
}

export async function deleteStaff(id: string): Promise<{ message: string }> {
  const res = await apiFetch(`/api/staff/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete staff (${res.status})`);
  }
  return res.json();
}

export async function updateStaffStatus(id: string, status: string): Promise<{ message: string; status: string }> {
  const res = await apiFetch(`/api/staff/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update status (${res.status})`);
  }
  return res.json();
}

export async function updateStaffShift(id: string, shift: string): Promise<{ message: string; shift: string }> {
  const res = await apiFetch(`/api/staff/${id}/shift`, {
    method: "PATCH",
    body: JSON.stringify({ shift }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update shift (${res.status})`);
  }
  return res.json();
}

// -------------------------------------------------------------
// DEPARTMENTS APIS
// -------------------------------------------------------------

export async function getDepartments(): Promise<Department[]> {
  const res = await apiFetch("/api/departments");
  if (!res.ok) {
    throw new Error(`Failed to fetch departments (${res.status})`);
  }
  return res.json();
}

export async function getDepartmentById(id: string): Promise<Department & { staffMembers: StaffMember[]; designations: Designation[] }> {
  const res = await apiFetch(`/api/departments/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch department details (${res.status})`);
  }
  return res.json();
}

export async function createDepartment(data: CreateDepartmentInput): Promise<Department> {
  const res = await apiFetch("/api/departments", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create department (${res.status})`);
  }
  return res.json();
}

export async function updateDepartment(id: string, data: Partial<CreateDepartmentInput>): Promise<{ message: string }> {
  const res = await apiFetch(`/api/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update department (${res.status})`);
  }
  return res.json();
}

export async function deleteDepartment(id: string): Promise<{ message: string }> {
  const res = await apiFetch(`/api/departments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete department (${res.status})`);
  }
  return res.json();
}

// -------------------------------------------------------------
// DESIGNATIONS APIS
// -------------------------------------------------------------

export async function getDesignations(departmentId?: string): Promise<Designation[]> {
  const url = departmentId ? `/api/departments/designations?departmentId=${encodeURIComponent(departmentId)}` : "/api/departments/designations";
  const res = await apiFetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch designations (${res.status})`);
  }
  return res.json();
}

export async function createDesignation(data: CreateDesignationInput): Promise<{ message: string; id: string }> {
  const res = await apiFetch("/api/departments/designations", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create designation (${res.status})`);
  }
  return res.json();
}

export async function updateDesignation(id: string, data: Partial<CreateDesignationInput>): Promise<{ message: string }> {
  const res = await apiFetch(`/api/departments/designations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update designation (${res.status})`);
  }
  return res.json();
}

export async function deleteDesignation(id: string): Promise<{ message: string }> {
  const res = await apiFetch(`/api/departments/designations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete designation (${res.status})`);
  }
  return res.json();
}
