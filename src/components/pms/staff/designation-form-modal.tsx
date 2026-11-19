"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Award, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createDesignation,
  updateDesignation,
  type Designation,
  type Department,
  type CreateDesignationInput,
} from "@/lib/staff-api";
import { toast } from "sonner";

interface DesignationFormModalProps {
  open: boolean;
  onClose: () => void;
  designation?: Designation | null;
  departments: Department[];
  onSuccess: () => void;
}

export function DesignationFormModal({
  open,
  onClose,
  designation,
  departments,
  onSuccess,
}: DesignationFormModalProps) {
  const isEdit = Boolean(designation);

  const [formData, setFormData] = useState<CreateDesignationInput>({
    title: "",
    departmentId: "",
    level: "Mid-Level",
    description: "",
    baseSalary: undefined,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (designation) {
      setFormData({
        title: designation.title || "",
        departmentId: designation.departmentId || "",
        level: designation.level || "Mid-Level",
        description: designation.description || "",
        baseSalary: designation.baseSalary ?? undefined,
      });
    } else {
      setFormData({
        title: "",
        departmentId: departments[0]?.id || "",
        level: "Mid-Level",
        description: "",
        baseSalary: undefined,
      });
    }
  }, [designation, open, departments]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Designation Title is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        departmentId: formData.departmentId || undefined,
        level: formData.level,
        description: formData.description?.trim() || undefined,
        baseSalary: formData.baseSalary,
      };

      if (isEdit && designation) {
        await updateDesignation(designation.id, payload);
        toast.success(`Designation '${formData.title}' updated successfully.`);
      } else {
        await createDesignation(payload);
        toast.success(`Designation '${formData.title}' created successfully.`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save designation.");
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {isEdit ? "Edit Job Designation" : "Add New Designation"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Define organizational title, hierarchy level, and base salary.
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
            <label className="text-xs font-medium text-foreground mb-1 block">Job Title *</label>
            <Input
              required
              placeholder="e.g. Senior Receptionist"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Assigned Department</label>
            <select
              value={formData.departmentId || ""}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Cross-department / General</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Hierarchy Level</label>
              <select
                value={formData.level || "Mid-Level"}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Executive">Executive</option>
                <option value="Management">Management</option>
                <option value="Senior">Senior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Junior">Junior</option>
                <option value="Entry">Entry</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Base Salary (BDT)</label>
              <Input
                type="number"
                placeholder="e.g. 45000"
                value={formData.baseSalary !== undefined ? formData.baseSalary.toString() : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseSalary: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Role Responsibilities</label>
            <Textarea
              rows={2}
              placeholder="Summary of daily responsibilities..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {isEdit ? "Save Title" : "Create Title"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
