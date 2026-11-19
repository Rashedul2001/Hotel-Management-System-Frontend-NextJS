"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Users,
  RefreshCw,
  Building2,
  ArrowRightLeft,
  Sun,
  Sunset,
  Moon,
  Briefcase,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getStaffList,
  updateStaffShift,
  type StaffMember,
} from "@/lib/staff-api";
import { toast } from "sonner";

const SHIFTS = [
  {
    id: "Morning",
    label: "Morning Shift",
    time: "07:00 - 15:30",
    fullValue: "Morning (07:00 - 15:30)",
    icon: Sun,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "Evening",
    label: "Evening Shift",
    time: "15:00 - 23:30",
    fullValue: "Evening (15:00 - 23:30)",
    icon: Sunset,
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  },
  {
    id: "Night",
    label: "Night Shift (Audit)",
    time: "23:00 - 07:30",
    fullValue: "Night (23:00 - 07:30)",
    icon: Moon,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    id: "General",
    label: "General Office Hours",
    time: "09:00 - 18:00",
    fullValue: "General (09:00 - 18:00)",
    icon: Briefcase,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
];

export default function StaffAssignmentsPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Shift Reassign modal
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [targetShift, setTargetShift] = useState("");
  const [savingShift, setSavingShift] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStaffList({ limit: 100 });
      setStaffList(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load staff roster.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleShiftSave = async () => {
    if (!selectedStaff || !targetShift) return;
    try {
      setSavingShift(true);
      await updateStaffShift(selectedStaff.id, targetShift);
      toast.success(`${selectedStaff.fullName} reassigned to ${targetShift}.`);
      setSelectedStaff(null);
      loadStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reassign shift.");
    } finally {
      setSavingShift(false);
    }
  };

  const getShiftStaff = (shiftSub: string) => {
    return staffList.filter((s) => s.shift && s.shift.toLowerCase().includes(shiftSub.toLowerCase()));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary" />
            Staff Assignments & Shift Board
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and distribute daily operational shifts across hotel front desk, housekeeping, and maintenance teams.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => loadStaff()} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Board
        </Button>
      </div>

      {/* Shift Columns Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {SHIFTS.map((shiftDef) => {
          const Icon = shiftDef.icon;
          const assignedMembers = getShiftStaff(shiftDef.id);

          return (
            <div
              key={shiftDef.id}
              className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col"
            >
              {/* Shift Header */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${shiftDef.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{shiftDef.label}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {shiftDef.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-card border border-border text-foreground">
                    {assignedMembers.length}
                  </span>
                </div>
              </div>

              {/* Members List */}
              <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[60vh]">
                {loading ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">Loading...</div>
                ) : assignedMembers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground italic">
                    No staff currently assigned.
                  </div>
                ) : (
                  assignedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-xl bg-background border border-border/80 hover:border-primary/40 shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-xs">{member.fullName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                          {member.staffCode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                        <span className="truncate max-w-[120px]">{member.departmentName || "General"}</span>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[10px] gap-1 hover:text-primary"
                          onClick={() => {
                            setSelectedStaff(member);
                            setTargetShift(member.shift || shiftDef.fullValue);
                          }}
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          Change
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassign Shift Dialog */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6">
            <h3 className="text-base font-bold text-foreground">Reassign Shift Schedule</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select new shift schedule for <span className="font-semibold text-foreground">{selectedStaff.fullName}</span> ({selectedStaff.staffCode}).
            </p>

            <div className="mt-4 space-y-2">
              {SHIFTS.map((s) => {
                const isCurrent = targetShift === s.fullValue;
                return (
                  <div
                    key={s.id}
                    onClick={() => setTargetShift(s.fullValue)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isCurrent
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground">{s.time}</p>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-primary" />}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-5">
              <Button variant="outline" size="sm" onClick={() => setSelectedStaff(null)} disabled={savingShift}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleShiftSave} disabled={savingShift} className="gap-2">
                {savingShift ? "Saving..." : "Apply Shift"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
