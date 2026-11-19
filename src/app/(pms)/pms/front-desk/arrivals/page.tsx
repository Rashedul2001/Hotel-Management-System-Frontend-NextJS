"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  LogIn,
  Phone,
  RefreshCw,
  Search,
  User,
  Bed,
  Plus,
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
import { CreateReservationModal } from "@/components/pms/reservations/create-reservation-modal";
import { toast } from "sonner";

export default function ArrivalsPage() {
  const [arrivals, setArrivals] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // Modals
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Reservation | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchArrivals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReservations({ view: "arrivals", limit: 100 });
      setArrivals(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load arrivals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArrivals();
  }, [fetchArrivals]);

  const handleCheckIn = async (item: Reservation) => {
    try {
      setCheckingInId(item.id);
      await checkInReservation(item.id);
      toast.success(`Check-In complete! Guest ${item.guestName} assigned to Room #${item.roomNumber || ""}.`);
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
              <LogIn className="h-4 w-4" /> Front Desk Operational Queue
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Today&apos;s Arrivals
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Incoming guests scheduled to check in today. Verify guest identities and issue room keys.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> New Arrival
          </Button>
        </div>
      </div>

      {/* Search & Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search arrivals by guest, room, phone, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold px-2">
            {filtered.length} arrival{filtered.length === 1 ? "" : "s"} today
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchArrivals}
            disabled={loading}
            className="h-9 w-9 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Arrivals List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Loading arrivals feed...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground p-6 rounded-3xl border border-dashed border-border bg-card">
          <LogIn className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-500" />
          <h4 className="font-bold text-sm text-foreground">No arrivals scheduled</h4>
          <p className="text-xs mt-1">There are no pending arrivals scheduled for today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isCheckedIn = item.status.toLowerCase() === "checked-in" || item.status.toLowerCase() === "checkedin";
            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 rounded-2xl bg-blue-500/10 text-blue-600 font-black text-base">
                      #{item.roomNumber || "—"}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{item.guestName}</h4>
                      <span className="font-mono text-[11px] text-muted-foreground block">
                        {item.confirmationNumber}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isCheckedIn ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                  }`}>
                    {isCheckedIn ? "Checked In" : "Expected Today"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-muted/30 border border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Room Unit</span>
                    <span className="font-semibold text-foreground">{item.roomName} ({item.roomCategory})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Expected Arrival</span>
                    <span className="font-semibold text-foreground">{item.arrivalTime || "14:00 (Standard)"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Stay</span>
                    <span className="font-semibold text-foreground">{item.nights} Nights ({item.guestsCount} Guests)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Total Charge</span>
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
                    View Details
                  </Button>

                  {!isCheckedIn && (
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
                      Check In Guest
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
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

      <ReassignRoomModal
        reservation={reassignTarget}
        isOpen={reassignOpen}
        onClose={() => setReassignOpen(false)}
        onSuccess={fetchArrivals}
      />

      <CreateReservationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchArrivals}
      />
    </div>
  );
}
