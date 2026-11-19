"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  RefreshCw,
  Search,
  ArrowRightLeft,
  Check,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getManagedUsers,
  assignUserDepartment,
  type ManagedUser,
} from "@/lib/users-roles-api";
import {
  getDepartments,
  type Department,
} from "@/lib/staff-api";
import { toast } from "sonner";

export default function UserDepartmentAssignmentsPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Reassign Dialog
  const [targetUser, setTargetUser] = useState<ManagedUser | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        getManagedUsers({ limit: 100 }),
        getDepartments(),
      ]);
      setUsers(usersRes.items);
      setDepartments(deptsRes);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load user assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignSave = async () => {
    if (!targetUser) return;
    try {
      setSaving(true);
      await assignUserDepartment(targetUser.id, selectedDeptId || null);
      toast.success(`Department affiliation for '${targetUser.fullName}' updated.`);
      setTargetUser(null);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update department.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.departmentName && u.departmentName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            User Department Assignments
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assign and transfer system user accounts to operational hotel department scopes.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search by user or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <span className="text-xs text-muted-foreground font-medium">
          Showing {filtered.length} of {users.length} accounts
        </span>
      </div>

      {/* Users Assignments Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3.5">User Details</th>
                <th className="px-4 py-3.5">Current Department</th>
                <th className="px-4 py-3.5">Assigned Roles</th>
                <th className="px-4 py-3.5">Linked Employee</th>
                <th className="px-5 py-3.5 text-right">Assign Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading user assignments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No users found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{user.fullName}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      {user.departmentName ? (
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span>{user.departmentName}</span>
                          {user.departmentCode && (
                            <span className="font-mono text-xs text-muted-foreground">
                              ({user.departmentCode})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None (Unassigned)</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted border border-border text-foreground"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {user.linkedStaffCode ? (
                        <span className="font-mono font-medium text-foreground">
                          {user.linkedStaffCode} ({user.designationTitle || "Staff"})
                        </span>
                      ) : (
                        <span className="italic">None</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => {
                          setTargetUser(user);
                          setSelectedDeptId(user.departmentId || "");
                        }}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Change Department
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Department Dialog */}
      {targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6">
            <h3 className="text-base font-bold text-foreground">Assign Department Scope</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select departmental unit for <span className="font-semibold text-foreground">{targetUser.fullName}</span>.
            </p>

            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              <div
                onClick={() => setSelectedDeptId("")}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedDeptId === ""
                    ? "border-primary bg-primary/10 text-foreground font-semibold"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className="text-xs">No Department (General)</span>
                {selectedDeptId === "" && <Check className="w-4 h-4 text-primary" />}
              </div>

              {departments.map((d) => {
                const isSelected = selectedDeptId === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDeptId(d.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground font-semibold"
                        : "border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div>
                      <p className="text-xs text-foreground font-medium">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{d.code} • {d.location}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-5">
              <Button variant="outline" size="sm" onClick={() => setTargetUser(null)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAssignSave} disabled={saving}>
                {saving ? "Saving..." : "Save Assignment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
