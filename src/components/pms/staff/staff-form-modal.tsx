"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, UserPlus, Save, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createStaff,
  updateStaff,
  type StaffMember,
  type Department,
  type Designation,
} from "@/lib/staff-api";
import { toast } from "sonner";

interface StaffFormModalProps {
  open: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
  departments: Department[];
  designations: Designation[];
  onSuccess: () => void;
}

export function StaffFormModal({
  open,
  onClose,
  staff,
  departments,
  designations,
  onSuccess,
}: StaffFormModalProps) {
  const isEdit = Boolean(staff);

  const [formData, setFormData] = useState({
    staffCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentId: "",
    designationId: "",
    employmentType: "Full-time",
    status: "Active",
    shift: "Morning (07:00 - 15:30)",
    salary: "",
    hireDate: new Date().toISOString().split("T")[0],
    emergencyContact: "",
    emergencyPhone: "",
    address: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        staffCode: staff.staffCode || "",
        firstName: staff.firstName || "",
        lastName: staff.lastName || "",
        email: staff.email || "",
        phone: staff.phone || "",
        departmentId: staff.departmentId || "",
        designationId: staff.designationId || "",
        employmentType: staff.employmentType || "Full-time",
        status: staff.status || "Active",
        shift: staff.shift || "Morning (07:00 - 15:30)",
        salary: staff.salary ? staff.salary.toString() : "",
        hireDate: staff.hireDate ? staff.hireDate.split("T")[0] : new Date().toISOString().split("T")[0],
        emergencyContact: staff.emergencyContact || "",
        emergencyPhone: staff.emergencyPhone || "",
        address: staff.address || "",
        notes: staff.notes || "",
      });
    } else {
      setFormData({
        staffCode: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        departmentId: departments[0]?.id || "",
        designationId: designations[0]?.id || "",
        employmentType: "Full-time",
        status: "Active",
        shift: "Morning (07:00 - 15:30)",
        salary: "",
        hireDate: new Date().toISOString().split("T")[0],
        emergencyContact: "",
        emergencyPhone: "",
        address: "",
        notes: "",
      });
    }
  }, [staff, open, departments, designations]);

  if (!open) return null;

  const filteredDesignations = formData.departmentId
    ? designations.filter((d) => !d.departmentId || d.departmentId === formData.departmentId)
    : designations;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields (First name, Last name, Email, Phone).");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        staffCode: formData.staffCode.trim() || undefined,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        departmentId: formData.departmentId || undefined,
        designationId: formData.designationId || undefined,
        employmentType: formData.employmentType,
        status: formData.status,
        shift: formData.shift,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : undefined,
        emergencyContact: formData.emergencyContact.trim() || undefined,
        emergencyPhone: formData.emergencyPhone.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (isEdit && staff) {
        await updateStaff(staff.id, payload);
        toast.success(`Staff member ${formData.firstName} ${formData.lastName} updated successfully.`);
      } else {
        const res = await createStaff(payload);
        toast.success(`Staff member created (${res.staffCode}).`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save staff record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {isEdit ? `Edit Staff Member (${staff?.staffCode})` : "Add New Staff Member"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEdit ? "Update employee profile, role assignments, and shift details." : "Register an employee into the hotel staff directory."}
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Personal Info */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Staff Code (Optional)</label>
                <Input
                  placeholder="Auto-generated (e.g. STF-1014)"
                  value={formData.staffCode}
                  onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">First Name *</label>
                <Input
                  required
                  placeholder="e.g. Liam"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Last Name *</label>
                <Input
                  required
                  placeholder="e.g. Chowdhury"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Work Email *</label>
                <Input
                  required
                  type="email"
                  placeholder="name@velora.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Phone Number *</label>
                <Input
                  required
                  placeholder="+880 1700-000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Department & Role */}
          <div className="pt-2 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Organization & Position
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Designation / Title</label>
                <select
                  value={formData.designationId}
                  onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select Designation...</option>
                  {filteredDesignations.map((dg) => (
                    <option key={dg.id} value={dg.id}>
                      {dg.title} {dg.level ? `(${dg.level})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Employment Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Probation">Probation</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Shift Schedule</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Morning (07:00 - 15:30)">Morning (07:00 - 15:30)</option>
                  <option value="Evening (15:00 - 23:30)">Evening (15:00 - 23:30)</option>
                  <option value="Night (23:00 - 07:30)">Night (23:00 - 07:30)</option>
                  <option value="General (09:00 - 18:00)">General (09:00 - 18:00)</option>
                  <option value="Flexible">Flexible / On-Call</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Monthly Salary (BDT)</label>
                <Input
                  type="number"
                  placeholder="e.g. 45000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Hire Date</label>
                <Input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Emergency & Address */}
          <div className="pt-2 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Emergency Contact & Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Emergency Contact Name & Relation</label>
                <Input
                  placeholder="e.g. Nasrin (Spouse)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Emergency Phone Number</label>
                <Input
                  placeholder="+880 1700-000000"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-foreground mb-1 block">Residential Address</label>
              <Input
                placeholder="House, Road, Area, City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-foreground mb-1 block">Internal HR Notes</label>
              <Textarea
                rows={2}
                placeholder="Certifications, performance notes, background check verification..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Form Actions */}
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
                  Save Changes
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Staff Member
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
