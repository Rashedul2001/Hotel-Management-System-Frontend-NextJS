"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assignUserRoles, type ManagedUser, type RoleItem } from "@/lib/users-roles-api";
import { toast } from "sonner";

interface AssignRolesModalProps {
  open: boolean;
  onClose: () => void;
  user?: ManagedUser | null;
  roles: RoleItem[];
  onSuccess: () => void;
}

export function AssignRolesModal({
  open,
  onClose,
  user,
  roles,
  onSuccess,
}: AssignRolesModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || []);
    }
  }, [user, open]);

  if (!open || !user) return null;

  const toggleRole = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleName));
    } else {
      setSelectedRoles([...selectedRoles, roleName]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await assignUserRoles(user.id, selectedRoles);
      toast.success(`Roles for '${user.fullName}' updated.`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update roles.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Assign Security Roles</h3>
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                {user.fullName} ({user.email})
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

        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {roles.map((r) => {
            const isAssigned = selectedRoles.includes(r.name);
            return (
              <div
                key={r.id}
                onClick={() => toggleRole(r.name)}
                className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isAssigned
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{r.name}</span>
                    {r.isSystem && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-medium text-muted-foreground">
                        System
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {r.description}
                    </p>
                  )}
                  <span className="text-[11px] text-muted-foreground mt-1 inline-block">
                    {r.permissionsCount} permissions included
                  </span>
                </div>
                <div
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    isAssigned
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {isAssigned && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Save Role Assignments
          </Button>
        </div>
      </div>
    </div>
  );
}
