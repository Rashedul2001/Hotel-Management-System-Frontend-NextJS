"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, ShieldPlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createRole,
  updateRole,
  type RoleItem,
} from "@/lib/users-roles-api";
import { toast } from "sonner";

interface RoleFormModalProps {
  open: boolean;
  onClose: () => void;
  role?: RoleItem | null;
  onSuccess: () => void;
}

export function RoleFormModal({
  open,
  onClose,
  role,
  onSuccess,
}: RoleFormModalProps) {
  const isEdit = Boolean(role);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role) {
      setName(role.name || "");
      setDescription(role.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [role, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Role Name is required.");
      return;
    }

    try {
      setSaving(true);
      if (isEdit && role) {
        await updateRole(role.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
        toast.success(`Role '${name}' updated successfully.`);
      } else {
        await createRole({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        toast.success(`Role '${name}' created successfully.`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save role.");
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
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {isEdit ? `Edit Role: ${role?.name}` : "Create Custom Role"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Define a custom role that can be assigned tailored PMS permissions.
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
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Role Name *</label>
            <Input
              required
              disabled={isEdit && role?.isSystem}
              placeholder="e.g. ConciergeManager"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {isEdit && role?.isSystem && (
              <p className="text-[11px] text-amber-500 mt-1">
                System core roles cannot be renamed.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Role Description</label>
            <Textarea
              rows={3}
              placeholder="Explain the purpose, team, and privilege tier for this role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? "Save Role" : "Create Role"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
