"use client";

import React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  LogIn,
  LogOut,
  Mail,
  MoreVertical,
  Phone,
  User,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/dashboard-api";
import type { Reservation } from "@/lib/reservations-api";

interface ReservationsTableProps {
  reservations: Reservation[];
  loading: boolean;
  onSelect: (reservation: Reservation) => void;
  onCheckIn: (reservation: Reservation) => void;
  onCheckOut: (reservation: Reservation) => void;
  onReassign: (reservation: Reservation) => void;
}

export function ReservationsTable({
  reservations,
  loading,
  onSelect,
  onCheckIn,
  onCheckOut,
  onReassign,
}: ReservationsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case "checked-in":
      case "checkedin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <LogIn className="w-3 h-3" /> In-House
          </span>
        );
      case "completed":
      case "checked-out":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <LogOut className="w-3 h-3" /> Checked-Out
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> Cancelled
          </span>
        );
      case "no-show":
      case "noshow":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> No-Show
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p>Loading reservations from PMS database...</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground p-6 rounded-3xl border border-dashed border-border bg-card/50">
        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30 text-primary" />
        <h4 className="font-bold text-base text-foreground">No reservations found</h4>
        <p className="text-xs mt-1 max-w-sm mx-auto">
          No records match the current filter or search criteria. Try adjusting filters or create a new reservation.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
          <tr>
            <th className="py-3 px-4">Booking Code</th>
            <th className="py-3 px-4">Guest Information</th>
            <th className="py-3 px-4">Room & Category</th>
            <th className="py-3 px-4">Stay Dates</th>
            <th className="py-3 px-4">Total & Payment</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {reservations.map((item) => {
            const isConfirmed = item.status.toLowerCase() === "confirmed";
            const isInHouse = item.status.toLowerCase() === "checked-in" || item.status.toLowerCase() === "checkedin";

            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className="hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                {/* Code */}
                <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                  <div className="flex flex-col">
                    <span className="text-primary hover:underline">{item.confirmationNumber}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </td>

                {/* Guest */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.guestName}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-2.5 h-2.5" /> {item.guestPhone || "N/A"}
                    </span>
                  </div>
                </td>

                {/* Room */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
                      #{item.roomNumber || "—"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate max-w-[140px]" title={item.roomName}>
                        {item.roomName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.roomCategory}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Dates */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {item.checkInDate} &rarr; {item.checkOutDate}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.nights} night{item.nights > 1 ? "s" : ""} • {item.guestsCount} guest{item.guestsCount > 1 ? "s" : ""}
                    </span>
                  </div>
                </td>

                {/* Price & Payment */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">
                      {formatBDT(item.totalPrice)}
                    </span>
                    <span className={`text-[10px] font-semibold ${
                      item.paymentStatus?.toLowerCase() === "paid" ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {item.paymentMethod || "Pay at Hotel"} ({item.paymentStatus || "Pending"})
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {getStatusBadge(item.status)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Fast Check-In button if Confirmed */}
                    {isConfirmed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCheckIn(item)}
                        className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl font-bold text-xs gap-1"
                        title="Check In Guest"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Check In
                      </Button>
                    )}

                    {/* Fast Check-Out button if In-House */}
                    {isInHouse && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCheckOut(item)}
                        className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl font-bold text-xs gap-1"
                        title="Check Out Guest"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Check Out
                      </Button>
                    )}

                    {/* Transfer room if active */}
                    {(isConfirmed || isInHouse) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onReassign(item)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-xl"
                        title="Transfer Room"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    {/* View details */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelect(item)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary rounded-xl"
                      title="View Stay Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
