"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  AlertCircle,
  Clock4,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Building2,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getStaffList,
  updateStaffStatus,
  type StaffMember,
} from "@/lib/staff-api";
import { toast } from "sonner";

const STATUS_TABS = ["All", "Active", "On Leave", "Probation", "Suspended", "Terminated"];

export default function EmploymentStatusPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Status transition modal
  const [targetStaff, setTargetStaff] = useState<StaffMember | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStaffList({ limit: 100 });
      setStaffList(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load staff list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusTransition = async () => {
    if (!targetStaff || !newStatus) return;
    try {
      setUpdating(true);
      await updateStaffStatus(targetStaff.id, newStatus);
      toast.success(`${targetStaff.fullName} status updated to '${newStatus}'.`);
      setTargetStaff(null);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change employment status.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    if (activeTab !== "All" && s.status.toLowerCase() !== activeTab.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.staffCode.toLowerCase().includes(q) ||
        (s.departmentName && s.departmentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

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
      case "terminated":
        return "bg-muted text-muted-foreground border-border line-through";
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
            <ShieldCheck className="w-7 h-7 text-primary" />
            Employment Status Lifecycle
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Oversee staff tenure transitions: active duty, leave approvals, probation clearance, suspensions, and terminations.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "All"
                ? staffList.length
                : staffList.filter((s) => s.status.toLowerCase() === tab.toLowerCase()).length;
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Staff Status Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Hire Date</th>
                <th className="px-4 py-3.5">Current Status</th>
                <th className="px-5 py-3.5 text-right">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading staff records...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No staff records found under {activeTab} status.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{s.fullName}</span>
                        <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                          {s.staffCode}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {s.designationTitle || "Staff"} • {s.email}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{s.departmentName || "General"}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                      {new Date(s.hireDate).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          s.status
                        )}`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => {
                          setTargetStaff(s);
                          setNewStatus(s.status);
                        }}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Transition Status
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transition Status Dialog */}
      {targetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6">
            <h3 className="text-base font-bold text-foreground">Change Employment Status</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Transition status for <span className="font-semibold text-foreground">{targetStaff.fullName}</span> ({targetStaff.staffCode}).
            </p>

            <div className="mt-4 space-y-2">
              {["Active", "On Leave", "Probation", "Suspended", "Terminated"].map((st) => (
                <div
                  key={st}
                  onClick={() => setNewStatus(st)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    newStatus === st
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span className="text-xs">{st}</span>
                  {newStatus === st && <span className="text-xs text-primary font-bold">Selected</span>}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-5">
              <Button variant="outline" size="sm" onClick={() => setTargetStaff(null)} disabled={updating}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleStatusTransition} disabled={updating}>
                {updating ? "Updating..." : "Confirm Transition"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
