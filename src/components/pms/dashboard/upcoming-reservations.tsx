"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookmarkCheck, CalendarDays, ExternalLink } from "lucide-react";
import { formatBDT } from "@/lib/dashboard-api";
import { cn } from "@/lib/utils";
import type { UpcomingReservation } from "@/types/dashboard";

interface UpcomingReservationsProps {
  reservations: UpcomingReservation[];
}

export function UpcomingReservations({ reservations }: UpcomingReservationsProps) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookmarkCheck className="size-4" />
            </div>
            <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground">
              Upcoming Reservations Pipeline
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Confirmed arrivals scheduled for upcoming days
          </p>
        </div>

        <Link
          href="/pms/reservations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
        >
          Manage All Reservations
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Reservations Table / Cards */}
      {reservations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center">
          <CalendarDays className="size-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm font-semibold text-foreground">No upcoming bookings</p>
          <p className="text-xs text-muted-foreground mt-1">
            New confirmed bookings will appear here as they are created.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-medium">
                <th className="pb-3 font-semibold">Guest & Reference</th>
                <th className="pb-3 font-semibold">Room & Category</th>
                <th className="pb-3 font-semibold">Stay Dates</th>
                <th className="pb-3 font-semibold">Nights</th>
                <th className="pb-3 font-semibold">Booking Value</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {reservations.map((res) => {
                const isConfirmed = res.status === "Confirmed";
                return (
                  <tr
                    key={res.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    {/* Guest & Reference */}
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-foreground">
                        {res.guestName}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {res.reservationReference}
                      </div>
                    </td>

                    {/* Room Category */}
                    <td className="py-3 pr-3 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {res.roomCategory}
                      </span>
                      {res.assignedRoomNumber ? (
                        <span className="ml-1 text-[11px] text-muted-foreground">
                          (Room {res.assignedRoomNumber})
                        </span>
                      ) : (
                        <span className="ml-1 text-[10px] italic text-muted-foreground">
                          (Unassigned)
                        </span>
                      )}
                    </td>

                    {/* Stay Dates */}
                    <td className="py-3 pr-3">
                      <div className="font-medium text-foreground">
                        {res.arrivalDate}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        to {res.departureDate}
                      </div>
                    </td>

                    {/* Nights */}
                    <td className="py-3 pr-3 font-medium text-foreground">
                      {res.nights} {res.nights === 1 ? "night" : "nights"}
                    </td>

                    {/* Total Price */}
                    <td className="py-3 pr-3 font-bold text-foreground">
                      {formatBDT(res.totalPrice)}
                    </td>

                    {/* Status */}
                    <td className="py-3 pr-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                          isConfirmed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            isConfirmed ? "bg-emerald-500" : "bg-amber-500"
                          )}
                        />
                        {res.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 text-right">
                      <Link
                        href="/pms/reservations"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        Details
                        <ExternalLink className="size-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
