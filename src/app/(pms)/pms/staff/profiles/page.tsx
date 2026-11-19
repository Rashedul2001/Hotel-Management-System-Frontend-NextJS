"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  User,
  Users,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getStaffList,
  getStaffById,
  getDepartments,
  getDesignations,
  updateStaffStatus,
  type StaffMember,
  type Department,
  type Designation,
} from "@/lib/staff-api";
import { StaffFormModal } from "@/components/pms/staff/staff-form-modal";
import { formatBDT } from "@/lib/dashboard-api";
import { toast } from "sonner";

function EmployeeProfilesContent() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id");

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, deptsRes, desigsRes] = await Promise.all([
        getStaffList({ limit: 100 }),
        getDepartments(),
        getDesignations(),
      ]);

      setStaffList(listRes.items);
      setDepartments(deptsRes);
      setDesignations(desigsRes);

      if (listRes.items.length > 0) {
        if (requestedId) {
          const found = listRes.items.find((s) => s.id === requestedId);
          setSelectedStaff(found || listRes.items[0]);
        } else if (!selectedStaff) {
          setSelectedStaff(listRes.items[0]);
        } else {
          const refreshed = listRes.items.find((s) => s.id === selectedStaff.id);
          setSelectedStaff(refreshed || listRes.items[0]);
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  }, [requestedId, selectedStaff]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedStaff) return;
    try {
      await updateStaffStatus(selectedStaff.id, newStatus);
      toast.success(`Employment status updated to ${newStatus}.`);
      setSelectedStaff({ ...selectedStaff, status: newStatus });
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/pms/staff">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <User className="w-7 h-7 text-primary" />
              Employee Profiles
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Deep inspection of employee records, emergency details, compensation, and shifts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {selectedStaff && (
            <Button size="sm" onClick={() => setFormOpen(true)} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Staff Picker List + Profile Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Staff Roster Selector */}
        <div className="lg:col-span-4 rounded-2xl bg-card border border-border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Staff Directory ({staffList.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-primary" />
                Loading roster...
              </div>
            ) : (
              staffList.map((m) => {
                const isSelected = selectedStaff?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedStaff(m)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground shadow-sm"
                        : "border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.firstName[0]}
                        {m.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{m.fullName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {m.designationTitle || "Staff"} • {m.departmentCode || "HOTEL"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 ml-2">
                      {m.staffCode}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Profile Card */}
        <div className="lg:col-span-8">
          {selectedStaff ? (
            <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              {/* Profile Top Banner */}
              <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center shadow-lg">
                      {selectedStaff.firstName[0]}
                      {selectedStaff.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{selectedStaff.fullName}</h2>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-card border border-border text-foreground font-semibold">
                          {selectedStaff.staffCode}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-primary mt-0.5">
                        {selectedStaff.designationTitle || "Staff"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedStaff.departmentName || "Unassigned"} ({selectedStaff.departmentCode || "N/A"})
                      </p>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Status:</span>
                    <select
                      value={selectedStaff.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Probation">Probation</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Profile Details Sections */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Contact & Personal */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Contact & Identification
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <span className="text-xs text-muted-foreground block">Email Address</span>
                      <span className="text-sm font-semibold text-foreground">{selectedStaff.email}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Primary Phone</span>
                      <span className="text-sm font-semibold text-foreground">{selectedStaff.phone}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Residential Address</span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedStaff.address || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employment & Shift Details */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Employment & Working Hours
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <span className="text-xs text-muted-foreground block">Employment Type</span>
                      <span className="text-sm font-semibold text-foreground">{selectedStaff.employmentType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Assigned Shift</span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedStaff.shift || "General (09:00 - 18:00)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Monthly Salary</span>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {selectedStaff.salary ? formatBDT(selectedStaff.salary) : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Hire Date</span>
                      <span className="text-sm font-semibold text-foreground">
                        {new Date(selectedStaff.hireDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-rose-500" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <span className="text-xs text-muted-foreground block">Contact Name & Relationship</span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedStaff.emergencyContact || "No emergency contact on file"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Emergency Phone Number</span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedStaff.emergencyPhone || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Internal HR Remarks */}
                {selectedStaff.notes && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Internal HR Remarks
                    </h3>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-sm text-foreground">
                      {selectedStaff.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border p-12 text-center text-muted-foreground">
              Select a staff member from the roster to inspect their profile.
            </div>
          )}
        </div>
      </div>

      {/* Staff Form Modal */}
      <StaffFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        staff={selectedStaff}
        departments={departments}
        designations={designations}
        onSuccess={loadData}
      />
    </div>
  );
}

export default function EmployeeProfilesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading profiles...</div>}>
      <EmployeeProfilesContent />
    </Suspense>
  );
}
