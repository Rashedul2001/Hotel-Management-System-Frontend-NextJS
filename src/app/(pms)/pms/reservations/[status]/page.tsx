"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
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

interface ReservationStatusPageProps {
  params: Promise<{
    status: string;
  }>;
}

export default function ReservationStatusPage({ params }: ReservationStatusPageProps) {
  const { status: rawStatus } = use(params);
  const statusParam = decodeURIComponent(rawStatus);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Reservation | null>(null);

  const getPageTitle = (s: string) => {
    switch (s.toLowerCase()) {
      case "pending":
        return "Pending Reservations";
      case "confirmed":
        return "Confirmed Reservations";
      case "checked-in":
      case "checkedin":
        return "Checked-In (In-House) Reservations";
      case "checked-out":
      case "completed":
        return "Checked-Out / Completed Stays";
      case "cancelled":
        return "Cancelled Reservations";
      case "no-show":
      case "noshow":
        return "No-Show Reservations";
      case "sources":
        return "Reservation Sources & Channels";
      default:
        return `${s.charAt(0).toUpperCase() + s.slice(1)} Reservations`;
    }
  };

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReservations({
        status: statusParam === "sources" ? undefined : statusParam,
        search: searchTerm.trim() || undefined,
        limit: 100,
      });
      setReservations(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [statusParam, searchTerm]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleFastCheckIn = async (item: Reservation) => {
    try {
      await checkInReservation(item.id);
      toast.success(`Guest ${item.guestName} checked in to Room #${item.roomNumber}!`);
      fetchReservations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to check in guest");
    }
  };

  const handleFastCheckOut = async (item: Reservation) => {
    try {
      await checkOutReservation(item.id);
      toast.success(`Guest ${item.guestName} checked out. Room marked for cleaning.`);
      fetchReservations();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to check out guest");
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
          <Link href="/pms/reservations">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              <CalendarCheck className="h-4 w-4" /> Filtered Reservation View
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {getPageTitle(statusParam)}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Showing active records matching status <span className="font-semibold text-primary">{statusParam}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs px-4"
          >
            <Plus className="w-4 h-4" /> New Reservation
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
            {reservations.length} record{reservations.length === 1 ? "" : "s"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchReservations}
            disabled={loading}
            className="h-9 w-9 p-0 rounded-xl"
            title="Refresh"
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

      {/* Create Modal */}
      <CreateReservationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchReservations}
      />

      {/* Reassign Modal */}
      <ReassignRoomModal
        reservation={reassignTarget}
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        onSuccess={fetchReservations}
      />
    </div>
  );
}
