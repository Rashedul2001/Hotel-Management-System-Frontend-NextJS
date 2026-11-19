"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Plus,
  RefreshCw,
  Users,
  CheckCircle2,
  Edit,
  Trash2,
  ArrowRight,
  Lock,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  getRoles,
  deleteRole,
  type RoleItem,
} from "@/lib/users-roles-api";
import { RoleFormModal } from "@/components/pms/users/role-form-modal";
import { toast } from "sonner";

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  // Delete Confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRoles();
      setRoles(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteRole(deleteId);
      toast.success(`Role '${deleteName}' deleted successfully.`);
      setDeleteOpen(false);
      loadRoles();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete role.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Role Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure system roles and custom department roles with granular permission policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => loadRoles()} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedRole(null);
              setModalOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Custom Role
          </Button>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading security roles...
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="rounded-2xl bg-card border border-border shadow-sm p-5 hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">{role.name}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          role.isSystem
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {role.isSystem ? "System Protected" : "Custom Role"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground mt-3 line-clamp-3">
                  {role.description || "No description provided for this role."}
                </p>

                {/* Metrics */}
                <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-muted/40">
                    <span className="text-xs text-muted-foreground block">Assigned Users</span>
                    <span className="text-base font-bold text-foreground">{role.usersCount}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-muted/40">
                    <span className="text-xs text-muted-foreground block">Active Permissions</span>
                    <span className="text-base font-bold text-primary">{role.permissionsCount}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <Link
                  href={`/pms/users/permissions?role=${encodeURIComponent(role.name)}`}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Configure Permissions <ArrowRight className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Edit Role"
                    onClick={() => {
                      setSelectedRole(role);
                      setModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>

                  {!role.isSystem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete Custom Role"
                      onClick={() => {
                        setDeleteId(role.id);
                        setDeleteName(role.name);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Role Form Modal */}
      <RoleFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        role={selectedRole}
        onSuccess={loadRoles}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Custom Role"
        description={`Are you sure you want to delete role '${deleteName}'? This action cannot be undone.`}
        confirmText="Delete Role"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
}
