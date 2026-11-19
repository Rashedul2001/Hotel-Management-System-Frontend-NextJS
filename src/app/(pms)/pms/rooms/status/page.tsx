"use client";

import { useEffect, useState } from "react";
import {
  BedDouble,
  CheckCircle2,
  Users,
  Brush,
  Wrench,
  Ban,
  Search,
  RotateCcw,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { errorToast, successToast } from "@/components/ui/toast";
import { getRooms, updateRoomStatus } from "@/lib/admin-rooms-api";
import { formatCurrency } from "@/lib/utils";
import type { Room, RoomStatus } from "@/types/room";

const ALL_STATUSES: RoomStatus[] = [
  "Available",
  "Occupied",
  "Cleaning",
  "Maintenance",
  "Blocked",
];

function statusColor(status: string) {
  switch (status) {
    case "Available":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "Occupied":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "Cleaning":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "Maintenance":
      return "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400";
    case "Blocked":
      return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export default function RoomStatusPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms({ pageSize: 100 });
      setRooms(data.rooms);
    } catch (err: any) {
      errorToast("Error", err.message || "Failed to load room statuses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleStatusChange = async (room: Room, nextStatus: RoomStatus) => {
    if (room.status === nextStatus) return;

    try {
      setUpdatingId(room.id);
      const updated = await updateRoomStatus(room.id, nextStatus);
      setRooms((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, status: updated.status } : r))
      );
      successToast(
        "Status Changed",
        `Room ${room.roomNumber} updated from ${room.status} to ${nextStatus}.`
      );
    } catch (err: any) {
      errorToast("Update Failed", err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status Counts
  const counts = {
    Available: rooms.filter((r) => r.status === "Available").length,
    Occupied: rooms.filter((r) => r.status === "Occupied").length,
    Cleaning: rooms.filter((r) => r.status === "Cleaning").length,
    Maintenance: rooms.filter((r) => r.status === "Maintenance").length,
    Blocked: rooms.filter((r) => r.status === "Blocked").length,
  };

  const filtered = rooms.filter((r) => {
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      String(r.roomNumber).includes(search.trim());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <BedDouble className="size-4" />
            Rooms & Rates Settings
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Room Status Board
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor room operational states and rapidly toggle status for housekeeping, maintenance, and guest check-ins.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRooms}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition self-start sm:self-auto"
        >
          <RotateCcw className="size-3.5" />
          Refresh Board
        </button>
      </div>

      {/* Status KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter("Available")}
          className={`flex flex-col rounded-2xl border p-4 text-left transition ${
            statusFilter === "Available"
              ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Available</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <span className="mt-2 text-2xl font-bold text-foreground">{counts.Available}</span>
          <span className="text-[11px] text-muted-foreground">Ready for guests</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Occupied")}
          className={`flex flex-col rounded-2xl border p-4 text-left transition ${
            statusFilter === "Occupied"
              ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Occupied</span>
            <Users className="size-4 text-blue-500" />
          </div>
          <span className="mt-2 text-2xl font-bold text-foreground">{counts.Occupied}</span>
          <span className="text-[11px] text-muted-foreground">Checked-in stay</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Cleaning")}
          className={`flex flex-col rounded-2xl border p-4 text-left transition ${
            statusFilter === "Cleaning"
              ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Cleaning</span>
            <Brush className="size-4 text-amber-500" />
          </div>
          <span className="mt-2 text-2xl font-bold text-foreground">{counts.Cleaning}</span>
          <span className="text-[11px] text-muted-foreground">Housekeeping</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Maintenance")}
          className={`flex flex-col rounded-2xl border p-4 text-left transition ${
            statusFilter === "Maintenance"
              ? "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Maintenance</span>
            <Wrench className="size-4 text-orange-500" />
          </div>
          <span className="mt-2 text-2xl font-bold text-foreground">{counts.Maintenance}</span>
          <span className="text-[11px] text-muted-foreground">Service needed</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("Blocked")}
          className={`flex flex-col rounded-2xl border p-4 text-left transition ${
            statusFilter === "Blocked"
              ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/20"
              : "border-border bg-card hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-600 dark:text-red-400">Blocked</span>
            <Ban className="size-4 text-red-500" />
          </div>
          <span className="mt-2 text-2xl font-bold text-foreground">{counts.Blocked}</span>
          <span className="text-[11px] text-muted-foreground">Out of order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search room number, name, or floor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("All")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({rooms.length})
          </button>
        </div>
      </div>

      {/* Room Status Cards Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card">
          <p>No rooms found matching "{statusFilter}".</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => {
            const isUpdating = updatingId === room.id;

            return (
              <div
                key={room.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Floor {room.floor} • {room.category}
                      </span>
                      <h3 className="text-lg font-bold text-foreground mt-0.5">
                        Room {room.roomNumber}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {room.name}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor(
                        room.status
                      )}`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                    <span>{room.capacity} Guests • {room.bedType}</span>
                    <span className="font-semibold text-foreground">{formatCurrency(room.price)}/night</span>
                  </div>
                </div>

                {/* Quick Status Selector */}
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                    Set Room Status:
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {ALL_STATUSES.map((st) => {
                      const isActive = room.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(room, st)}
                          title={`Set to ${st}`}
                          className={`rounded-lg py-1.5 text-[10px] font-semibold transition border ${
                            isActive
                              ? "bg-foreground text-background border-foreground font-bold shadow-xs"
                              : "bg-muted/60 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {st.slice(0, 4)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
