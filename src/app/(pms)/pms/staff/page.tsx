"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock4,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  getStaffList,
  getStaffSummary,
  getDepartments,
  getDesignations,
  deleteStaff,
  updateStaffStatus,
  type StaffMember,
  type StaffSummary,
  type Department,
  type Designation,
} from "@/lib/staff-api";
import { StaffFormModal } from "@/components/pms/staff/staff-form-modal";
import { formatBDT } from "@/lib/dashboard-api";
import { toast } from "sonner";

export default function StaffDirectoryPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [summary, setSummary] = useState<StaffSummary | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("all");
  const [shift, setShift] = useState("all");

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Delete Confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, summaryRes, deptsRes, desigsRes] = await Promise.all([
        getStaffList({
          search: search || undefined,
          departmentId: departmentId || undefined,
          status: status !== "all" ? status : undefined,
          shift: shift !== "all" ? shift : undefined,
          limit: 100,
        }),
        getStaffSummary(),
        getDepartments(),
        getDesignations(),
      ]);

      setStaffList(listRes.items);
      setSummary(summaryRes);
      setDepartments(deptsRes);
      setDesignations(desigsRes);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load staff directory.");
    } finally {
      setLoading(false);
    }
  }, [search, departmentId, status, shift]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteStaff(deleteId);
      toast.success(`Staff member '${deleteName}' deleted successfully.`);
      setDeleteOpen(false);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete staff member.");
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickStatus = async (staff: StaffMember, nextStatus: string) => {
    try {
      await updateStaffStatus(staff.id, nextStatus);
      toast.success(`${staff.fullName} status updated to ${nextStatus}.`);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st.toLowerCase()) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "on leave":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "probation":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      case "suspended":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            Staff Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage hotel personnel, department affiliations, designations, and shifts.
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
              setSelectedStaff(null);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Staff</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{summary?.totalStaff ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Across {summary?.totalDepartments ?? 0} departments</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active On Duty</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary?.activeStaff ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Available for operations</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">On Leave</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock4 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {summary?.onLeaveStaff ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Scheduled time-off</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">On Probation</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">
            {summary?.probationStaff ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Recent hires under review</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, phone, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
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

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Employment Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Probation">Probation</option>
              <option value="Suspended">Suspended</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          <div>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Shifts</option>
              <option value="Morning">Morning Shift</option>
              <option value="Evening">Evening Shift</option>
              <option value="Night">Night Shift</option>
              <option value="General">General (09:00 - 18:00)</option>
              <option value="Flexible">Flexible / On-Call</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5">Shift & Type</th>
                <th className="px-4 py-3.5">Salary</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading staff directory...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No staff members match the current filters.
                  </td>
                </tr>
              ) : (
                staffList.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    {/* Name & Code */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs shrink-0">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span>{member.fullName}</span>
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                              {member.staffCode}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {member.email} • {member.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5">
                      {member.departmentName ? (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">{member.departmentName}</span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            ({member.departmentCode})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>

                    {/* Designation */}
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-foreground">
                        {member.designationTitle || "Staff"}
                      </span>
                    </td>

                    {/* Shift & Type */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{member.shift || "General"}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-0.5 block">
                        {member.employmentType}
                      </span>
                    </td>

                    {/* Salary */}
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {member.salary ? formatBDT(member.salary) : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                          member.status
                        )}`}
                      >
                        {member.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/pms/staff/profiles?id=${member.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Profile">
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit Staff Member"
                          onClick={() => {
                            setSelectedStaff(member);
                            setFormOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete Staff Member"
                          onClick={() => {
                            setDeleteId(member.id);
                            setDeleteName(member.fullName);
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

      {/* Staff Form Modal */}
      <StaffFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        staff={selectedStaff}
        departments={departments}
        designations={designations}
        onSuccess={loadData}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${deleteName}? This will remove their record from the staff directory.`}
        confirmText="Delete Staff Member"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
}
