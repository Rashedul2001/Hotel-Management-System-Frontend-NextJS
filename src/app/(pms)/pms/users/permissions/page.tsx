"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Save,
  RefreshCw,
  Check,
  CheckSquare,
  Square,
  Lock,
  ChevronDown,
  ChevronRight,
  Shield,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getRoles,
  getRolePermissions,
  updateRolePermissions,
  getPermissionsCatalog,
  type RoleItem,
  type PermissionCategory,
} from "@/lib/users-roles-api";
import { toast } from "sonner";

function PermissionMatrixContent() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [catalog, setCatalog] = useState<PermissionCategory[]>([]);
  const [activePermissions, setActivePermissions] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesRes, catalogRes] = await Promise.all([
        getRoles(),
        getPermissionsCatalog(),
      ]);

      setRoles(rolesRes);
      setCatalog(catalogRes);

      const target = requestedRole
        ? rolesRes.find((r) => r.name.toLowerCase() === requestedRole.toLowerCase())?.name || rolesRes[0]?.name
        : rolesRes[0]?.name;

      if (target) {
        setSelectedRoleName(target);
        const perms = await getRolePermissions(target);
        setActivePermissions(new Set(perms));
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load permissions catalog.");
    } finally {
      setLoading(false);
    }
  }, [requestedRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = async (roleName: string) => {
    try {
      setSelectedRoleName(roleName);
      const perms = await getRolePermissions(roleName);
      setActivePermissions(new Set(perms));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load role permissions.");
    }
  };

  const togglePermission = (key: string) => {
    const next = new Set(activePermissions);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setActivePermissions(next);
  };

  const toggleCategoryAll = (category: PermissionCategory, selectAll: boolean) => {
    const next = new Set(activePermissions);
    category.permissions.forEach((p) => {
      if (selectAll) {
        next.add(p.key);
      } else {
        next.delete(p.key);
      }
    });
    setActivePermissions(next);
  };

  const handleSave = async () => {
    if (!selectedRoleName) return;
    try {
      setSaving(true);
      const arr = Array.from(activePermissions);
      await updateRolePermissions(selectedRoleName, arr);
      toast.success(`Saved ${arr.length} permissions for role '${selectedRoleName}'.`);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  const isSuperAdminRole = selectedRoleName.toLowerCase() === "superadmin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            Granular Permission Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure module privileges, action rights, and data access policies per security role.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Reset
          </Button>

          <Button onClick={handleSave} disabled={saving || isSuperAdminRole} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      </div>

      {/* Role Picker Navigation Tabs */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 shrink-0">
            Target Role:
          </span>
          {roles.map((r) => {
            const isSelected = selectedRoleName === r.name;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{r.name}</span>
                {r.isSystem && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 dark:bg-white/20">
                    System
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Filter permissions..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {isSuperAdminRole && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs flex items-center gap-3">
          <Lock className="w-5 h-5 shrink-0" />
          <span>
            <strong>SuperAdmin Note:</strong> The SuperAdmin role has implicit wildcard rights across all present and future system modules. Modifications are locked by design.
          </span>
        </div>
      )}

      {/* Permission Categories Accordions / Sections */}
      <div className="space-y-5">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading permissions matrix...
          </div>
        ) : (
          catalog.map((category) => {
            const filteredPerms = category.permissions.filter((p) => {
              if (!filterQuery.trim()) return true;
              const q = filterQuery.toLowerCase();
              return (
                p.key.toLowerCase().includes(q) ||
                p.label.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q))
              );
            });

            if (filteredPerms.length === 0) return null;

            const totalInCat = category.permissions.length;
            const grantedInCat = category.permissions.filter((p) => activePermissions.has(p.key)).length;
            const allSelected = totalInCat > 0 && grantedInCat === totalInCat;

            return (
              <div
                key={category.category}
                className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden"
              >
                {/* Category Header */}
                <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-foreground text-sm">{category.categoryLabel}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground font-semibold">
                      {grantedInCat} / {totalInCat} granted
                    </span>
                  </div>

                  {!isSuperAdminRole && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary"
                        onClick={() => toggleCategoryAll(category, !allSelected)}
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Permissions Grid */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredPerms.map((perm) => {
                    const isChecked = activePermissions.has(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => !isSuperAdminRole && togglePermission(perm.key)}
                        className={`p-3 rounded-xl border transition-all select-none ${
                          isSuperAdminRole ? "cursor-default opacity-85" : "cursor-pointer"
                        } ${
                          isChecked
                            ? "border-primary/40 bg-primary/5 text-foreground"
                            : "border-border hover:bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="pr-2">
                            <span className="text-xs font-bold text-foreground block">{perm.label}</span>
                            <span className="text-[11px] font-mono text-muted-foreground block mt-0.5">
                              {perm.key}
                            </span>
                            {perm.description && (
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                                {perm.description}
                              </p>
                            )}
                          </div>

                          <div
                            className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/40 bg-background"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Save Toolbar */}
      {!isSuperAdminRole && (
        <div className="sticky bottom-6 z-40 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {activePermissions.size} permissions selected for &apos;{selectedRoleName}&apos;
            </span>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Role Permissions"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PermissionMatrixPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading permissions matrix...</div>}>
      <PermissionMatrixContent />
    </Suspense>
  );
}
