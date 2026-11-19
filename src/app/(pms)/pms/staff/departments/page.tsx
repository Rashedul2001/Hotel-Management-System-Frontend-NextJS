"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  RefreshCw,
  Users,
  Award,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  getDepartments,
  deleteDepartment,
  type Department,
} from "@/lib/staff-api";
import { DepartmentFormModal } from "@/components/pms/staff/department-form-modal";
import { formatBDT } from "@/lib/dashboard-api";
import { toast } from "sonner";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteDepartment(deleteId);
      toast.success(`Department '${deleteName}' deleted successfully.`);
      setDeleteOpen(false);
      loadDepartments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete department.");
    } finally {
      setDeleting(false);
    }
  };

  const totalBudget = departments.reduce((acc, d) => acc + (d.budget || 0), 0);
  const totalStaff = departments.reduce((acc, d) => acc + d.staffCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            Hotel Departments
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure hotel operational divisions, leadership, budget allotments, and personnel count.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => loadDepartments()} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedDept(null);
              setModalOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departments</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">{departments.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Active hotel divisions</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Staff</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalStaff}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Assigned employees</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Budget</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{formatBDT(totalBudget)}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Operating budget sum</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operational</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">
            {departments.filter((d) => d.isActive).length} / {departments.length}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">100% online status</p>
        </div>
      </div>

      {/* Departments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            No departments configured yet.
          </div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="rounded-2xl bg-card border border-border shadow-sm p-5 hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Card Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center font-mono text-sm">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">{dept.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Head: <span className="text-foreground font-medium">{dept.headOfDepartment || "Unassigned"}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                      dept.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {dept.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Description */}
                {dept.description && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{dept.description}</p>
                )}

                {/* Meta details */}
                <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-xs">
                  {dept.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{dept.location}</span>
                    </div>
                  )}

                  {dept.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{dept.email}</span>
                    </div>
                  )}

                  {dept.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{dept.phone}</span>
                    </div>
                  )}
                </div>

                {/* Badges / Counters */}
                <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-muted/40">
                    <span className="text-xs text-muted-foreground block">Staff</span>
                    <span className="text-sm font-bold text-foreground">{dept.staffCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/40">
                    <span className="text-xs text-muted-foreground block">Roles</span>
                    <span className="text-sm font-bold text-foreground">{dept.designationsCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/40">
                    <span className="text-xs text-muted-foreground block">Budget</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate block">
                      {dept.budget ? formatBDT(dept.budget) : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <Link
                  href={`/pms/staff?departmentId=${dept.id}`}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  View {dept.staffCount} Staff <ArrowRight className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Edit Department"
                    onClick={() => {
                      setSelectedDept(dept);
                      setModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Delete Department"
                    onClick={() => {
                      setDeleteId(dept.id);
                      setDeleteName(dept.name);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Department Form Modal */}
      <DepartmentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        department={selectedDept}
        onSuccess={loadDepartments}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        description={`Are you sure you want to delete ${deleteName}? Assigned staff and designations will be safely unlinked.`}
        confirmText="Delete Department"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
}
