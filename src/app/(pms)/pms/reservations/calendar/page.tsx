"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Bed,
  CheckCircle2,
  LogIn,
  LogOut,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCalendarTapeChart,
  getReservationById,
  type CalendarData,
  type CalendarRoom,
  type CalendarBooking,
  type Reservation,
} from "@/lib/reservations-api";
import { ReservationDetailsModal } from "@/components/pms/reservations/reservation-details-modal";
import { CreateReservationModal } from "@/components/pms/reservations/create-reservation-modal";
import { toast } from "sonner";

export default function ReservationCalendarPage() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCalendarTapeChart(currentYear, currentMonth);
      setCalendarData(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  const handleBookingClick = async (bookingId: string) => {
    try {
      const fullRes = await getReservationById(bookingId);
      setSelectedReservation(fullRes);
      setDetailsModalOpen(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to open reservation details");
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = calendarData?.daysInMonth || 30;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter rooms
  const filteredRooms = (calendarData?.rooms || []).filter((r) => {
    if (categoryFilter !== "all" && r.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.roomNumber.toString().includes(term) ||
        r.name.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const getBookingForRoomAndDay = (roomId: string, day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return (calendarData?.bookings || []).find((b) => {
      if (b.roomId !== roomId) return false;
      // b.checkInDate is YYYY-MM-DD or DD/MM/YYYY
      // Normalize
      const inDate = parseDateString(b.checkInDate);
      const outDate = parseDateString(b.checkOutDate);
      const cellDate = new Date(currentYear, currentMonth - 1, day);

      return cellDate >= inDate && cellDate < outDate;
    });
  };

  const parseDateString = (str: string): Date => {
    if (!str) return new Date();
    if (str.includes("/")) {
      const [d, m, y] = str.split("/").map(Number);
      return new Date(y, m - 1, d);
    }
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "checked-in":
      case "checkedin":
        return "bg-emerald-600 text-white hover:bg-emerald-700";
      case "confirmed":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "completed":
      case "checked-out":
        return "bg-slate-500 text-white hover:bg-slate-600";
      case "pending":
      default:
        return "bg-amber-500 text-white hover:bg-amber-600";
    }
  };

  const isToday = (day: number) => {
    const t = new Date();
    return t.getFullYear() === currentYear && t.getMonth() + 1 === currentMonth && t.getDate() === day;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/pms/reservations">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              <CalendarIcon className="h-3.5 w-3.5" /> Front Office Tape Chart
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Reservation Calendar
            </h1>
          </div>
        </div>

        {/* Month Navigation & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-2xl border border-border bg-card p-1 shadow-2xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="px-3 text-xs font-bold min-w-[140px] text-center text-foreground">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0 rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToday}
            className="rounded-xl text-xs h-9"
          >
            Today
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs h-9"
          >
            <Plus className="w-3.5 h-3.5" /> New Reservation
          </Button>
        </div>
      </div>

      {/* Legend & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border">
        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-600 shrink-0" />
            <span className="text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-600 shrink-0" />
            <span className="text-muted-foreground">In-House</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-500 shrink-0" />
            <span className="text-muted-foreground">Checked-Out</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
            <span className="text-muted-foreground">Pending</span>
          </div>
        </div>

        {/* Filter controls */}
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
            onClick={fetchCalendar}
            disabled={loading}
            className="h-9 w-9 p-0 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Tape Chart Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Compiling room reservation calendar...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            {/* Header Row: Room Info + Day Numbers */}
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-bold">
                <th className="py-3 px-4 min-w-[200px] sticky left-0 bg-muted/90 backdrop-blur-sm z-20 border-r border-border">
                  Room Unit
                </th>
                {daysArray.map((day) => {
                  const todayCol = isToday(day);
                  return (
                    <th
                      key={day}
                      className={`py-2 px-1 text-center min-w-[38px] border-r border-border/50 ${
                        todayCol ? "bg-primary/20 text-primary font-black" : "text-muted-foreground"
                      }`}
                    >
                      <span className="block text-[9px] uppercase font-medium">
                        {new Date(currentYear, currentMonth - 1, day).toLocaleDateString("en-US", { weekday: "narrow" })}
                      </span>
                      <span>{day}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Room Rows */}
            <tbody className="divide-y divide-border/60">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-muted/20 transition-colors">
                  {/* Sticky Room Label */}
                  <td className="py-2.5 px-4 sticky left-0 bg-card z-10 border-r border-border">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground text-xs px-2 py-0.5 rounded-lg bg-primary/10 text-primary">
                        #{room.roomNumber}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate max-w-[120px]" title={room.name}>
                          {room.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {room.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Day Cells */}
                  {daysArray.map((day) => {
                    const booking = getBookingForRoomAndDay(room.id, day);
                    const todayCell = isToday(day);

                    return (
                      <td
                        key={day}
                        className={`p-0.5 text-center border-r border-border/40 relative h-10 ${
                          todayCell ? "bg-primary/5" : ""
                        }`}
                      >
                        {booking ? (
                          <div
                            onClick={() => handleBookingClick(booking.id)}
                            className={`w-full h-8 rounded-lg p-1 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all shadow-2xs truncate ${getStatusColor(
                              booking.status
                            )}`}
                            title={`${booking.confirmationNumber} — ${booking.guestName} (${booking.checkInDate} to ${booking.checkOutDate})`}
                          >
                            <span className="truncate">{booking.guestName.split(" ")[0]}</span>
                          </div>
                        ) : (
                          <div
                            onClick={() => setCreateModalOpen(true)}
                            className="w-full h-8 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group flex items-center justify-center"
                            title={`Book Room #${room.roomNumber} for day ${day}`}
                          >
                            <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reservation Details Modal */}
      <ReservationDetailsModal
        reservation={selectedReservation}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onRefresh={fetchCalendar}
      />

      {/* Create Reservation Modal */}
      <CreateReservationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchCalendar}
      />
    </div>
  );
}
