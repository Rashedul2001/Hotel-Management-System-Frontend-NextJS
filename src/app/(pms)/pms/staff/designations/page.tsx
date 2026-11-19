"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  Plus,
  RefreshCw,
  Building2,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  getDesignations,
  getDepartments,
  deleteDesignation,
  type Designation,
  type Department,
} from "@/lib/staff-api";
import { DesignationFormModal } from "@/components/pms/staff/designation-form-modal";
import { formatBDT } from "@/lib/dashboard-api";
import { toast } from "sonner";

export default function DesignationsPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);

  // Delete Confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [desigsRes, deptsRes] = await Promise.all([
        getDesignations(deptFilter || undefined),
        getDepartments(),
      ]);
      setDesignations(desigsRes);
      setDepartments(deptsRes);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load designations.");
    } finally {
      setLoading(false);
    }
  }, [deptFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteDesignation(deleteId);
      toast.success(`Designation '${deleteTitle}' deleted successfully.`);
      setDeleteOpen(false);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete designation.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = designations.filter((dg) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        dg.title.toLowerCase().includes(q) ||
        (dg.level && dg.level.toLowerCase().includes(q)) ||
        (dg.departmentName && dg.departmentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getLevelBadge = (lvl?: string | null) => {
    switch (lvl?.toLowerCase()) {
      case "executive":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "management":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "senior":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "mid-level":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
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
            <Award className="w-7 h-7 text-primary" />
            Designations & Job Titles
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define organizational hierarchy, base compensation scales, and departmental position tiers.
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
              setSelectedDesignation(null);
              setModalOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Designation
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search job title, level, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
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
      </div>

      {/* Designations Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3.5">Designation Title</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Tier Level</th>
                <th className="px-4 py-3.5">Base Salary</th>
                <th className="px-4 py-3.5">Staff Count</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading designations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No designations found.
                  </td>
                </tr>
              ) : (
                filtered.map((dg) => (
                  <tr key={dg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{dg.title}</div>
                      {dg.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{dg.description}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {dg.departmentName ? (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{dg.departmentName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">General</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getLevelBadge(
                          dg.level
                        )}`}
                      >
                        {dg.level || "Mid-Level"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-emerald-600 dark:text-emerald-400">
                      {dg.baseSalary ? formatBDT(dg.baseSalary) : "—"}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
                        {dg.staffCount} staff
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit Designation"
                          onClick={() => {
                            setSelectedDesignation(dg);
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete Designation"
                          onClick={() => {
                            setDeleteId(dg.id);
                            setDeleteTitle(dg.title);
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

      {/* Designation Modal */}
      <DesignationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        designation={selectedDesignation}
        departments={departments}
        onSuccess={loadData}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Designation"
        description={`Are you sure you want to delete '${deleteTitle}'? Any staff members currently holding this title will have their designation cleared.`}
        confirmText="Delete Title"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
}
