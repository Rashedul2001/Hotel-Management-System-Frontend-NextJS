"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserPlus,
  Search,
  RefreshCw,
  Building2,
  KeyRound,
  Shield,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Users,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  getManagedUsers,
  getRoles,
  deleteManagedUser,
  toggleUserStatus,
  type ManagedUser,
  type RoleItem,
} from "@/lib/users-roles-api";
import {
  getDepartments,
  getStaffList,
  type Department,
  type StaffMember,
} from "@/lib/staff-api";
import { UserFormModal } from "@/components/pms/users/user-form-modal";
import { ResetPasswordModal } from "@/components/pms/users/reset-password-modal";
import { AssignRolesModal } from "@/components/pms/users/assign-roles-modal";
import { toast } from "sonner";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDept, setSelectedDept] = useState("");

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<ManagedUser | null>(null);

  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [rolesTargetUser, setRolesTargetUser] = useState<ManagedUser | null>(null);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, deptsRes, staffRes] = await Promise.all([
        getManagedUsers({
          search: search || undefined,
          role: selectedRole !== "all" ? selectedRole : undefined,
          departmentId: selectedDept || undefined,
          limit: 100,
        }),
        getRoles(),
        getDepartments(),
        getStaffList({ limit: 100 }),
      ]);

      setUsers(usersRes.items);
      setRoles(rolesRes);
      setDepartments(deptsRes);
      setStaffList(staffRes.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load user accounts.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedRole, selectedDept]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleActive = async (user: ManagedUser) => {
    try {
      const next = !user.isActive;
      await toggleUserStatus(user.id, next);
      toast.success(next ? `User '${user.fullName}' activated.` : `User '${user.fullName}' suspended.`);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle user status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteManagedUser(deleteId);
      toast.success(`User '${deleteName}' deleted successfully.`);
      setDeleteOpen(false);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user account.");
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            System User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Administer PMS login accounts, grant security roles, reset credentials, and link employee profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingUser(null);
              setUserModalOpen(true);
            }}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create User Account
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{users.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Registered accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Logins</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Permitted access</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configured Roles</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">{roles.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Security role tiers</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departments</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">{departments.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Operational units</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Security Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3.5">User Details</th>
                <th className="px-4 py-3.5">Assigned Roles</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Linked Staff</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Login</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading system user accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No user accounts match your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    {/* User Details */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                          {user.fullName ? user.fullName[0] : "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span>{user.fullName}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Roles */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => {
                          const isSuper = r.toLowerCase() === "superadmin";
                          const isAdmin = r.toLowerCase() === "admin";
                          return (
                            <span
                              key={r}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                isSuper
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                  : isAdmin
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {r}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5">
                      {user.departmentName ? (
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{user.departmentName}</span>
                          {user.departmentCode && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              ({user.departmentCode})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      )}
                    </td>

                    {/* Linked Staff */}
                    <td className="px-4 py-3.5">
                      {user.linkedStaffCode ? (
                        <div>
                          <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">
                            {user.linkedStaffCode}
                          </span>
                          {user.designationTitle && (
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              {user.designationTitle}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unlinked</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                          user.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                        title="Click to toggle status"
                      >
                        {user.isActive ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            Suspended
                          </>
                        )}
                      </button>
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Assign Roles"
                          onClick={() => {
                            setRolesTargetUser(user);
                            setRolesModalOpen(true);
                          }}
                        >
                          <Shield className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Reset Password"
                          onClick={() => {
                            setResetTargetUser(user);
                            setResetModalOpen(true);
                          }}
                        >
                          <KeyRound className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit User"
                          onClick={() => {
                            setEditingUser(user);
                            setUserModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete User"
                          onClick={() => {
                            setDeleteId(user.id);
                            setDeleteName(user.fullName);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        user={editingUser}
        roles={roles}
        departments={departments}
        staffList={staffList}
        onSuccess={loadData}
      />

      {/* Assign Roles Modal */}
      <AssignRolesModal
        open={rolesModalOpen}
        onClose={() => setRolesModalOpen(false)}
        user={rolesTargetUser}
        roles={roles}
        onSuccess={loadData}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        user={resetTargetUser}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        description={`Are you sure you want to delete ${deleteName}? This will permanently remove their login credentials and authentication access.`}
        confirmText="Delete User"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
}
