"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, UserPlus, Save, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createManagedUser,
  updateManagedUser,
  type ManagedUser,
  type RoleItem,
} from "@/lib/users-roles-api";
import { type Department, type StaffMember } from "@/lib/staff-api";
import { toast } from "sonner";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: ManagedUser | null;
  roles: RoleItem[];
  departments: Department[];
  staffList: StaffMember[];
  onSuccess: () => void;
}

export function UserFormModal({
  open,
  onClose,
  user,
  roles,
  departments,
  staffList,
  onSuccess,
}: UserFormModalProps) {
  const isEdit = Boolean(user);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [linkedStaffId, setLinkedStaffId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPassword("");
      setPhoneNumber(user.phoneNumber || "");
      setSelectedRoles(user.roles || []);
      setDepartmentId(user.departmentId || "");
      setLinkedStaffId(user.linkedStaffId || "");
      setIsActive(user.isActive);
    } else {
      setFullName("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
      setSelectedRoles(["Staff"]);
      setDepartmentId(departments[0]?.id || "");
      setLinkedStaffId("");
      setIsActive(true);
    }
  }, [user, open, departments]);

  if (!open) return null;

  const toggleRole = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleName));
    } else {
      setSelectedRoles([...selectedRoles, roleName]);
    }
  };

  const handleStaffSelect = (staffId: string) => {
    setLinkedStaffId(staffId);
    if (staffId) {
      const match = staffList.find((s) => s.id === staffId);
      if (match) {
        if (!fullName) setFullName(match.fullName);
        if (!email) setEmail(match.email);
        if (!phoneNumber) setPhoneNumber(match.phone);
        if (match.departmentId) setDepartmentId(match.departmentId);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Full Name and Email are required.");
      return;
    }

    if (!isEdit && (!password || password.length < 6)) {
      toast.error("Password is required and must be at least 6 characters.");
      return;
    }

    try {
      setSaving(true);
      if (isEdit && user) {
        await updateManagedUser(user.id, {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim() || undefined,
          departmentId: departmentId || undefined,
          linkedStaffId: linkedStaffId || undefined,
          isActive,
        });
        toast.success(`User '${fullName}' updated successfully.`);
      } else {
        await createManagedUser({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phoneNumber: phoneNumber.trim() || undefined,
          roles: selectedRoles,
          departmentId: departmentId || undefined,
          linkedStaffId: linkedStaffId || undefined,
          isActive,
        });
        toast.success(`User account for '${fullName}' created.`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save user account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {isEdit ? `Edit User: ${user?.fullName}` : "Create System User Account"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Provision authenticated hotel PMS accounts, role assignments, and department scopes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Link to Existing Staff */}
          {!isEdit && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                Link Existing Employee (Optional)
              </label>
              <select
                value={linkedStaffId}
                onChange={(e) => handleStaffSelect(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Create independent account (or select employee)...</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.staffCode} - {s.fullName} ({s.departmentName || "Unassigned"} - {s.designationTitle || "Staff"})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Full Name *</label>
              <Input
                required
                placeholder="e.g. Liam Chowdhury"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Email Address (Login) *</label>
              <Input
                required
                type="email"
                placeholder="liam@velora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!isEdit ? (
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Password *</label>
                <Input
                  required
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Password</label>
                <p className="text-xs text-muted-foreground pt-2">
                  Use the &quot;Reset Password&quot; action in the table to modify user credentials.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Phone Number</label>
              <Input
                placeholder="+880 1800-000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Department Affiliation</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">No Department Assigned</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Role Checkboxes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Assigned Security Roles
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roles.map((r) => {
                const checked = selectedRoles.includes(r.name);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRole(r.name)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      checked
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-muted-foreground/30 text-foreground"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                      }`}
                    >
                      {checked && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <span className="text-xs truncate">{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <input
              type="checkbox"
              id="user-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary w-4 h-4"
            />
            <label htmlFor="user-active" className="text-xs font-medium text-foreground cursor-pointer">
              Account is Active and allowed to sign in to PMS
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                <>
                  <Save className="w-4 h-4" />
                  Save User
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
