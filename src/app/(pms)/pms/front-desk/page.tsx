"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  Users,
  Bed,
  ArrowRightLeft,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getReservations,
  getFrontDeskSummary,
  checkInReservation,
  checkOutReservation,
  type Reservation,
  type FrontDeskSummary,
} from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { ReservationDetailsModal } from "@/components/pms/reservations/reservation-details-modal";
import { CreateReservationModal } from "@/components/pms/reservations/create-reservation-modal";
import { ReassignRoomModal } from "@/components/pms/reservations/reassign-room-modal";
import { toast } from "sonner";

export default function FrontDeskPage() {
  const [summary, setSummary] = useState<FrontDeskSummary | null>(null);
  const [arrivals, setArrivals] = useState<Reservation[]>([]);
  const [departures, setDepartures] = useState<Reservation[]>([]);
  const [inHouse, setInHouse] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Active operational tab: arrivals | departures | in-house
  const [activeTab, setActiveTab] = useState<"arrivals" | "departures" | "in-house">("arrivals");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [defaultCreateStatus, setDefaultCreateStatus] = useState<"Confirmed" | "CheckedIn">("CheckedIn");
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Reservation | null>(null);

  const fetchFrontDeskData = useCallback(async () => {
    try {
      setLoading(true);
      const [sum, arrList, depList, inhList] = await Promise.all([
        getFrontDeskSummary(),
        getReservations({ view: "arrivals" }),
        getReservations({ view: "departures" }),
        getReservations({ view: "in-house" }),
      ]);
      setSummary(sum);
      setArrivals(arrList);
      setDepartures(depList);
      setInHouse(inhList);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load front desk data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFrontDeskData();
  }, [fetchFrontDeskData]);

  const handleCheckIn = async (res: Reservation) => {
    try {
      await checkInReservation(res.id);
      toast.success(`Guest ${res.guestName} successfully checked in to Room #${res.roomNumber}!`);
      fetchFrontDeskData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  const handleCheckOut = async (res: Reservation) => {
    try {
      await checkOutReservation(res.id);
      toast.success(`Guest ${res.guestName} checked out. Room #${res.roomNumber} marked for cleaning.`);
      fetchFrontDeskData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Check-out failed");
    }
  };

  const handleOpenWalkIn = () => {
    setDefaultCreateStatus("CheckedIn");
    setCreateModalOpen(true);
  };

  const handleOpenReassign = (res: Reservation) => {
    setReassignTarget(res);
    setReassignModalOpen(true);
  };

  // Filter queue by search
  const filterList = (list: Reservation[]) => {
    if (!searchQuery.trim()) return list;
    const term = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        r.guestName.toLowerCase().includes(term) ||
        r.guestPhone.toLowerCase().includes(term) ||
        r.confirmationNumber.toLowerCase().includes(term) ||
        (r.roomNumber && r.roomNumber.toString().includes(term))
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            <KeyRound className="h-4 w-4" /> Front Office Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Front Desk Command Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Execute guest arrivals, room check-ins, departures, walk-in registrations, and room key assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/pms/reservations/calendar">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Tape Chart
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleOpenWalkIn}
            className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs px-4"
          >
            <LogIn className="w-4 h-4" /> Walk-In Check-In
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setDefaultCreateStatus("Confirmed");
              setCreateModalOpen(true);
            }}
            className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs px-4"
          >
            <Plus className="w-4 h-4" /> New Booking
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Arrivals KPI */}
        <div
          onClick={() => setActiveTab("arrivals")}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            activeTab === "arrivals"
              ? "bg-blue-500/10 border-blue-500 text-blue-600 shadow-xs"
              : "bg-card border-border hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <LogIn className="w-4 h-4 text-blue-500" /> Today&apos;s Arrivals
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-600">
              {summary?.arrivals.pending ?? 0} Pending
            </span>
          </div>
          <p className="text-2xl font-black text-foreground mt-1">
            {summary?.arrivals.total ?? arrivals.length}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {summary?.arrivals.checkedIn ?? 0} already checked in
          </span>
        </div>

        {/* Departures KPI */}
        <div
          onClick={() => setActiveTab("departures")}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            activeTab === "departures"
              ? "bg-amber-500/10 border-amber-500 text-amber-600 shadow-xs"
              : "bg-card border-border hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <LogOut className="w-4 h-4 text-amber-500" /> Today&apos;s Departures
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600">
              {summary?.departures.pending ?? 0} Due
            </span>
          </div>
          <p className="text-2xl font-black text-foreground mt-1">
            {summary?.departures.total ?? departures.length}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {summary?.departures.checkedOut ?? 0} checked out
          </span>
        </div>

        {/* In-House Guests KPI */}
        <div
          onClick={() => setActiveTab("in-house")}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            activeTab === "in-house"
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-xs"
              : "bg-card border-border hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" /> In-House Guests
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600">
              Active Stays
            </span>
          </div>
          <p className="text-2xl font-black text-foreground mt-1">
            {summary?.inHouse ?? inHouse.length}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Occupying {summary?.rooms.occupied ?? inHouse.length} rooms
          </span>
        </div>

        {/* Room Occupancy KPI */}
        <div className="p-4 rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-primary" /> Room Occupancy
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary">
              {summary?.rooms.occupancyRate ?? 0}%
            </span>
          </div>
          <p className="text-2xl font-black text-foreground mt-1">
            {summary?.rooms.available ?? 0} Available
          </p>
          <span className="text-[11px] text-muted-foreground">
            Out of {summary?.rooms.total ?? 0} total rooms ({summary?.rooms.cleaning ?? 0} cleaning)
          </span>
        </div>
      </div>

      {/* Operational Queue Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
        {/* Queue Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("arrivals")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "arrivals"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Arrivals Queue
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-card text-foreground">
              {arrivals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("departures")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "departures"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            Departures Queue
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-card text-foreground">
              {departures.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("in-house")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "in-house"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            In-House Guests
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-card text-foreground">
              {inHouse.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl text-xs"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchFrontDeskData}
            disabled={loading}
            className="h-9 w-9 p-0 rounded-xl"
            title="Refresh Queues"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Active Queue List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Loading front desk operations feed...</p>
        </div>
      ) : activeTab === "arrivals" ? (
        /* ARRIVALS QUEUE */
        <div className="space-y-3">
          {filterList(arrivals).length === 0 ? (
            <div className="py-16 text-center text-muted-foreground p-6 rounded-3xl border border-dashed border-border bg-card">
              <LogIn className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-500" />
              <h4 className="font-bold text-sm text-foreground">No arrivals pending today</h4>
              <p className="text-xs mt-1">All scheduled arrivals for today have either been checked in or no new arrivals are due.</p>
            </div>
          ) : (
            filterList(arrivals).map((item) => {
              const isCheckedIn = item.status.toLowerCase() === "checked-in" || item.status.toLowerCase() === "checkedin";
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedRes(item);
                    setDetailsModalOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 font-bold text-sm shrink-0">
                      #{item.roomNumber || "—"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                          {item.guestName}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {item.confirmationNumber}
                        </span>
                        {isCheckedIn ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                            Checked In
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600">
                            Expected Today
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>Room: <strong className="text-foreground">{item.roomName}</strong> ({item.roomCategory})</span>
                        <span>•</span>
                        <span>Arrival: <strong>{item.arrivalTime || "14:00"}</strong></span>
                        <span>•</span>
                        <span>Stay: <strong>{item.nights} Nights</strong> ({item.guestsCount} Guests)</span>
                        <span>•</span>
                        <span>Total: <strong className="text-primary">{formatBDT(item.totalPrice)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!isCheckedIn && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(item)}
                        className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Check In Guest
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReassign(item)}
                      className="rounded-xl text-xs gap-1"
                    >
                      <ArrowRightLeft className="w-3 h-3" /> Reassign
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === "departures" ? (
        /* DEPARTURES QUEUE */
        <div className="space-y-3">
          {filterList(departures).length === 0 ? (
            <div className="py-16 text-center text-muted-foreground p-6 rounded-3xl border border-dashed border-border bg-card">
              <LogOut className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-500" />
              <h4 className="font-bold text-sm text-foreground">No departures due today</h4>
              <p className="text-xs mt-1">No active stays are scheduled for checkout today.</p>
            </div>
          ) : (
            filterList(departures).map((item) => {
              const isCheckedOut = item.status.toLowerCase() === "completed" || item.status.toLowerCase() === "checked-out";
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedRes(item);
                    setDetailsModalOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 font-bold text-sm shrink-0">
                      #{item.roomNumber || "—"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                          {item.guestName}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {item.confirmationNumber}
                        </span>
                        {isCheckedOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600">
                            Completed Checkout
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                            Departure Due Today
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>Room: <strong className="text-foreground">{item.roomName}</strong> (#{item.roomNumber})</span>
                        <span>•</span>
                        <span>Check-out Time: <strong>12:00 Standard</strong></span>
                        <span>•</span>
                        <span>Folio: <strong className="text-foreground">{formatBDT(item.totalPrice)}</strong> ({item.paymentStatus || "Paid"})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!isCheckedOut && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckOut(item)}
                        className="rounded-xl text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Settle & Check Out
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* IN-HOUSE GUESTS */
        <div className="space-y-3">
          {filterList(inHouse).length === 0 ? (
            <div className="py-16 text-center text-muted-foreground p-6 rounded-3xl border border-dashed border-border bg-card">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
              <h4 className="font-bold text-sm text-foreground">No in-house guests currently</h4>
              <p className="text-xs mt-1">Guests will appear here once checked into a room.</p>
            </div>
          ) : (
            filterList(inHouse).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedRes(item);
                  setDetailsModalOpen(true);
                }}
                className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer shadow-2xs group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-sm shrink-0">
                    #{item.roomNumber || "—"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                        {item.guestName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        In-House
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Room: <strong className="text-foreground">{item.roomName}</strong> ({item.roomCategory})</span>
                      <span>•</span>
                      <span>Departing: <strong>{item.checkOutDate}</strong></span>
                      <span>•</span>
                      <span>Phone: <strong>{item.guestPhone || "N/A"}</strong></span>
                      <span>•</span>
                      <span>Charge: <strong className="text-primary">{formatBDT(item.totalPrice)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReassign(item)}
                    className="rounded-xl text-xs gap-1"
                  >
                    <ArrowRightLeft className="w-3 h-3" /> Transfer
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleCheckOut(item)}
                    className="rounded-xl text-xs font-bold gap-1 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Check Out
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <ReservationDetailsModal
        reservation={selectedRes}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onRefresh={fetchFrontDeskData}
        onOpenReassign={(item) => {
          setDetailsModalOpen(false);
          handleOpenReassign(item);
        }}
      />

      <CreateReservationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchFrontDeskData}
        defaultStatus={defaultCreateStatus}
      />

      <ReassignRoomModal
        reservation={reassignTarget}
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        onSuccess={fetchFrontDeskData}
      />
    </div>
  );
}
