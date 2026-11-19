"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Filter,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getReservations,
  checkInReservation,
  checkOutReservation,
  type Reservation,
} from "@/lib/reservations-api";
import { ReservationsTable } from "@/components/pms/reservations/reservations-table";
import { ReservationDetailsModal } from "@/components/pms/reservations/reservation-details-modal";
import { CreateReservationModal } from "@/components/pms/reservations/create-reservation-modal";
import { ReassignRoomModal } from "@/components/pms/reservations/reassign-room-modal";
import { toast } from "sonner";
import Link from "next/link";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modals state
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Reservation | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReservations({
        status: activeTab !== "all" ? activeTab : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        search: searchTerm.trim() || undefined,
        limit: 100,
      });
      setReservations(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [activeTab, categoryFilter, searchTerm]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Fast check-in from table
  const handleFastCheckIn = async (item: Reservation) => {
    try {
      await checkInReservation(item.id);
      toast.success(`Guest ${item.guestName} successfully checked in to Room #${item.roomNumber}!`);
      fetchReservations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to check in guest");
    }
  };

  // Fast check-out from table
  const handleFastCheckOut = async (item: Reservation) => {
    try {
      await checkOutReservation(item.id);
      toast.success(`Guest ${item.guestName} checked out. Room #${item.roomNumber} marked for cleaning.`);
      fetchReservations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to check out guest");
    }
  };

  const handleOpenReassign = (item: Reservation) => {
    setReassignTarget(item);
    setReassignModalOpen(true);
  };

  // Status counts for quick KPI cards
  const totalCount = reservations.length;
  const confirmedCount = reservations.filter((r) => r.status.toLowerCase() === "confirmed").length;
  const inHouseCount = reservations.filter(
    (r) => r.status.toLowerCase() === "checked-in" || r.status.toLowerCase() === "checkedin"
  ).length;
  const completedCount = reservations.filter(
    (r) => r.status.toLowerCase() === "completed" || r.status.toLowerCase() === "checked-out"
  ).length;
  const pendingCount = reservations.filter((r) => r.status.toLowerCase() === "pending").length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            <CalendarCheck className="h-4 w-4" /> Front Office & Reservations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Reservation Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Review guest bookings, execute check-ins, manage room assignments, and handle front office folios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/pms/reservations/calendar">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Tape Chart Calendar
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs px-4"
          >
            <Plus className="w-4 h-4" /> New Reservation
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setActiveTab("all")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-primary/10 border-primary text-primary shadow-xs"
              : "bg-card border-border hover:bg-muted/30"
          }`}
        >
          <span className="text-[11px] font-semibold text-muted-foreground block">All Stays</span>
          <p className="text-xl font-extrabold mt-1 text-foreground">{totalCount}</p>
        </div>

        <div
          onClick={() => setActiveTab("confirmed")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "confirmed"
              ? "bg-blue-500/10 border-blue-500 text-blue-600 shadow-xs"
              : "bg-card border-border hover:bg-muted/30"
          }`}
        >
          <span className="text-[11px] font-semibold text-muted-foreground block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-500" /> Confirmed
          </span>
          <p className="text-xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">{confirmedCount}</p>
        </div>

        <div
          onClick={() => setActiveTab("checked-in")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "checked-in"
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-xs"
              : "bg-card border-border hover:bg-muted/30"
          }`}
        >
          <span className="text-[11px] font-semibold text-muted-foreground block flex items-center gap-1">
            <LogIn className="w-3 h-3 text-emerald-500" /> In-House
          </span>
          <p className="text-xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{inHouseCount}</p>
        </div>

        <div
          onClick={() => setActiveTab("completed")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "completed"
              ? "bg-slate-500/10 border-slate-500 text-slate-600 shadow-xs"
              : "bg-card border-border hover:bg-muted/30"
          }`}
        >
          <span className="text-[11px] font-semibold text-muted-foreground block flex items-center gap-1">
            <LogOut className="w-3 h-3 text-slate-500" /> Checked-Out
          </span>
          <p className="text-xl font-extrabold mt-1 text-slate-600 dark:text-slate-400">{completedCount}</p>
        </div>

        <div
          onClick={() => setActiveTab("pending")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-amber-500/10 border-amber-500 text-amber-600 shadow-xs"
              : "bg-card border-border hover:bg-muted/30"
          }`}
        >
          <span className="text-[11px] font-semibold text-muted-foreground block flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" /> Pending
          </span>
          <p className="text-xl font-extrabold mt-1 text-amber-600 dark:text-amber-400">{pendingCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by guest, phone, email, booking code, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 rounded-xl text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs"
          >
            <option value="all">All Room Categories</option>
            <option value="Deluxe">Deluxe Room</option>
            <option value="Executive">Executive Suite</option>
            <option value="Family">Family Room</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Standard">Standard Room</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchReservations}
            disabled={loading}
            className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-foreground"
            title="Refresh Table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <ReservationsTable
        reservations={reservations}
        loading={loading}
        onSelect={(item) => {
          setSelectedReservation(item);
          setDetailsOpen(true);
        }}
        onCheckIn={handleFastCheckIn}
        onCheckOut={handleFastCheckOut}
        onReassign={handleOpenReassign}
      />

      {/* Details Modal */}
      <ReservationDetailsModal
        reservation={selectedReservation}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onRefresh={fetchReservations}
        onOpenReassign={(item) => {
          setDetailsOpen(false);
          handleOpenReassign(item);
        }}
      />

      {/* Create Reservation Modal */}
      <CreateReservationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchReservations}
      />

      {/* Reassign Room Modal */}
      <ReassignRoomModal
        reservation={reassignTarget}
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        onSuccess={fetchReservations}
      />
    </div>
  );
}
