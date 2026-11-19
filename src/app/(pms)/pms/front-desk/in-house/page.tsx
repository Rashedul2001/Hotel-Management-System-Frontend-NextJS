"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  KeyRound,
  LogOut,
  Phone,
  RefreshCw,
  Search,
  User,
  Users,
  Bed,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getReservations,
  checkOutReservation,
  type Reservation,
} from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { ReservationDetailsModal } from "@/components/pms/reservations/reservation-details-modal";
import { ReassignRoomModal } from "@/components/pms/reservations/reassign-room-modal";
import { toast } from "sonner";

export default function InHouseGuestsPage() {
  const [guests, setGuests] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);

  // Modals
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Reservation | null>(null);

  const fetchInHouse = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReservations({ view: "in-house", limit: 100 });
      setGuests(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load in-house guests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInHouse();
  }, [fetchInHouse]);

  const handleCheckOut = async (item: Reservation) => {
    try {
      setCheckingOutId(item.id);
      await checkOutReservation(item.id);
      toast.success(`Guest ${item.guestName} checked out. Room #${item.roomNumber || ""} marked for cleaning.`);
      fetchInHouse();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Check-out failed");
    } finally {
      setCheckingOutId(null);
    }
  };

  const handleOpenTransfer = (item: Reservation) => {
    setReassignTarget(item);
    setReassignOpen(true);
  };

  const filtered = guests.filter((item) => {
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
              <Users className="h-4 w-4" /> Front Desk Operational Roster
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              In-House Guests Roster
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Currently staying guests occupying physical room inventory. Manage stay extensions, room transfers, and checkouts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pms/front-desk/room-transfers">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 shadow-2xs">
              <ArrowRightLeft className="w-3.5 h-3.5 text-primary" /> Room Transfers
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search in-house guests by room, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold px-2">
            {filtered.length} currently in-house
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInHouse}
            disabled={loading}
            className="h-9 w-9 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Roster Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Loading in-house guests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground p-6 rounded-3xl border border-dashed border-border bg-card">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
          <h4 className="font-bold text-sm text-foreground">No in-house guests found</h4>
          <p className="text-xs mt-1">There are currently no active in-house stays.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 font-black text-base">
                    #{item.roomNumber || "—"}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{item.guestName}</h4>
                    <span className="font-mono text-[11px] text-muted-foreground block">
                      {item.confirmationNumber}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                  In-House
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-muted/30 border border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Room Unit</span>
                  <span className="font-semibold text-foreground">{item.roomName} ({item.roomCategory})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Phone Contact</span>
                  <span className="font-semibold text-foreground">{item.guestPhone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Check-In Date</span>
                  <span className="font-semibold text-foreground">{item.checkInDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Check-Out Date</span>
                  <span className="font-semibold text-foreground">{item.checkOutDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 gap-2">
                <div className="flex items-center gap-1.5">
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
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenTransfer(item)}
                    className="rounded-xl text-xs h-9 gap-1"
                  >
                    <ArrowRightLeft className="w-3 h-3" /> Transfer
                  </Button>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleCheckOut(item)}
                  disabled={checkingOutId === item.id}
                  className="rounded-xl text-xs font-bold gap-1 bg-amber-600 hover:bg-amber-700 text-white shadow-xs h-9 px-4"
                >
                  {checkingOutId === item.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  Check Out
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <ReservationDetailsModal
        reservation={selectedRes}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onRefresh={fetchInHouse}
        onOpenReassign={(item) => {
          setDetailsOpen(false);
          handleOpenTransfer(item);
        }}
      />

      {/* Transfer Modal */}
      <ReassignRoomModal
        reservation={reassignTarget}
        isOpen={reassignOpen}
        onClose={() => setReassignOpen(false)}
        onSuccess={fetchInHouse}
      />
    </div>
  );
}
