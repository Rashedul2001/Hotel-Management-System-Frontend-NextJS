"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  Bed,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  KeyRound,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getReservations,
  type Reservation,
} from "@/lib/reservations-api";
import { getRooms, type Room } from "@/lib/admin-rooms-api";
import { formatBDT } from "@/lib/dashboard-api";
import { ReassignRoomModal } from "@/components/pms/reservations/reassign-room-modal";
import { ReservationDetailsModal } from "@/components/pms/reservations/reservation-details-modal";
import { toast } from "sonner";

export default function RoomAssignmentsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Reservation | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resList, roomData] = await Promise.all([
        getReservations({ limit: 100 }),
        getRooms({ pageSize: 100 }),
      ]);
      setReservations(resList.filter((r) => r.status.toLowerCase() !== "cancelled"));
      setRooms(roomData.rooms || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load room assignments data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAssign = (item: Reservation) => {
    setReassignTarget(item);
    setReassignOpen(true);
  };

  const filtered = reservations.filter((r) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      r.guestName.toLowerCase().includes(term) ||
      r.confirmationNumber.toLowerCase().includes(term) ||
      (r.roomNumber && r.roomNumber.toString().includes(term))
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
              <KeyRound className="h-4 w-4" /> Front Desk Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Room Assignment Console
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Assign and balance physical room units, coordinate floor allocation, and handle room change requests.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pms/reservations/calendar">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Full Tape Chart
            </Button>
          </Link>
        </div>
      </div>

      {/* Room Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-xs text-muted-foreground block font-semibold">Total Physical Rooms</span>
          <p className="text-xl font-black mt-1 text-foreground">{rooms.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-xs text-muted-foreground block font-semibold">Ready & Available</span>
          <p className="text-xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
            {rooms.filter((r) => r.status.toLowerCase() === "available").length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-xs text-muted-foreground block font-semibold">Occupied by In-House</span>
          <p className="text-xl font-black mt-1 text-blue-600 dark:text-blue-400">
            {rooms.filter((r) => r.status.toLowerCase() === "occupied").length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-xs text-muted-foreground block font-semibold">Housekeeping Cleaning</span>
          <p className="text-xl font-black mt-1 text-amber-600 dark:text-amber-400">
            {rooms.filter((r) => r.status.toLowerCase() === "cleaning").length}
          </p>
        </div>
      </div>

      {/* Search & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Room #, Guest, or Booking Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="h-9 w-9 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Assignments Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Loading assignments data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">Assigned Room</th>
                <th className="py-3 px-4">Guest Information</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Category & Floor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Reassign Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary font-bold text-sm">
                        #{item.roomNumber || "Unassigned"}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-foreground block">{item.guestName}</span>
                    <span className="text-[10px] text-muted-foreground">{item.confirmationNumber}</span>
                  </td>

                  <td className="py-3.5 px-4 text-foreground">
                    <span>{item.checkInDate} &rarr; {item.checkOutDate}</span>
                    <span className="text-[10px] text-muted-foreground block">{item.nights} nights</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-foreground">{item.roomCategory}</span>
                    <span className="text-[10px] text-muted-foreground block">Floor {item.floor || "—"}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-primary/10 text-primary">
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenAssign(item)}
                      className="rounded-xl text-xs gap-1.5 h-8"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Reassign
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <ReassignRoomModal
        reservation={reassignTarget}
        isOpen={reassignOpen}
        onClose={() => setReassignOpen(false)}
        onSuccess={fetchData}
      />

      <ReservationDetailsModal
        reservation={selectedRes}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onRefresh={fetchData}
      />
    </div>
  );
}
