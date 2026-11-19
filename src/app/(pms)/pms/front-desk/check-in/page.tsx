"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  LogIn,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  Bed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getReservations,
  checkInReservation,
  type Reservation,
} from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { ReservationDetailsModal } from "@/components/pms/reservations/reservation-details-modal";
import { ReassignRoomModal } from "@/components/pms/reservations/reassign-room-modal";
import { toast } from "sonner";

export default function CheckInOperationsPage() {
  const [arrivals, setArrivals] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // Modals
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Reservation | null>(null);

  const fetchArrivals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReservations({ view: "arrivals", limit: 100 });
      setArrivals(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load arrivals queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArrivals();
  }, [fetchArrivals]);

  const handleCheckIn = async (res: Reservation) => {
    try {
      setCheckingInId(res.id);
      await checkInReservation(res.id);
      toast.success(`Check-In Completed! Guest ${res.guestName} assigned to Room #${res.roomNumber || ""}. Key issued.`);
      fetchArrivals();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setCheckingInId(null);
    }
  };

  const filtered = arrivals.filter((item) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      item.guestName.toLowerCase().includes(term) ||
      item.guestPhone.toLowerCase().includes(term) ||
      item.confirmationNumber.toLowerCase().includes(term) ||
      (item.roomNumber && item.roomNumber.toString().includes(term))
    );
  });

  const pendingArrivals = filtered.filter(
    (r) => r.status.toLowerCase() !== "checked-in" && r.status.toLowerCase() !== "checkedin"
  );
  const completedArrivals = filtered.filter(
    (r) => r.status.toLowerCase() === "checked-in" || r.status.toLowerCase() === "checkedin"
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/pms/front-desk">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              <KeyRound className="h-4 w-4" /> Front Desk Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Express Check-In Console
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Process guest arrivals, verify registration cards, assign physical room keys, and activate in-house status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pms/front-desk/walk-in">
            <Button size="sm" className="rounded-xl text-xs font-bold gap-1.5 bg-primary shadow-xs">
              <LogIn className="w-3.5 h-3.5" /> Walk-In Check-In
            </Button>
          </Link>
        </div>
      </div>

      {/* Fast Search & Lookup Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-primary" /> Guest & Reservation Lookup
        </span>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Confirmation Code (e.g. VEL-...), Guest Name, Phone Number, or Room #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl h-11 text-xs"
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchArrivals}
            disabled={loading}
            className="rounded-2xl h-11 px-4 text-xs gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} /> Refresh Queue
          </Button>
        </div>
      </div>

      {/* Main Check-In Queues */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Loading check-in queue...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Arrivals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-bold text-xs">
                  {pendingArrivals.length}
                </span>
                Pending Check-Ins Due Today
              </h3>
            </div>

            {pendingArrivals.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/60 text-muted-foreground text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                <p className="font-semibold text-foreground text-sm">All Scheduled Arrivals Checked In!</p>
                <p className="mt-1">No pending arrivals remaining for today. Use Walk-In Check-In for unregistered guests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingArrivals.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-2 rounded-2xl bg-primary/10 text-primary font-black text-base">
                          #{item.roomNumber || "—"}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{item.guestName}</h4>
                          <span className="font-mono text-[11px] text-muted-foreground block">
                            {item.confirmationNumber}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600">
                        {item.roomCategory}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-muted/30 border border-border/60">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Expected Arrival</span>
                        <span className="font-semibold text-foreground">{item.arrivalTime || "14:00 (Standard)"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Stay Duration</span>
                        <span className="font-semibold text-foreground">{item.nights} Nights ({item.guestsCount} Guests)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Phone Number</span>
                        <span className="font-semibold text-foreground">{item.guestPhone || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Folio Total</span>
                        <span className="font-bold text-primary">{formatBDT(item.totalPrice)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRes(item);
                          setDetailsOpen(true);
                        }}
                        className="rounded-xl text-xs h-9"
                      >
                        View Folio
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(item)}
                        disabled={checkingInId === item.id}
                        className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs h-9 px-4"
                      >
                        {checkingInId === item.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LogIn className="w-3.5 h-3.5" />
                        )}
                        Execute Check-In
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Already Checked-In Today */}
          {completedArrivals.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Completed Check-Ins Today ({completedArrivals.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {completedArrivals.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedRes(item);
                      setDetailsOpen(true);
                    }}
                    className="p-3.5 rounded-2xl bg-card border border-border/70 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-foreground block">{item.guestName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        Room #{item.roomNumber} • {item.confirmationNumber}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      In-House
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <ReservationDetailsModal
        reservation={selectedRes}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onRefresh={fetchArrivals}
        onOpenReassign={(item) => {
          setDetailsOpen(false);
          setReassignTarget(item);
          setReassignOpen(true);
        }}
      />

      {/* Reassign Modal */}
      <ReassignRoomModal
        reservation={reassignTarget}
        isOpen={reassignOpen}
        onClose={() => setReassignOpen(false)}
        onSuccess={fetchArrivals}
      />
    </div>
  );
}
