"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Users,
  Bed,
  ArrowRightLeft,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getReservations,
  checkInReservation,
  checkOutReservation,
  type Reservation,
} from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { ReservationsTable } from "@/components/pms/reservations/reservations-table";
import { ReservationDetailsModal } from "@/components/pms/reservations/reservation-details-modal";
import { CreateReservationModal } from "@/components/pms/reservations/create-reservation-modal";
import { ReassignRoomModal } from "@/components/pms/reservations/reassign-room-modal";
import { toast } from "sonner";

interface FrontDeskSectionProps {
  params: Promise<{
    section: string;
  }>;
}

export default function FrontDeskSectionPage({ params }: FrontDeskSectionProps) {
  const { section: rawSection } = use(params);
  const section = decodeURIComponent(rawSection);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Reservation | null>(null);

  const getSectionTitle = (s: string) => {
    switch (s.toLowerCase()) {
      case "arrivals":
      case "check-in":
        return "Expected Arrivals & Check-In Queue";
      case "departures":
      case "check-out":
        return "Departures & Check-Out Queue";
      case "in-house":
        return "Currently In-House Guests";
      case "walk-in":
        return "Walk-In Guest Registrations";
      case "room-assignments":
      case "room-transfers":
        return "Room Assignments & Transfers";
      case "cashier":
        return "Front Desk Cashier & Billing";
      default:
        return `${s.charAt(0).toUpperCase() + s.slice(1)} Operations`;
    }
  };

  const getViewParam = (s: string) => {
    switch (s.toLowerCase()) {
      case "arrivals":
      case "check-in":
        return "arrivals";
      case "departures":
      case "check-out":
        return "departures";
      case "in-house":
        return "in-house";
      default:
        return undefined;
    }
  };

  const fetchSectionData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReservations({
        view: getViewParam(section) as "arrivals" | "departures" | "in-house" | undefined,
        search: searchTerm.trim() || undefined,
        limit: 100,
      });
      setReservations(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load front desk data");
    } finally {
      setLoading(false);
    }
  }, [section, searchTerm]);

  useEffect(() => {
    fetchSectionData();
    if (section.toLowerCase() === "walk-in") {
      setCreateModalOpen(true);
    }
  }, [section, fetchSectionData]);

  const handleCheckIn = async (item: Reservation) => {
    try {
      await checkInReservation(item.id);
      toast.success(`Guest ${item.guestName} checked in to Room #${item.roomNumber}!`);
      fetchSectionData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
    }
  };

  const handleCheckOut = async (item: Reservation) => {
    try {
      await checkOutReservation(item.id);
      toast.success(`Guest ${item.guestName} checked out. Room marked for housekeeping.`);
      fetchSectionData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Check-out failed");
    }
  };

  const handleOpenReassign = (item: Reservation) => {
    setReassignTarget(item);
    setReassignModalOpen(true);
  };

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
              {getSectionTitle(section)}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Real-time operational queue for front desk staff.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs px-4"
          >
            <Plus className="w-4 h-4" /> New Booking
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold px-2">
            {reservations.length} stay{reservations.length === 1 ? "" : "s"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSectionData}
            disabled={loading}
            className="h-9 w-9 p-0 rounded-xl"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <ReservationsTable
        reservations={reservations}
        loading={loading}
        onSelect={(item) => {
          setSelectedRes(item);
          setDetailsModalOpen(true);
        }}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onReassign={handleOpenReassign}
      />

      {/* Details Modal */}
      <ReservationDetailsModal
        reservation={selectedRes}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onRefresh={fetchSectionData}
        onOpenReassign={(item) => {
          setDetailsModalOpen(false);
          handleOpenReassign(item);
        }}
      />

      {/* Create Modal */}
      <CreateReservationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchSectionData}
        defaultStatus={section.toLowerCase() === "walk-in" ? "CheckedIn" : "Confirmed"}
      />

      {/* Reassign Modal */}
      <ReassignRoomModal
        reservation={reassignTarget}
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        onSuccess={fetchSectionData}
      />
    </div>
  );
}
