"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createDepartment,
  updateDepartment,
  type Department,
  type CreateDepartmentInput,
} from "@/lib/staff-api";
import { toast } from "sonner";

interface DepartmentFormModalProps {
  open: boolean;
  onClose: () => void;
  department?: Department | null;
  onSuccess: () => void;
}

export function DepartmentFormModal({
  open,
  onClose,
  department,
  onSuccess,
}: DepartmentFormModalProps) {
  const isEdit = Boolean(department);

  const [formData, setFormData] = useState<CreateDepartmentInput>({
    name: "",
    code: "",
    description: "",
    headOfDepartment: "",
    email: "",
    phone: "",
    location: "",
    budget: undefined,
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        code: department.code || "",
        description: department.description || "",
        headOfDepartment: department.headOfDepartment || "",
        email: department.email || "",
        phone: department.phone || "",
        location: department.location || "",
        budget: department.budget ?? undefined,
        isActive: department.isActive,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        headOfDepartment: "",
        email: "",
        phone: "",
        location: "",
        budget: undefined,
        isActive: true,
      });
    }
  }, [department, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Department Name and Code are required.");
      return;
    }

    try {
      setSaving(true);
      if (isEdit && department) {
        await updateDepartment(department.id, {
          ...formData,
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
        });
        toast.success(`Department '${formData.name}' updated successfully.`);
      } else {
        await createDepartment({
          ...formData,
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
        });
        toast.success(`Department '${formData.name}' created successfully.`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save department.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {isEdit ? `Edit Department (${department?.code})` : "Create New Department"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure operational department info, leadership, and budget allocation.
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
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-foreground mb-1 block">Department Name *</label>
              <Input
                required
                placeholder="e.g. Front Desk"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Code *</label>
              <Input
                required
                placeholder="e.g. FD"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Head of Department / Director</label>
            <Input
              placeholder="e.g. Eleanor Vance"
              value={formData.headOfDepartment || ""}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Department Email</label>
              <Input
                type="email"
                placeholder="frontdesk@velora.com"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Phone / Extension</label>
              <Input
                placeholder="+880 1711-000101"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Physical Location / Office</label>
              <Input
                placeholder="e.g. Ground Floor, Lobby West"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Monthly Budget (BDT)</label>
              <Input
                type="number"
                placeholder="e.g. 850000"
                value={formData.budget !== undefined ? formData.budget.toString() : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Description & Scope</label>
            <Textarea
              rows={2}
              placeholder="Brief description of department duties and responsibilities..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="dept-active"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-input text-primary focus:ring-primary w-4 h-4"
            />
            <label htmlFor="dept-active" className="text-xs font-medium text-foreground cursor-pointer">
              Department is active and currently operational
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
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? "Save Department" : "Create Department"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
