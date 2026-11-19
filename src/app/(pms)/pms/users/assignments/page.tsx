"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Users,
  RefreshCw,
  Search,
  Check,
  CheckCircle2,
  Save,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getManagedUsers,
  getRoles,
  assignUserRoles,
  type ManagedUser,
  type RoleItem,
} from "@/lib/users-roles-api";
import { toast } from "sonner";

export default function UserRoleAssignmentsPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Track in-memory role assignments: userId -> Set of role names
  const [assignments, setAssignments] = useState<Record<string, Set<string>>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        getManagedUsers({ limit: 100 }),
        getRoles(),
      ]);

      setUsers(usersRes.items);
      setRoles(rolesRes);

      const mapping: Record<string, Set<string>> = {};
      usersRes.items.forEach((u) => {
        mapping[u.id] = new Set(u.roles);
      });
      setAssignments(mapping);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load user role assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleUserRole = (userId: string, roleName: string) => {
    const userRoles = new Set(assignments[userId] || []);
    if (userRoles.has(roleName)) {
      userRoles.delete(roleName);
    } else {
      userRoles.add(roleName);
    }
    setAssignments({
      ...assignments,
      [userId]: userRoles,
    });
  };

  const handleSaveUserRoles = async (user: ManagedUser) => {
    try {
      setSavingUserId(user.id);
      const updatedRoles = Array.from(assignments[user.id] || []);
      await assignUserRoles(user.id, updatedRoles);
      toast.success(`Security roles updated for '${user.fullName}'.`);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save user roles.");
    } finally {
      setSavingUserId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            User Role Assignments Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Rapid multi-role allocation matrix: toggle security credentials across all registered accounts.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search by user or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <span className="text-xs text-muted-foreground font-medium">
          {roles.length} roles available
        </span>
      </div>

      {/* Role Assignment Matrix Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3.5 sticky left-0 bg-muted/50 z-10 min-w-[200px]">User Account</th>
                {roles.map((r) => (
                  <th key={r.id} className="px-3 py-3.5 text-center min-w-[120px]">
                    <span className="block">{r.name}</span>
                    <span className="text-[10px] lowercase text-muted-foreground font-normal">
                      {r.isSystem ? "system" : "custom"}
                    </span>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right sticky right-0 bg-muted/50 z-10">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={roles.length + 2} className="px-5 py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading role matrix...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={roles.length + 2} className="px-5 py-12 text-center text-muted-foreground">
                    No users found matching search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userRoles = assignments[user.id] || new Set();
                  const isSaving = savingUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      {/* User Account */}
                      <td className="px-5 py-3.5 sticky left-0 bg-card z-10">
                        <div className="font-semibold text-foreground">{user.fullName}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>

                      {/* Role Checkboxes */}
                      {roles.map((r) => {
                        const hasRole = userRoles.has(r.name);
                        return (
                          <td key={r.id} className="px-3 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleUserRole(user.id, r.name)}
                              className={`w-6 h-6 rounded-md border inline-flex items-center justify-center transition-all ${
                                hasRole
                                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                  : "border-muted-foreground/30 hover:border-muted-foreground/60 bg-background"
                              }`}
                            >
                              {hasRole && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                          </td>
                        );
                      })}

                      {/* Save Button */}
                      <td className="px-5 py-3.5 text-right sticky right-0 bg-card z-10">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          disabled={isSaving}
                          onClick={() => handleSaveUserRoles(user)}
                        >
                          <Save className="w-3.5 h-3.5" />
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
